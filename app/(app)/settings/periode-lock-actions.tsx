"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Lock, LockOpen } from "lucide-react"

interface PeriodeLockActionsProps {
  tahun: number
  bulan: number
  isLocked: boolean
  lockId?: string
}

export function PeriodeLockActions({ tahun, bulan, isLocked, lockId }: PeriodeLockActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (lockId) {
      await supabase
        .from("periode_lock")
        .update({
          locked: !isLocked,
          locked_by: !isLocked ? user!.id : null,
          locked_at: !isLocked ? new Date().toISOString() : null,
        })
        .eq("id", lockId)
    } else {
      await supabase.from("periode_lock").insert({
        tahun,
        bulan,
        locked: true,
        locked_by: user!.id,
        locked_at: new Date().toISOString(),
      })
    }

    router.refresh()
    setLoading(false)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      disabled={loading}
      title={isLocked ? "Buka kunci" : "Kunci periode"}
      className="h-6 w-6"
    >
      {isLocked ? (
        <LockOpen className="h-3.5 w-3.5 text-rose-500" />
      ) : (
        <Lock className="h-3.5 w-3.5 text-slate-400 hover:text-rose-500" />
      )}
    </Button>
  )
}
