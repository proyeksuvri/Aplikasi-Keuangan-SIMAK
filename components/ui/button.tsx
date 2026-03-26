import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "ghost" | "outline"
  size?: "sm" | "md" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm":
              variant === "primary",
            "bg-slate-100 text-slate-700 hover:bg-slate-200":
              variant === "secondary",
            "bg-rose-500 text-white hover:bg-rose-600 shadow-sm":
              variant === "destructive",
            "text-slate-600 hover:bg-slate-100 hover:text-slate-800":
              variant === "ghost",
            "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50":
              variant === "outline",
          },
          {
            "h-7 px-2.5 text-xs": size === "sm",
            "h-9 px-4 text-sm": size === "md",
            "h-11 px-6 text-base": size === "lg",
            "h-9 w-9 p-0": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
