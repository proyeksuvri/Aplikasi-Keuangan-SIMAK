import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TransaksiForm } from "./transaksi-form"
import type { Profile } from "@/lib/types"

export default async function NewTransaksiPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, unit:units(id, nama)")
    .eq("id", user!.id)
    .single()

  const p = profile as Profile

  if (p?.role === "auditor") {
    redirect("/transaksi")
  }

  const [{ data: kategori }, { data: units }, { data: lockData }] = await Promise.all([
    supabase.from("kategori").select("id, nama, tipe").eq("active", true).order("nama"),
    supabase.from("units").select("id, nama").order("nama"),
    supabase.from("periode_lock").select("tahun, bulan, locked"),
  ])

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Tambah Transaksi</h2>
        <p className="text-sm text-slate-500 mt-0.5">Buat transaksi baru</p>
      </div>

      <TransaksiForm
        profile={p}
        kategori={kategori ?? []}
        units={units ?? []}
        lockedPeriods={(lockData ?? []).filter((l) => l.locked)}
      />
    </div>
  )
}
