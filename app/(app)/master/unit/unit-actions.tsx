"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Pencil } from "lucide-react"
import type { Unit } from "@/lib/types"

interface UnitActionsProps {
  mode: "create" | "edit"
  unit?: Unit
}

export function UnitActions({ mode, unit }: UnitActionsProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [nama, setNama] = useState(unit?.nama ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!nama.trim()) { setError("Nama wajib diisi."); return }
    setLoading(true)
    setError(null)
    const supabase = createClient()

    if (mode === "create") {
      const { error: err } = await supabase.from("units").insert({ nama })
      if (err) { setError(err.message); setLoading(false); return }
    } else {
      const { error: err } = await supabase.from("units").update({ nama }).eq("id", unit!.id)
      if (err) { setError(err.message); setLoading(false); return }
    }

    setOpen(false)
    router.refresh()
    setLoading(false)
  }

  return (
    <>
      {mode === "create" ? (
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Tambah Unit
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
          <Pencil className="h-3 w-3" />
        </Button>
      )}

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogHeader onClose={() => setOpen(false)}>
          <DialogTitle>{mode === "create" ? "Tambah Unit" : "Edit Unit"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nama Unit</Label>
            <Input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama unit organisasi" />
          </div>
          {error && <p className="text-sm text-rose-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          <Button onClick={handleSave} disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</Button>
        </DialogFooter>
      </Dialog>
    </>
  )
}
