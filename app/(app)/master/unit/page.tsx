import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import type { Profile, Unit } from "@/lib/types"
import { UnitActions } from "./unit-actions"

export default async function UnitPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single()
  const p = profile as Profile

  if (p?.role !== "admin") redirect("/dashboard")

  const { data } = await supabase.from("units").select("*").order("nama")
  const units = (data ?? []) as Unit[]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Unit Organisasi</h2>
          <p className="text-sm text-slate-500 mt-0.5">Kelola unit / satuan kerja</p>
        </div>
        <UnitActions mode="create" />
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Nama Unit</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Dibuat</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {units.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-700">{u.nama}</td>
                  <td className="px-4 py-3 text-slate-500">{u.created_at ? formatDate(u.created_at) : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <UnitActions mode="edit" unit={u} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
