import * as React from "react"
import { cn } from "@/lib/utils"
import type { StatusTransaksi } from "@/lib/types"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "info" | "outline"
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-slate-100 text-slate-700": variant === "default",
          "bg-emerald-50 text-emerald-700": variant === "success",
          "bg-amber-50 text-amber-700": variant === "warning",
          "bg-rose-50 text-rose-700": variant === "destructive",
          "bg-blue-50 text-blue-700": variant === "info",
          "border border-slate-200 text-slate-600": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
)
Badge.displayName = "Badge"

export function StatusBadge({ status }: { status: StatusTransaksi }) {
  const config: Record<StatusTransaksi, { label: string; variant: BadgeProps["variant"] }> = {
    draft: { label: "Draft", variant: "default" },
    submitted: { label: "Diajukan", variant: "warning" },
    approved: { label: "Disetujui", variant: "info" },
    posted: { label: "Posted", variant: "success" },
  }
  const { label, variant } = config[status]
  return <Badge variant={variant}>{label}</Badge>
}

export { Badge }
