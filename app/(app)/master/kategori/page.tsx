import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Profile, Kategori } from "@/lib/types"
import { KategoriActions } from "./kategori-actions"

export default async function KategoriPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user!.id).single()
  const p = profile as Profile

  if (p?.role !== "admin") redirect("/dashboard")

  const { data } = await supabase
    .from("kategori")
    .select("*")
    .order("tipe")
    .order("nama")

  const kategori = (data ?? []) as Kategori[]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Kategori Transaksi</h2>
          <p className="text-sm text-slate-500 mt-0.5">Kelola kategori pemasukan dan pengeluaran</p>
        </div>
        <KategoriActions mode="create" />
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Nama</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Tipe</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {kategori.map((k) => (
                <tr key={k.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-700">{k.nama}</td>
                  <td className="px-4 py-3">
                    <Badge variant={k.tipe === "masuk" ? "success" : "destructive"}>
                      {k.tipe === "masuk" ? "Pemasukan" : "Pengeluaran"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={k.active ? "success" : "default"}>
                      {k.active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <KategoriActions mode="edit" kategori={k} />
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
