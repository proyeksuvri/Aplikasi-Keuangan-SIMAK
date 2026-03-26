"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatRupiah } from "@/lib/utils"
import { Upload, FileSpreadsheet, CheckCircle, XCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Kategori, Unit, Profile } from "@/lib/types"
import * as XLSX from "xlsx"

interface ImportRow {
  tanggal: string
  jenis: string
  jumlah: number
  kategori_nama: string
  keterangan: string
  // resolved
  kategori_id?: string
  unit_id?: string
  valid: boolean
  errors: string[]
}

interface ImportFormProps {
  profile: Profile
  kategori: Kategori[]
  units: Unit[]
}

const TEMPLATE_HEADERS = ["tanggal", "jenis", "jumlah", "kategori", "keterangan"]

export function ImportForm({ profile, kategori, units }: ImportFormProps) {
  const router = useRouter()
  const [rows, setRows] = useState<ImportRow[]>([])
  const [importing, setImporting] = useState(false)
  const [done, setDone] = useState(false)
  const [importCount, setImportCount] = useState(0)

  function downloadTemplate() {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([
      TEMPLATE_HEADERS,
      ["2026-03-01", "masuk", 5000000, "Penerimaan DIPA", "Contoh pemasukan"],
      ["2026-03-02", "keluar", 1500000, "Belanja Barang", "Contoh pengeluaran"],
    ])
    XLSX.utils.book_append_sheet(wb, ws, "Transaksi")
    XLSX.writeFile(wb, "template-import-transaksi.xlsx")
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const data = new Uint8Array(ev.target!.result as ArrayBuffer)
      const wb = XLSX.read(data, { type: "array" })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { header: 1 })

      const parsed: ImportRow[] = []
      const unitId = profile.unit_id ?? units[0]?.id ?? ""

      for (let i = 1; i < raw.length; i++) {
        const r = raw[i] as unknown as unknown[]
        if (!r || r.length === 0) continue

        const tanggal = String(r[0] ?? "").trim()
        const jenis = String(r[1] ?? "").trim().toLowerCase()
        const jumlah = Number(r[2] ?? 0)
        const kategoriNama = String(r[3] ?? "").trim()
        const keterangan = String(r[4] ?? "").trim()

        const errors: string[] = []

        if (!tanggal || isNaN(Date.parse(tanggal))) errors.push("Tanggal tidak valid")
        if (jenis !== "masuk" && jenis !== "keluar") errors.push("Jenis harus 'masuk' atau 'keluar'")
        if (!jumlah || jumlah <= 0) errors.push("Jumlah harus > 0")

        const matchKategori = kategori.find(
          (k) => k.nama.toLowerCase() === kategoriNama.toLowerCase() && k.tipe === jenis
        )
        if (!matchKategori) errors.push(`Kategori '${kategoriNama}' tidak ditemukan untuk jenis '${jenis}'`)

        parsed.push({
          tanggal,
          jenis,
          jumlah,
          kategori_nama: kategoriNama,
          keterangan,
          kategori_id: matchKategori?.id,
          unit_id: unitId,
          valid: errors.length === 0,
          errors,
        })
      }

      setRows(parsed)
    }
    reader.readAsArrayBuffer(file)
  }

  async function handleImport() {
    const validRows = rows.filter((r) => r.valid)
    if (validRows.length === 0) return

    setImporting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let count = 0
    for (const row of validRows) {
      const { data: nomor } = await supabase.rpc("generate_nomor_transaksi", {
        tahun_input: new Date(row.tanggal).getFullYear(),
      })

      const { error } = await supabase.from("transaksi").insert({
        nomor,
        tanggal: row.tanggal,
        jenis: row.jenis,
        jumlah: row.jumlah,
        kategori_id: row.kategori_id,
        unit_id: row.unit_id,
        keterangan: row.keterangan || null,
        status: "draft",
        created_by: user!.id,
      })

      if (!error) count++
    }

    setImportCount(count)
    setDone(true)
    setImporting(false)
  }

  if (done) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Import Berhasil</h3>
          <p className="text-slate-500 mb-6">{importCount} transaksi berhasil diimport sebagai Draft.</p>
          <Link href="/transaksi">
            <Button>Lihat Transaksi</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  const validCount = rows.filter((r) => r.valid).length
  const invalidCount = rows.filter((r) => !r.valid).length

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Link href="/transaksi">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
            </Link>
            <CardTitle>Upload File Excel</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6 text-center">
            <FileSpreadsheet className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500 mb-3">
              Upload file Excel dengan kolom: <code className="bg-slate-100 px-1 rounded text-xs">tanggal, jenis, jumlah, kategori, keterangan</code>
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                Download Template
              </Button>
              <label className="inline-flex items-center gap-2 h-7 px-2.5 text-xs rounded-lg font-medium transition-all bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm cursor-pointer">
                <Upload className="h-4 w-4" /> Pilih File
                <input type="file" accept=".xlsx,.xls" onChange={handleFile} className="hidden" />
              </label>
            </div>
          </div>

          {rows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">{rows.length} baris ditemukan</span>
                <Badge variant="success">{validCount} valid</Badge>
                {invalidCount > 0 && <Badge variant="destructive">{invalidCount} error</Badge>}
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-3 py-2 text-left text-slate-400 font-bold uppercase tracking-wider">Status</th>
                      <th className="px-3 py-2 text-left text-slate-400 font-bold uppercase tracking-wider">Tanggal</th>
                      <th className="px-3 py-2 text-left text-slate-400 font-bold uppercase tracking-wider">Jenis</th>
                      <th className="px-3 py-2 text-right text-slate-400 font-bold uppercase tracking-wider">Jumlah</th>
                      <th className="px-3 py-2 text-left text-slate-400 font-bold uppercase tracking-wider">Kategori</th>
                      <th className="px-3 py-2 text-left text-slate-400 font-bold uppercase tracking-wider">Keterangan/Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {rows.map((row, i) => (
                      <tr key={i} className={row.valid ? "" : "bg-rose-50/50"}>
                        <td className="px-3 py-2">
                          {row.valid ? (
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-rose-500" />
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-600">{row.tanggal}</td>
                        <td className="px-3 py-2">
                          <span className={`font-medium ${row.jenis === "masuk" ? "text-emerald-600" : "text-rose-500"}`}>
                            {row.jenis}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-slate-700">
                          {row.jumlah > 0 ? formatRupiah(row.jumlah) : "—"}
                        </td>
                        <td className="px-3 py-2 text-slate-600">{row.kategori_nama}</td>
                        <td className="px-3 py-2">
                          {row.valid
                            ? <span className="text-slate-400">{row.keterangan || "—"}</span>
                            : <span className="text-rose-500">{row.errors.join(", ")}</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {validCount > 0 && (
                <Button onClick={handleImport} disabled={importing}>
                  {importing ? "Mengimport..." : `Import ${validCount} Transaksi`}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
