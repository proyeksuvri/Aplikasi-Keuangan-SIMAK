import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatRupiah, MONTHS } from "@/lib/utils"
import type { Profile } from "@/lib/types"
import { CashflowFilterBar } from "./cashflow-filter"

interface PageProps {
  searchParams: Promise<{ tahun?: string; unit_id?: string }>
}

interface CashflowRow {
  tahun: number
  bulan: number
  total_masuk: number
  total_keluar: number
}

export default async function CashflowPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const now = new Date()

  const tahun = Number(params.tahun ?? now.getFullYear())

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, unit:units(id, nama)")
    .eq("id", user!.id)
    .single()
  const p = profile as Profile
  const unitId = params.unit_id ?? (p.role !== "admin" ? p.unit_id ?? "" : "")

  const { data: cashflowData } = await supabase.rpc("get_cashflow_bulanan", {
    p_tahun: tahun,
  })

  const { data: units } = await supabase.from("units").select("id, nama").order("nama")

  // Map to all 12 months
  const rows: (CashflowRow & { selisih: number })[] = MONTHS.map((_, i) => {
    const bulan = i + 1
    const found = (cashflowData ?? []).find(
      (c: CashflowRow) => c.bulan === bulan && c.tahun === tahun
    )
    const masuk = found?.total_masuk ?? 0
    const keluar = found?.total_keluar ?? 0
    return { tahun, bulan, total_masuk: masuk, total_keluar: keluar, selisih: masuk - keluar }
  })

  const grandMasuk = rows.reduce((s, r) => s + r.total_masuk, 0)
  const grandKeluar = rows.reduce((s, r) => s + r.total_keluar, 0)
  const grandSelisih = grandMasuk - grandKeluar

  const maxVal = Math.max(...rows.flatMap((r) => [r.total_masuk, r.total_keluar]), 1)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Laporan Arus Kas</h2>
        <p className="text-sm text-slate-500 mt-0.5">Tahun {tahun}</p>
      </div>

      <CashflowFilterBar
        tahun={tahun}
        unit_id={unitId}
        units={units ?? []}
        showUnitFilter={p.role === "admin"}
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
          <p className="text-xs text-slate-500 mb-1">Total Pemasukan {tahun}</p>
          <p className="text-lg font-bold text-emerald-600">{formatRupiah(grandMasuk)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
          <p className="text-xs text-slate-500 mb-1">Total Pengeluaran {tahun}</p>
          <p className="text-lg font-bold text-rose-500">{formatRupiah(grandKeluar)}</p>
        </div>
        <div className={`rounded-xl border px-4 py-3 ${grandSelisih >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
          <p className="text-xs text-slate-500 mb-1">Selisih</p>
          <p className={`text-lg font-bold ${grandSelisih >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
            {formatRupiah(Math.abs(grandSelisih))}
            {grandSelisih < 0 && " (defisit)"}
          </p>
        </div>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader><CardTitle>Grafik Arus Kas Bulanan</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rows.map((row) => (
              <div key={row.bulan} className="flex items-center gap-4">
                <span className="text-xs text-slate-500 w-8 shrink-0">{MONTHS[row.bulan - 1].slice(0, 3)}</span>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 bg-emerald-400 rounded-sm transition-all"
                      style={{ width: `${(row.total_masuk / maxVal) * 100}%`, minWidth: row.total_masuk > 0 ? "4px" : "0" }}
                    />
                    <span className="text-xs text-emerald-600 font-medium whitespace-nowrap">
                      {row.total_masuk > 0 ? formatRupiah(row.total_masuk) : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 bg-rose-400 rounded-sm transition-all"
                      style={{ width: `${(row.total_keluar / maxVal) * 100}%`, minWidth: row.total_keluar > 0 ? "4px" : "0" }}
                    />
                    <span className="text-xs text-rose-500 font-medium whitespace-nowrap">
                      {row.total_keluar > 0 ? formatRupiah(row.total_keluar) : "—"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-6 mt-6 text-xs text-slate-500 border-t border-slate-100 pt-4">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-400" /> Pemasukan</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-rose-400" /> Pengeluaran</span>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader><CardTitle>Rekap Per Bulan</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Bulan</th>
                <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">Pemasukan</th>
                <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">Pengeluaran</th>
                <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">Selisih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((row) => (
                <tr key={row.bulan} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-700">{MONTHS[row.bulan - 1]}</td>
                  <td className="px-4 py-3 text-right text-emerald-600 font-medium">
                    {row.total_masuk > 0 ? formatRupiah(row.total_masuk) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600 font-medium">
                    {row.total_keluar > 0 ? formatRupiah(row.total_keluar) : "—"}
                  </td>
                  <td className={`px-4 py-3 text-right font-bold ${row.selisih >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                    {row.selisih !== 0 ? formatRupiah(Math.abs(row.selisih)) : "—"}
                    {row.selisih < 0 && " ▼"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-200 font-bold">
                <td className="px-4 py-3 text-slate-700">TOTAL</td>
                <td className="px-4 py-3 text-right text-emerald-600">{formatRupiah(grandMasuk)}</td>
                <td className="px-4 py-3 text-right text-slate-600">{formatRupiah(grandKeluar)}</td>
                <td className={`px-4 py-3 text-right ${grandSelisih >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                  {formatRupiah(Math.abs(grandSelisih))}
                </td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
