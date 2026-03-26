"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export function Dialog({ open, onClose, children, className }: DialogProps) {
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-xl p-6",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function DialogHeader({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-lg font-semibold text-slate-800", className)}>
      {children}
    </h2>
  )
}

export function DialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-end gap-3 mt-6", className)}>
      {children}
    </div>
  )
}
