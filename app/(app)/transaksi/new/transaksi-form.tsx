"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Kategori, Unit, Profile } from "@/lib/types"

interface TransaksiFormProps {
  profile: Profile
  kategori: Kategori[]
  units: Unit[]
  lockedPeriods: { tahun: number; bulan: number; locked: boolean }[]
}

export function TransaksiForm({ profile, kategori, units, lockedPeriods }: TransaksiFormProps) {
  const router = useRouter()
  const today = new Date().toISOString().split("T")[0]

  const [jenis, setJenis] = useState<"masuk" | "keluar">("masuk")
  const [tanggal, setTanggal] = useState(today)
  const [jumlah, setJumlah] = useState("")
  const [kategoriId, setKategoriId] = useState("")
  const [unitId, setUnitId] = useState(profile.unit_id ?? "")
  const [keterangan, setKeterangan] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredKategori = kategori.filter((k) => k.tipe === jenis)

  function isPeriodLocked(date: string) {
    if (!date) return false
    const d = new Date(date)
    const tahun = d.getFullYear()
    const bulan = d.getMonth() + 1
    return lockedPeriods.some((l) => l.tahun === tahun && l.bulan === bulan && l.locked)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!tanggal || !jumlah || !kategoriId || !unitId) {
      setError("Semua field wajib diisi.")
      return
    }
    if (Number(jumlah) <= 0) {
      setError("Jumlah harus lebih dari 0.")
      return
    }
    if (isPeriodLocked(tanggal)) {
      setError("Periode ini sudah dikunci. Tidak dapat membuat transaksi.")
      return
    }

    setLoading(true)
    const supabase = createClient()

    // Get auto-number
    const { data: nomor, error: nomorErr } = await supabase.rpc(
      "generate_nomor_transaksi",
      { tahun_input: new Date(tanggal).getFullYear() }
    )

    if (nomorErr || !nomor) {
      setError("Gagal generate nomor transaksi.")
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    const { error: insertErr } = await supabase.from("transaksi").insert({
      nomor,
      tanggal,
      jenis,
      jumlah: Number(jumlah),
      kategori_id: kategoriId,
      unit_id: unitId,
      keterangan: keterangan || null,
      status: "draft",
      created_by: user!.id,
    })

    if (insertErr) {
      setError("Gagal menyimpan transaksi: " + insertErr.message)
      setLoading(false)
      return
    }

    // Audit log
    await supabase.from("audit_log").insert({
      tabel: "transaksi",
      record_id: nomor,
      aksi: "INSERT",
      data_baru: { nomor, jenis, jumlah, tanggal, status: "draft" },
      changed_by: user!.id,
    })

    router.push("/transaksi")
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Link href="/transaksi">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <CardTitle>Form Transaksi</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2.5 mb-4">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Jenis */}
          <div className="space-y-1.5">
            <Label>Jenis Transaksi</Label>
            <div className="flex gap-3">
              {(["masuk", "keluar"] as const).map((j) => (
                <button
                  key={j}
                  type="button"
                  onClick={() => { setJenis(j); setKategoriId("") }}
                  className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    jenis === j
                      ? j === "masuk"
                        ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                        : "bg-rose-50 border-rose-400 text-rose-700"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {j === "masuk" ? "Pemasukan" : "Pengeluaran"}
                </button>
              ))}
            </div>
          </div>

          {/* Tanggal */}
          <div className="space-y-1.5">
            <Label htmlFor="tanggal">Tanggal</Label>
            <Input
              id="tanggal"
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              required
            />
            {tanggal && isPeriodLocked(tanggal) && (
              <p className="text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Periode ini sudah dikunci
              </p>
            )}
          </div>

          {/* Jumlah */}
          <div className="space-y-1.5">
            <Label htmlFor="jumlah">Jumlah (Rp)</Label>
            <Input
              id="jumlah"
              type="number"
              min="1"
              step="1"
              placeholder="0"
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              required
            />
          </div>

          {/* Kategori */}
          <div className="space-y-1.5">
            <Label htmlFor="kategori">Kategori</Label>
            <Select
              id="kategori"
              value={kategoriId}
              onChange={(e) => setKategoriId(e.target.value)}
              required
            >
              <option value="">-- Pilih Kategori --</option>
              {filteredKategori.map((k) => (
                <option key={k.id} value={k.id}>{k.nama}</option>
              ))}
            </Select>
          </div>

          {/* Unit */}
          <div className="space-y-1.5">
            <Label htmlFor="unit">Unit</Label>
            <Select
              id="unit"
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              required
              disabled={profile.role === "operator"}
            >
              <option value="">-- Pilih Unit --</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.nama}</option>
              ))}
            </Select>
          </div>

          {/* Keterangan */}
          <div className="space-y-1.5">
            <Label htmlFor="keterangan">Keterangan (opsional)</Label>
            <Textarea
              id="keterangan"
              placeholder="Deskripsi transaksi..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Link href="/transaksi" className="flex-1">
              <Button variant="outline" className="w-full" type="button">
                Batal
              </Button>
            </Link>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan sebagai Draft"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
