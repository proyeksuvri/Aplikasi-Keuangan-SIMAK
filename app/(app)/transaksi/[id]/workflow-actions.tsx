"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"
import type { Transaksi, Profile } from "@/lib/types"

interface WorkflowActionsProps {
  trx: Transaksi
  profile: Profile
}

export function WorkflowActions({ trx, profile }: WorkflowActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showReversal, setShowReversal] = useState(false)
  const [reversalNote, setReversalNote] = useState("")

  const isAdmin = profile.role === "admin"
  const isOperator = profile.role === "operator"

  async function updateStatus(newStatus: string, extra?: Record<string, unknown>) {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const updateData: Record<string, unknown> = { status: newStatus, ...extra }
    if (newStatus === "submitted") {
      updateData.submitted_by = user!.id
      updateData.submitted_at = new Date().toISOString()
    }
    if (newStatus === "approved") {
      updateData.approved_by = user!.id
      updateData.approved_at = new Date().toISOString()
    }
    if (newStatus === "posted") {
      updateData.posted_at = new Date().toISOString()
    }

    const { error: err } = await supabase
      .from("transaksi")
      .update(updateData)
      .eq("id", trx.id)

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    await supabase.from("audit_log").insert({
      tabel: "transaksi",
      record_id: trx.nomor,
      aksi: `STATUS_CHANGE → ${newStatus.toUpperCase()}`,
      data_lama: { status: trx.status },
      data_baru: { status: newStatus },
      changed_by: user!.id,
    })

    router.refresh()
    setLoading(false)
  }

  async function handleReversal() {
    if (!reversalNote.trim()) {
      setError("Keterangan reversal wajib diisi.")
      return
    }
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: nomor } = await supabase.rpc("generate_nomor_transaksi", {
      tahun_input: new Date(trx.tanggal).getFullYear(),
    })

    const { error: err } = await supabase.from("transaksi").insert({
      nomor,
      tanggal: trx.tanggal,
      jenis: trx.jenis === "masuk" ? "keluar" : "masuk",
      jumlah: trx.jumlah,
      kategori_id: trx.kategori_id,
      unit_id: trx.unit_id,
      keterangan: `[REVERSAL] ${trx.nomor}: ${reversalNote}`,
      status: "draft",
      created_by: user!.id,
      is_reversal: true,
      reversal_of: trx.id,
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    await supabase.from("audit_log").insert({
      tabel: "transaksi",
      record_id: trx.nomor,
      aksi: "REVERSAL",
      data_baru: { reversal_nomor: nomor, keterangan: reversalNote },
      changed_by: user!.id,
    })

    setShowReversal(false)
    router.push("/transaksi")
    router.refresh()
  }

  return (
    <>
      {error && (
        <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {/* Operator: Submit draft */}
        {isOperator && trx.status === "draft" && (
          <Button onClick={() => updateStatus("submitted")} disabled={loading}>
            Ajukan untuk Persetujuan
          </Button>
        )}

        {/* Admin: Approve submitted */}
        {isAdmin && trx.status === "submitted" && (
          <>
            <Button onClick={() => updateStatus("approved")} disabled={loading}>
              Setujui
            </Button>
            <Button
              variant="outline"
              onClick={() => updateStatus("draft")}
              disabled={loading}
            >
              Kembalikan ke Draft
            </Button>
          </>
        )}

        {/* Admin: Post approved */}
        {isAdmin && trx.status === "approved" && (
          <Button onClick={() => updateStatus("posted")} disabled={loading}>
            Post Transaksi
          </Button>
        )}

        {/* Admin: Reversal for posted */}
        {isAdmin && trx.status === "posted" && !trx.is_reversal && (
          <Button
            variant="destructive"
            onClick={() => setShowReversal(true)}
            disabled={loading}
          >
            Buat Reversal
          </Button>
        )}

        {/* Admin: Delete draft */}
        {isAdmin && trx.status === "draft" && (
          <Button
            variant="outline"
            onClick={() => updateStatus("submitted")}
            disabled={loading}
          >
            Ajukan (Admin)
          </Button>
        )}
      </div>

      {/* Reversal dialog */}
      <Dialog open={showReversal} onClose={() => setShowReversal(false)}>
        <DialogHeader onClose={() => setShowReversal(false)}>
          <DialogTitle>Buat Transaksi Reversal</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            Akan dibuat transaksi reversal untuk <strong>{trx.nomor}</strong>.
            Transaksi reversal akan masuk sebagai draft dan harus melalui proses approval.
          </p>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Alasan Reversal <span className="text-rose-500">*</span>
            </label>
            <Textarea
              placeholder="Masukkan alasan reversal..."
              value={reversalNote}
              onChange={(e) => setReversalNote(e.target.value)}
              rows={3}
            />
          </div>
          {error && (
            <p className="text-sm text-rose-500">{error}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowReversal(false)}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleReversal} disabled={loading}>
            {loading ? "Memproses..." : "Buat Reversal"}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  )
}
