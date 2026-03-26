import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Profile } from "@/lib/types"
import { UserActions } from "./user-actions"

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single()
  const p = profile as Profile

  if (p?.role !== "admin") redirect("/dashboard")

  const { data } = await supabase
    .from("profiles")
    .select("*, unit:units(id, nama)")
    .order("nama")

  const users = (data ?? []) as Profile[]
  const { data: units } = await supabase.from("units").select("id, nama").order("nama")

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manajemen Pengguna</h2>
          <p className="text-sm text-slate-500 mt-0.5">Kelola akun dan hak akses pengguna</p>
        </div>
        <UserActions mode="create" units={units ?? []} />
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Nama</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Role</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Unit</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                        {u.nama[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-700">{u.nama}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={u.role === "admin" ? "info" : u.role === "auditor" ? "warning" : "default"}
                    >
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {(u.unit as { nama?: string } | null)?.nama ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <UserActions mode="edit" user={u} units={units ?? []} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-700">
        <p className="font-semibold mb-1">Catatan</p>
        <p className="text-indigo-600">Akun baru dibuat melalui Supabase Auth. Setelah user mendaftar, atur role dan unit di sini.</p>
      </div>
    </div>
  )
}
