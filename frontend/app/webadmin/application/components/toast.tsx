"use client"

import { useEffect } from "react"
import { CheckCircle2, XCircle, X } from "lucide-react"

interface ToastProps {
  show: boolean
  message: string
  type: "success" | "error"
  onClose: () => void
}

export function Toast({ show, message, type, onClose }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  if (!show) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div
        className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${
          type === "success"
            ? "border-success/30 bg-success-light"
            : "border-destructive/30 bg-destructive-light"
        }`}
      >
        {type === "success" ? (
          <CheckCircle2 className="h-5 w-5 text-success" />
        ) : (
          <XCircle className="h-5 w-5 text-destructive" />
        )}
        <p
          className={`text-sm font-medium ${
            type === "success" ? "text-success-dark" : "text-destructive-dark"
          }`}
        >
          {message}
        </p>
        <button
          onClick={onClose}
          className={`ml-2 rounded-md p-1 transition-colors ${
            type === "success"
              ? "text-success hover:bg-success/20"
              : "text-destructive hover:bg-destructive/20"
          }`}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
