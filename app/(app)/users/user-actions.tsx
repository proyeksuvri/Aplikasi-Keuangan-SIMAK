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
import type { Profile, Unit } from "@/lib/types"

interface UserActionsProps {
  mode: "create" | "edit"
  user?: Profile
  units: Unit[]
}

export function UserActions({ mode, user, units }: UserActionsProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [nama, setNama] = useState(user?.nama ?? "")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"admin" | "operator" | "auditor">(user?.role ?? "operator")
  const [unitId, setUnitId] = useState(user?.unit_id ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!nama.trim()) { setError("Nama wajib diisi."); return }
    setLoading(true)
    setError(null)
    const supabase = createClient()

    if (mode === "create") {
      if (!email || !password) { setError("Email dan password wajib diisi."); setLoading(false); return }
      // Create user via admin - this needs service role, so we use a workaround
      // For now, update existing profile
      setError("Pembuatan akun baru memerlukan akses admin Supabase. Silakan buat user di dashboard Supabase.")
      setLoading(false)
      return
    }

    const { error: err } = await supabase
      .from("profiles")
      .update({ nama, role, unit_id: unitId || null })
      .eq("id", user!.id)

    if (err) { setError(err.message); setLoading(false); return }

    setOpen(false)
    router.refresh()
    setLoading(false)
  }

  return (
    <>
      {mode === "create" ? (
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Tambah Pengguna
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
          <Pencil className="h-3 w-3" />
        </Button>
      )}

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogHeader onClose={() => setOpen(false)}>
          <DialogTitle>{mode === "create" ? "Tambah Pengguna" : "Edit Pengguna"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nama Lengkap</Label>
            <Input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama pengguna" />
          </div>
          {mode === "create" && (
            <>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@uinpalopo.ac.id" />
              </div>
              <div className="space-y-1.5">
                <Label>Password</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
            </>
          )}
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onChange={(e) => setRole(e.target.value as "admin" | "operator" | "auditor")}>
              <option value="operator">Operator</option>
              <option value="admin">Admin</option>
              <option value="auditor">Auditor</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Unit (untuk Operator)</Label>
            <Select value={unitId} onChange={(e) => setUnitId(e.target.value)}>
              <option value="">— Tidak ada unit —</option>
              {units.map((u) => <option key={u.id} value={u.id}>{u.nama}</option>)}
            </Select>
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
