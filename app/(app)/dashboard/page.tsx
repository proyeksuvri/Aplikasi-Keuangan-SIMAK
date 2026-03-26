import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/badge"
import { formatRupiah, formatDateShort, MONTHS } from "@/lib/utils"
import type { Transaksi } from "@/lib/types"
import { TrendingUp, TrendingDown, Wallet, ArrowLeftRight } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`
  const monthEnd = `${year}-${String(month).padStart(2, "0")}-31`

  // Aggregate stats from posted transactions
  const [saldoRes, bulananRes, recentRes, cashflowRes] = await Promise.all([
    // Total saldo (all posted)
    supabase
      .from("transaksi")
      .select("jenis, jumlah")
      .eq("status", "posted"),

    // Pemasukan & pengeluaran bulan ini (posted)
    supabase
      .from("transaksi")
      .select("jenis, jumlah")
      .eq("status", "posted")
      .gte("tanggal", monthStart)
      .lte("tanggal", monthEnd),

    // 5 transaksi terbaru
    supabase
      .from("transaksi")
      .select("*, kategori:kategori(nama, tipe), unit:units(nama)")
      .order("created_at", { ascending: false })
      .limit(5),

    // Cash flow 6 bulan terakhir
    supabase.rpc("get_cashflow_bulanan", { p_tahun: year }),
  ])

  // Calculate saldo
  const allPosted = saldoRes.data ?? []
  const totalMasuk = allPosted
    .filter((t) => t.jenis === "masuk")
    .reduce((s, t) => s + Number(t.jumlah), 0)
  const totalKeluar = allPosted
    .filter((t) => t.jenis === "keluar")
    .reduce((s, t) => s + Number(t.jumlah), 0)
  const saldo = totalMasuk - totalKeluar

  // Bulan ini
  const bulanIni = bulananRes.data ?? []
  const pemasukanBulan = bulanIni
    .filter((t) => t.jenis === "masuk")
    .reduce((s: number, t: { jumlah: number }) => s + Number(t.jumlah), 0)
  const pengeluaranBulan = bulanIni
    .filter((t) => t.jenis === "keluar")
    .reduce((s: number, t: { jumlah: number }) => s + Number(t.jumlah), 0)

  const recent = (recentRes.data ?? []) as Transaksi[]

  // Monthly cashflow chart data (last 6 months)
  const cashflow = cashflowRes.data ?? []
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(year, month - 1 - (5 - i), 1)
    const m = d.getMonth() + 1
    const y = d.getFullYear()
    const found = cashflow.find(
      (c: { bulan: number; tahun: number; total_masuk: number; total_keluar: number }) =>
        c.bulan === m && c.tahun === y
    )
    return {
      label: MONTHS[d.getMonth()].slice(0, 3),
      masuk: found?.total_masuk ?? 0,
      keluar: found?.total_keluar ?? 0,
    }
  })
  const maxVal = Math.max(...last6Months.flatMap((m) => [m.masuk, m.keluar]), 1)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          {MONTHS[month - 1]} {year}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Wallet className="h-5 w-5" />
            </div>
            <p className="text-indigo-100 text-sm font-medium">Saldo</p>
          </div>
          <p className="text-2xl font-bold">{formatRupiah(saldo)}</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-slate-500 text-sm">Pemasukan Bulan Ini</p>
            </div>
            <p className="text-xl font-bold text-slate-800">
              {formatRupiah(pemasukanBulan)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-rose-500" />
              </div>
              <p className="text-slate-500 text-sm">Pengeluaran Bulan Ini</p>
            </div>
            <p className="text-xl font-bold text-slate-800">
              {formatRupiah(pengeluaranBulan)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
                <ArrowLeftRight className="h-5 w-5 text-slate-500" />
              </div>
              <p className="text-slate-500 text-sm">Total Transaksi</p>
            </div>
            <p className="text-xl font-bold text-slate-800">
              {allPosted.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between pb-4">
            <CardTitle>Transaksi Terbaru</CardTitle>
            <Link
              href="/transaksi"
              className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
            >
              Lihat Semua
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recent.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                Belum ada transaksi
              </p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Transaksi
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Jumlah
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recent.map((trx) => (
                    <tr
                      key={trx.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-3">
                        <div>
                          <p className="font-medium text-slate-700 text-sm">
                            {trx.nomor}
                          </p>
                          <p className="text-xs text-slate-400">
                            {trx.kategori?.nama}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-500">
                        {formatDateShort(trx.tanggal)}
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge status={trx.status} />
                      </td>
                      <td
                        className={`px-6 py-3 text-right text-sm font-semibold ${
                          trx.jenis === "masuk"
                            ? "text-emerald-600"
                            : "text-slate-700"
                        }`}
                      >
                        {trx.jenis === "masuk" ? "+" : "-"}
                        {formatRupiah(trx.jumlah)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Cash Flow Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Arus Kas 6 Bulan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {last6Months.map((m, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">{m.label}</p>
                  <div className="flex gap-1 h-3">
                    <div
                      className="bg-emerald-400 rounded-sm transition-all"
                      style={{ width: `${(m.masuk / maxVal) * 100}%`, minWidth: m.masuk > 0 ? "2px" : "0" }}
                      title={`Masuk: ${formatRupiah(m.masuk)}`}
                    />
                  </div>
                  <div className="flex gap-1 h-3">
                    <div
                      className="bg-rose-400 rounded-sm transition-all"
                      style={{ width: `${(m.keluar / maxVal) * 100}%`, minWidth: m.keluar > 0 ? "2px" : "0" }}
                      title={`Keluar: ${formatRupiah(m.keluar)}`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Masuk
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                Keluar
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
