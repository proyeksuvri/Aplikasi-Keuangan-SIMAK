import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { Profile } from "@/lib/types"
import { ImportForm } from "./import-form"

export default async function ImportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, unit:units(id, nama)")
    .eq("id", user!.id)
    .single()
  const p = profile as Profile

  if (p?.role === "auditor") redirect("/transaksi")

  const [{ data: kategori }, { data: units }] = await Promise.all([
    supabase.from("kategori").select("id, nama, tipe").eq("active", true).order("nama"),
    supabase.from("units").select("id, nama").order("nama"),
  ])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Import Transaksi dari Excel</h2>
        <p className="text-sm text-slate-500 mt-0.5">Upload file Excel untuk import transaksi secara batch</p>
      </div>
      <ImportForm profile={p} kategori={kategori ?? []} units={units ?? []} />
    </div>
  )
}
