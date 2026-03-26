import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import type { Profile } from "@/lib/types"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, unit:units(id, nama)")
    .eq("id", user.id)
    .single()

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar profile={profile as Profile | null} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header profile={profile as Profile | null} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
