"use client"

import { useRouter, usePathname } from "next/navigation"
import { Select } from "@/components/ui/select"
import { MONTHS } from "@/lib/utils"
import type { Unit } from "@/lib/types"

interface FilterBarProps {
  bulan: number
  tahun: number
  jenis: string
  status: string
  unit_id: string
  units: Unit[]
  showUnitFilter: boolean
}

export function FilterBar({ bulan, tahun, jenis, status, unit_id, units, showUnitFilter }: FilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams({
      bulan: String(bulan),
      tahun: String(tahun),
      jenis,
      status,
      unit_id,
      [key]: value,
    })
    // Remove empty params
    for (const [k, v] of [...params.entries()]) {
      if (!v) params.delete(k)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

  return (
    <div className="flex flex-wrap gap-3">
      <Select
        value={String(bulan)}
        onChange={(e) => updateFilter("bulan", e.target.value)}
        className="w-36"
      >
        {MONTHS.map((m, i) => (
          <option key={i + 1} value={i + 1}>{m}</option>
        ))}
      </Select>

      <Select
        value={String(tahun)}
        onChange={(e) => updateFilter("tahun", e.target.value)}
        className="w-24"
      >
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </Select>

      <Select
        value={jenis}
        onChange={(e) => updateFilter("jenis", e.target.value)}
        className="w-36"
      >
        <option value="">Semua Jenis</option>
        <option value="masuk">Pemasukan</option>
        <option value="keluar">Pengeluaran</option>
      </Select>

      <Select
        value={status}
        onChange={(e) => updateFilter("status", e.target.value)}
        className="w-36"
      >
        <option value="">Semua Status</option>
        <option value="draft">Draft</option>
        <option value="submitted">Diajukan</option>
        <option value="approved">Disetujui</option>
        <option value="posted">Posted</option>
      </Select>

      {showUnitFilter && (
        <Select
          value={unit_id}
          onChange={(e) => updateFilter("unit_id", e.target.value)}
          className="w-44"
        >
          <option value="">Semua Unit</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>{u.nama}</option>
          ))}
        </Select>
      )}
    </div>
  )
}
