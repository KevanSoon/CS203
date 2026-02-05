"use client"

import { useEffect } from "react"
import { X, Clock, User, Tag } from "lucide-react"
import { StatusBadge } from "./status-badge"

type LessonStatus = "pending" | "approved" | "rejected"

interface Lesson {
  id: string
  title: string
  author: string
  category: string
  duration: string
  status: LessonStatus
  submittedAt: string
  description: string
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

          <div className="grid grid-cols-3 gap-4 rounded-lg border border-border bg-background p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Author</p>
                <p className="text-sm font-medium text-foreground">{lesson.author}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="text-sm font-medium text-foreground">{lesson.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-sm font-medium text-foreground">{lesson.duration}</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Submitted {lesson.submittedAt}
          </p>
        </div>
      </div>
    </div>
  )
}
