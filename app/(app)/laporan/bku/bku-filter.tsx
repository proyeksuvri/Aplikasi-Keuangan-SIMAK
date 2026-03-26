"use client"

import { useRouter, usePathname } from "next/navigation"
import { Select } from "@/components/ui/select"
import { MONTHS } from "@/lib/utils"
import type { Unit } from "@/lib/types"

interface BkuFilterBarProps {
  bulan: number
  tahun: number
  unit_id: string
  units: Unit[]
  showUnitFilter: boolean
}

export function BkuFilterBar({ bulan, tahun, unit_id, units, showUnitFilter }: BkuFilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()

  function update(key: string, value: string) {
    const p = new URLSearchParams({ bulan: String(bulan), tahun: String(tahun), unit_id, [key]: value })
    for (const [k, v] of [...p.entries()]) if (!v) p.delete(k)
    router.push(`${pathname}?${p.toString()}`)
  }

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

  return (
    <div className="flex flex-wrap gap-3">
      <Select value={String(bulan)} onChange={(e) => update("bulan", e.target.value)} className="w-36">
        {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
      </Select>
      <Select value={String(tahun)} onChange={(e) => update("tahun", e.target.value)} className="w-24">
        {years.map((y) => <option key={y} value={y}>{y}</option>)}
      </Select>
      {showUnitFilter && (
        <Select value={unit_id} onChange={(e) => update("unit_id", e.target.value)} className="w-44">
          <option value="">Semua Unit</option>
          {units.map((u) => <option key={u.id} value={u.id}>{u.nama}</option>)}
        </Select>
      )}
    </div>
  )
}
