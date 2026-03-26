import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatRupiah, formatDateShort, MONTHS } from "@/lib/utils"
import type { Transaksi, Profile } from "@/lib/types"
import { BkuFilterBar } from "./bku-filter"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface PageProps {
  searchParams: Promise<{ bulan?: string; tahun?: string; unit_id?: string }>
}

export default async function BkuPage({ searchParams }: PageProps) {
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

  const unitId = params.unit_id ?? (p.role !== "admin" ? p.unit_id ?? "" : "")

  let query = supabase
    .from("transaksi")
    .select("*, kategori:kategori(nama), unit:units(nama)")
    .eq("status", "posted")
    .gte("tanggal", monthStart)
    .lte("tanggal", monthEnd)
    .order("tanggal", { ascending: true })
    .order("created_at", { ascending: true })

  if (unitId) query = query.eq("unit_id", unitId)

  const { data: rows } = await query
  const transaksi = (rows ?? []) as Transaksi[]

  const { data: units } = await supabase.from("units").select("id, nama").order("nama")

  // Saldo awal: semua transaksi posted sebelum periode ini
  let saldoAwalQuery = supabase
    .from("transaksi")
    .select("jenis, jumlah")
    .eq("status", "posted")
    .lt("tanggal", monthStart)

  if (unitId) saldoAwalQuery = saldoAwalQuery.eq("unit_id", unitId)
  const { data: saldoAwalRows } = await saldoAwalQuery

  const saldoAwal = (saldoAwalRows ?? []).reduce(
    (s, t) => s + (t.jenis === "masuk" ? Number(t.jumlah) : -Number(t.jumlah)),
    0
  )

  // Build BKU rows with running balance
  let runningBalance = saldoAwal
  const bkuRows = transaksi.map((trx, i) => {
    const isDebet = trx.jenis === "masuk"
    runningBalance += isDebet ? Number(trx.jumlah) : -Number(trx.jumlah)
    return {
      no: i + 1,
      trx,
      debet: isDebet ? Number(trx.jumlah) : 0,
      kredit: isDebet ? 0 : Number(trx.jumlah),
      saldo: runningBalance,
    }
  })

  const totalDebet = bkuRows.reduce((s, r) => s + r.debet, 0)
  const totalKredit = bkuRows.reduce((s, r) => s + r.kredit, 0)
  const saldoAkhir = saldoAwal + totalDebet - totalKredit

  const unitNama = units?.find((u) => u.id === unitId)?.nama ?? "Semua Unit"

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Buku Kas Umum</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {unitNama} • {MONTHS[bulan - 1]} {tahun}
          </p>
        </div>
        <Link href={`/laporan/bku/export?bulan=${bulan}&tahun=${tahun}&unit_id=${unitId}`}>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export PDF
          </Button>
        </Link>
      </div>

      <BkuFilterBar
        bulan={bulan}
        tahun={tahun}
        unit_id={unitId}
        units={units ?? []}
        showUnitFilter={p.role === "admin"}
      />

      {/* Saldo Awal */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">Saldo Awal Periode</p>
        <p className="text-sm font-bold text-slate-800">{formatRupiah(saldoAwal)}</p>
      </div>

      {/* BKU Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 w-10">No</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 w-28">Tanggal</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 w-36">Nomor</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Keterangan</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400 w-36">Debet (Masuk)</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400 w-36">Kredit (Keluar)</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400 w-36">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bkuRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      Tidak ada transaksi posted untuk periode ini
                    </td>
                  </tr>
                ) : (
                  bkuRows.map((row) => (
                    <tr key={row.trx.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-slate-500">{row.no}</td>
                      <td className="px-4 py-3 text-slate-500">{formatDateShort(row.trx.tanggal)}</td>
                      <td className="px-4 py-3 font-medium text-slate-700">{row.trx.nomor}</td>
                      <td className="px-4 py-3 text-slate-600">
                        <p className="font-medium">{row.trx.kategori?.nama}</p>
                        {row.trx.keterangan && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{row.trx.keterangan}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-600 font-medium">
                        {row.debet > 0 ? formatRupiah(row.debet) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600 font-medium">
                        {row.kredit > 0 ? formatRupiah(row.kredit) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">
                        {formatRupiah(row.saldo)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-200 font-bold">
                  <td colSpan={4} className="px-4 py-3 text-sm text-slate-700">TOTAL</td>
                  <td className="px-4 py-3 text-right text-sm text-emerald-600">{formatRupiah(totalDebet)}</td>
                  <td className="px-4 py-3 text-right text-sm text-slate-600">{formatRupiah(totalKredit)}</td>
                  <td className="px-4 py-3 text-right text-sm text-slate-800">{formatRupiah(saldoAkhir)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
