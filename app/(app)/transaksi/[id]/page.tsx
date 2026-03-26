import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/badge"
import { formatRupiah, formatDate } from "@/lib/utils"
import type { Transaksi, Profile } from "@/lib/types"
import { WorkflowActions } from "./workflow-actions"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function TransaksiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, unit:units(id, nama)")
    .eq("id", user!.id)
    .single()

  const { data } = await supabase
    .from("transaksi")
    .select(`
      *,
      kategori:kategori(nama, tipe),
      unit:units(nama),
      creator:profiles!created_by(nama),
      approver:profiles!approved_by(nama)
    `)
    .eq("id", id)
    .single()

  if (!data) notFound()

  const trx = data as Transaksi
  const p = profile as Profile

  const { data: auditLogs } = await supabase
    .from("audit_log")
    .select("aksi, data_lama, data_baru, changed_at, changer:profiles!changed_by(nama)")
    .eq("record_id", trx.nomor)
    .order("changed_at", { ascending: true })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/transaksi">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-800">{trx.nomor}</h2>
          <p className="text-sm text-slate-500 mt-0.5">Detail Transaksi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Informasi Transaksi</CardTitle>
              <StatusBadge status={trx.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label="Nomor" value={trx.nomor} />
            <Row label="Tanggal" value={formatDate(trx.tanggal)} />
            <Row
              label="Jenis"
              value={
                <span className={`font-medium ${trx.jenis === "masuk" ? "text-emerald-600" : "text-rose-500"}`}>
                  {trx.jenis === "masuk" ? "Pemasukan" : "Pengeluaran"}
                </span>
              }
            />
            <Row
              label="Jumlah"
              value={
                <span className="font-bold text-slate-800">{formatRupiah(trx.jumlah)}</span>
              }
            />
            <Row label="Kategori" value={trx.kategori?.nama ?? "—"} />
            <Row label="Unit" value={trx.unit?.nama ?? "—"} />
            {trx.keterangan && <Row label="Keterangan" value={trx.keterangan} />}
            {trx.is_reversal && (
              <Row label="Jenis" value={<span className="text-rose-500 font-medium text-sm">Transaksi Reversal</span>} />
            )}
          </CardContent>
        </Card>

        {/* Workflow Info */}
        <Card>
          <CardHeader><CardTitle>Alur Persetujuan</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <WorkflowStep label="Dibuat" done={true} by={(trx.creator as unknown as { nama: string })?.nama} at={trx.created_at} />
            <WorkflowStep label="Diajukan" done={!!trx.submitted_at} by={trx.submitted_at ? "Operator" : undefined} at={trx.submitted_at ?? undefined} />
            <WorkflowStep label="Disetujui" done={!!trx.approved_at} by={(trx.approver as unknown as { nama: string })?.nama} at={trx.approved_at ?? undefined} />
            <WorkflowStep label="Posted" done={!!trx.posted_at} at={trx.posted_at ?? undefined} />
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <WorkflowActions trx={trx} profile={p} />

      {/* Audit Log */}
      {auditLogs && auditLogs.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Riwayat Perubahan</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {auditLogs.map((log: { aksi: string; changed_at: string; changer?: { nama?: string } | unknown }, i: number) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-slate-700 font-medium">{log.aksi}</p>
                    <p className="text-slate-400 text-xs">
                      {formatDate(log.changed_at)}
                      {(log.changer as { nama?: string } | null)?.nama && ` • ${(log.changer as { nama: string }).nama}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="text-sm text-slate-500 w-28 shrink-0">{label}</span>
      <span className="text-sm text-slate-800">{value}</span>
    </div>
  )
}

function WorkflowStep({ label, done, by, at }: { label: string; done: boolean; by?: string; at?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-300"}`}>
        {done ? "✓" : "○"}
      </div>
      <div>
        <p className={`text-sm font-medium ${done ? "text-slate-800" : "text-slate-400"}`}>{label}</p>
        {done && (by || at) && (
          <p className="text-xs text-slate-400">
            {by && `${by} • `}{at && formatDate(at)}
          </p>
        )}
      </div>
    </div>
  )
}
