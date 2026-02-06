"use client"

import { useState, useRef, useEffect } from "react"
import { Check, X, Eye, MoreHorizontal, BookOpen } from "lucide-react"
import { StatusBadge } from "./status-badge"

type LessonStatus = "pending" | "approved" | "rejected"

interface Lesson {
  id: string
  title: string
  description: string
  created_by: string
  createdAt: string
  category: string
  duration: string
  status: LessonStatus
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toISOString().split("T")[0]
}

interface LessonRowProps {
  lesson: Lesson
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onPreview: (lesson: Lesson) => void
}

export function LessonRow({
  lesson,
  onApprove,
  onReject,
  onPreview,
}: LessonRowProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="px-4 py-4 transition-colors hover:bg-background">
      <div className="flex items-start gap-3">
        <div className="hidden sm:block p-3 rounded-lg bg-primary/10 shrink-0">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground mb-1">
                {lesson.title}
              </p>
              <div className="flex flex-wrap items-center gap-1 mb-2">
                <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                  {lesson.category}
                </span>
                <StatusBadge status={lesson.status} />
              </div>
            </div>
            <div className="relative shrink-0" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                aria-label="More options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border border-border bg-card py-1 shadow-lg">
                  <button
                    onClick={() => {
                      onPreview(lesson)
                      setMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-background"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </button>
                  {lesson.status !== "approved" && (
                    <button
                      onClick={() => {
                        onApprove(lesson.id)
                        setMenuOpen(false)
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-success transition-colors hover:bg-success-light"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </button>
                  )}
                  {lesson.status !== "rejected" && (
                    <button
                      onClick={() => {
                        onReject(lesson.id)
                        setMenuOpen(false)
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive-light"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">{lesson.description}</p>
          <p className="text-xs text-muted-foreground">
            {lesson.created_by} · {lesson.duration} · Created: {formatDate(lesson.createdAt)}
          </p>
        </div>
      </div>
    </div>
  )
}
