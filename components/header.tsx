"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import type { Profile } from "@/lib/types"
import { LogOut, Bell } from "lucide-react"

interface HeaderProps {
  profile: Profile | null
  title?: string
}

export function Header({ profile, title }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-base font-semibold text-slate-800">
        {title ?? "SIMAK"}
      </h1>

      <div className="flex items-center gap-3">
        <button className="relative p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-lg transition-colors">
          <Bell className="h-4 w-4" />
        </button>

        <div className="h-6 w-px bg-slate-200" />

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-800 leading-tight">
              {profile?.nama ?? "—"}
            </p>
            <p className="text-xs text-slate-400 capitalize">{profile?.role}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
            {profile?.nama?.[0]?.toUpperCase() ?? "?"}
          </div>
        </div>

        <Button variant="ghost" size="icon" onClick={handleLogout} title="Keluar">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
