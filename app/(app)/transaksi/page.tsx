import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatRupiah, formatDateShort, MONTHS } from "@/lib/utils"
import type { Transaksi, Profile } from "@/lib/types"
import Link from "next/link"
import { Plus, FileUp } from "lucide-react"
import { FilterBar } from "./filter-bar"

interface PageProps {
  searchParams: Promise<{
    bulan?: string
    tahun?: string
    jenis?: string
    status?: string
    unit_id?: string
  }>
}

export default async function TransaksiPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const now = new Date()

  const bulan = Number(params.bulan ?? now.getMonth() + 1)
  const tahun = Number(params.tahun ?? now.getFullYear())
  const monthStart = `${tahun}-${String(bulan).padStart(2, "0")}-01`
  const monthEnd = `${tahun}-${String(bulan).padStart(2, "0")}-31`

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, unit:units(id, nama)")
    .eq("id", user!.id)
    .single()

  const p = profile as Profile

  let query = supabase
    .from("transaksi")
    .select("*, kategori:kategori(nama, tipe), unit:units(nama)")
    .gte("tanggal", monthStart)
    .lte("tanggal", monthEnd)
    .order("tanggal", { ascending: false })

  if (params.jenis) query = query.eq("jenis", params.jenis)
  if (params.status) query = query.eq("status", params.status)
  if (params.unit_id) query = query.eq("unit_id", params.unit_id)

  const { data: rows } = await query
  const transaksi = (rows ?? []) as Transaksi[]

  const { data: units } = await supabase.from("units").select("id, nama").order("nama")

  const totalMasuk = transaksi
    .filter((t) => t.jenis === "masuk" && t.status === "posted")
    .reduce((s, t) => s + Number(t.jumlah), 0)
  const totalKeluar = transaksi
    .filter((t) => t.jenis === "keluar" && t.status === "posted")
    .reduce((s, t) => s + Number(t.jumlah), 0)

  const canCreate = p?.role === "admin" || p?.role === "operator"

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Transaksi</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {MONTHS[bulan - 1]} {tahun}
          </p>
        </div>
        {canCreate && (
          <div className="flex gap-2">
            <Link href="/transaksi/import">
              <Button variant="outline" size="sm">
                <FileUp className="h-4 w-4 mr-1" />
                Import Excel
              </Button>
            </Link>
            <Link href="/transaksi/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Tambah
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
          <p className="text-xs text-slate-500 mb-1">Pemasukan (Posted)</p>
          <p className="text-lg font-bold text-emerald-600">{formatRupiah(totalMasuk)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
          <p className="text-xs text-slate-500 mb-1">Pengeluaran (Posted)</p>
          <p className="text-lg font-bold text-rose-500">{formatRupiah(totalKeluar)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
          <p className="text-xs text-slate-500 mb-1">Jumlah Transaksi</p>
          <p className="text-lg font-bold text-slate-800">{transaksi.length}</p>
        </div>
      </div>

      {/* Filter */}
      <FilterBar
        bulan={bulan}
        tahun={tahun}
        jenis={params.jenis ?? ""}
        status={params.status ?? ""}
        unit_id={params.unit_id ?? ""}
        units={units ?? []}
        showUnitFilter={p?.role === "admin"}
      />

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Nomor</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Tanggal</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Kategori</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Unit</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">Jumlah</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transaksi.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">
                    Tidak ada transaksi untuk periode ini
                  </td>
                </tr>
              ) : (
                transaksi.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{trx.nomor}</p>
                        {trx.is_reversal && (
                          <span className="text-[10px] text-rose-500 font-medium">REVERSAL</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {formatDateShort(trx.tanggal)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">{trx.kategori?.nama}</p>
                      <span className={`text-[10px] font-medium ${trx.jenis === "masuk" ? "text-emerald-600" : "text-rose-500"}`}>
                        {trx.jenis === "masuk" ? "Pemasukan" : "Pengeluaran"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{trx.unit?.nama}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={trx.status} />
                    </td>
                    <td className={`px-4 py-3 text-right text-sm font-semibold ${trx.jenis === "masuk" ? "text-emerald-600" : "text-slate-700"}`}>
                      {trx.jenis === "masuk" ? "+" : "-"}{formatRupiah(trx.jumlah)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/transaksi/${trx.id}`}>
                        <Button variant="ghost" size="sm">Detail</Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
