"use client"

import { useEffect } from "react"
import { X, User } from "lucide-react"
import { StatusBadge } from "./status-badge"

type LessonStatus = "pending" | "approved" | "rejected"

interface Lesson {
  title: string
  description: string
  createdBy: string
  createdAt: string
  status: LessonStatus
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toISOString().split("T")[0]
}

interface PreviewModalProps {
  lesson: Lesson
  onClose: () => void
}

export function PreviewModal({ lesson, onClose }: PreviewModalProps) {
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEscape)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start justify-between gap-4 pr-8">
          <h2 className="text-xl font-semibold text-foreground">
            {lesson.title}
          </h2>
          <StatusBadge status={lesson.status} />
        </div>

        <div className="mt-6 space-y-4">
          <p className="text-muted-foreground">{lesson.description}</p>

          <div className="rounded-lg border border-border bg-background p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Author</p>
                <p className="text-sm font-medium text-foreground">{lesson.createdBy}</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Created: {formatDate(lesson.createdAt)}
          </p>
        </div>
      </div>
    </div>
  )
}
