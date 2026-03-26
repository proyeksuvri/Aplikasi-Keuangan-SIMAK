"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { Profile } from "@/lib/types"
import {
  LayoutDashboard,
  ArrowLeftRight,
  FileText,
  BookOpen,
  Tags,
  Building2,
  Users,
  Settings,
  TrendingUp,
} from "lucide-react"

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  roles?: string[]
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transaksi", label: "Transaksi", icon: ArrowLeftRight },
  { href: "/laporan/bku", label: "Buku Kas Umum", icon: BookOpen },
  { href: "/laporan/cashflow", label: "Cash Flow", icon: TrendingUp },
  { href: "/master/kategori", label: "Kategori", icon: Tags, roles: ["admin"] },
  { href: "/master/unit", label: "Unit", icon: Building2, roles: ["admin"] },
  { href: "/users", label: "Pengguna", icon: Users, roles: ["admin"] },
  { href: "/settings", label: "Pengaturan", icon: Settings, roles: ["admin"] },
]

interface SidebarProps {
  profile: Profile | null
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()

  const visibleItems = navItems.filter((item) => {
    if (!item.roles) return true
    return item.roles.includes(profile?.role ?? "")
  })

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <span className="text-xl font-bold">S</span>
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-800">SIMAK</span>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">UIN Palopo</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                isActive
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
            {profile?.nama?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">
              {profile?.nama ?? "—"}
            </p>
            <p className="text-xs text-slate-400 capitalize">{profile?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
