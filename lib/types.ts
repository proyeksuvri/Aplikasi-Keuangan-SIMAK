export type Role = "admin" | "operator" | "auditor"
export type JenisTransaksi = "masuk" | "keluar"
export type StatusTransaksi = "draft" | "submitted" | "approved" | "posted"
export type TipeKategori = "masuk" | "keluar"

export interface Profile {
  id: string
  nama: string
  role: Role
  unit_id: string | null
  created_at?: string
  unit?: Unit
}

export interface Unit {
  id: string
  nama: string
  created_at?: string
}

export interface Kategori {
  id: string
  nama: string
  tipe: TipeKategori
  active?: boolean
  created_at?: string
}

export interface Transaksi {
  id: string
  nomor: string
  tanggal: string
  jenis: JenisTransaksi
  jumlah: number
  kategori_id: string
  unit_id: string
  keterangan: string | null
  status: StatusTransaksi
  created_by: string
  submitted_by: string | null
  submitted_at: string | null
  approved_by: string | null
  approved_at: string | null
  posted_at: string | null
  is_reversal: boolean
  reversal_of: string | null
  created_at: string
  updated_at: string
  // joins
  kategori?: Kategori
  unit?: Unit
  creator?: Profile
  approver?: Profile
}

export interface AuditLog {
  id: string
  tabel: string
  record_id: string
  aksi: string
  data_lama: Record<string, unknown> | null
  data_baru: Record<string, unknown> | null
  changed_by: string | null
  changed_at: string
  changer?: Profile
}

export interface PeriodeLock {
  id: string
  tahun: number
  bulan: number
  locked: boolean
  locked_by: string | null
  locked_at: string | null
  locker?: Profile
}

export interface DashboardStats {
  saldo: number
  pemasukan_bulan: number
  pengeluaran_bulan: number
  total_transaksi: number
}

export interface CashflowBulanan {
  bulan: number
  tahun: number
  total_masuk: number
  total_keluar: number
  selisih: number
}
