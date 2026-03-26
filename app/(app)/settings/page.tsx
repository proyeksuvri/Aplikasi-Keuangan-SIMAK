import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate, MONTHS } from "@/lib/utils"
import type { Profile, PeriodeLock } from "@/lib/types"
import { PeriodeLockActions } from "./periode-lock-actions"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single()
  const p = profile as Profile

  if (p?.role !== "admin") redirect("/dashboard")

  const now = new Date()
  const tahunCurrent = now.getFullYear()
  const years = [tahunCurrent - 1, tahunCurrent, tahunCurrent + 1]

  const { data: locks } = await supabase
    .from("periode_lock")
    .select("*, locker:profiles!locked_by(nama)")
    .order("tahun", { ascending: false })
    .order("bulan", { ascending: true })

  const lockMap = new Map(
    (locks ?? []).map((l: PeriodeLock) => [`${l.tahun}-${l.bulan}`, l])
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Pengaturan</h2>
        <p className="text-sm text-slate-500 mt-0.5">Kunci periode dan konfigurasi sistem</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kunci Periode (Periode Lock)</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Kunci periode untuk mencegah penambahan/perubahan transaksi pada bulan tersebut.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {years.map((tahun) => (
            <div key={tahun}>
              <div className="px-4 py-2 bg-slate-50 border-y border-slate-100">
                <p className="text-sm font-semibold text-slate-700">{tahun}</p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-4">
                {MONTHS.map((bulanNama, i) => {
                  const bulan = i + 1
                  const lock = lockMap.get(`${tahun}-${bulan}`)
                  const isLocked = lock?.locked ?? false
                  const isPast = new Date(tahun, bulan - 1) < new Date(tahunCurrent, now.getMonth())

                  return (
                    <div
                      key={bulan}
                      className={`rounded-xl border p-3 ${
                        isLocked
                          ? "bg-rose-50 border-rose-200"
                          : isPast
                          ? "bg-slate-50 border-slate-200"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <p className="text-sm font-medium text-slate-700 mb-1.5">{bulanNama}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant={isLocked ? "destructive" : "default"}>
                          {isLocked ? "Terkunci" : "Terbuka"}
                        </Badge>
                        <PeriodeLockActions
                          tahun={tahun}
                          bulan={bulan}
                          isLocked={isLocked}
                          lockId={lock?.id}
                        />
                      </div>
                      {isLocked && lock && (
                        <p className="text-[10px] text-slate-400 mt-1.5">
                          {formatDate(lock.locked_at!)}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
