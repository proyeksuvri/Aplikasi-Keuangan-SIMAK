"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Pencil } from "lucide-react"
import type { Kategori } from "@/lib/types"

interface KategoriActionsProps {
  mode: "create" | "edit"
  kategori?: Kategori
}

export function KategoriActions({ mode, kategori }: KategoriActionsProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [nama, setNama] = useState(kategori?.nama ?? "")
  const [tipe, setTipe] = useState<"masuk" | "keluar">(kategori?.tipe ?? "masuk")
  const [active, setActive] = useState(kategori?.active ?? true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!nama.trim()) { setError("Nama wajib diisi."); return }
    setLoading(true)
    setError(null)
    const supabase = createClient()

    if (mode === "create") {
      const { error: err } = await supabase.from("kategori").insert({ nama, tipe, active: true })
      if (err) { setError(err.message); setLoading(false); return }
    } else {
      const { error: err } = await supabase.from("kategori").update({ nama, tipe, active }).eq("id", kategori!.id)
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
          <Plus className="h-4 w-4 mr-1" /> Tambah Kategori
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
          <Pencil className="h-3 w-3" />
        </Button>
      )}

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogHeader onClose={() => setOpen(false)}>
          <DialogTitle>{mode === "create" ? "Tambah Kategori" : "Edit Kategori"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nama Kategori</Label>
            <Input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama kategori" />
          </div>
          <div className="space-y-1.5">
            <Label>Tipe</Label>
            <Select value={tipe} onChange={(e) => setTipe(e.target.value as "masuk" | "keluar")}>
              <option value="masuk">Pemasukan</option>
              <option value="keluar">Pengeluaran</option>
            </Select>
          </div>
          {mode === "edit" && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="active">Aktif</Label>
            </div>
          )}
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
