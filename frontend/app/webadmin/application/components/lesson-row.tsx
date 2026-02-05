"use client"

import { useState, useRef, useEffect } from "react"
import { Check, X, Eye, MoreHorizontal, Clock, BookOpen } from "lucide-react"
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

  const initials = lesson.author
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

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
    <div className="flex items-center justify-between px-4 py-4 transition-colors hover:bg-[var(--color-surface-hover)]">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-surface-hover)]">
          <BookOpen className="h-5 w-5 text-[var(--color-text-muted)]" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="truncate font-medium text-[var(--color-text)]">
              {lesson.title}
            </h3>
            <StatusBadge status={lesson.status} />
          </div>
          <div className="mt-1 flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
            <div className="flex items-center gap-1.5">
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-primary)] text-[8px] font-medium text-[var(--color-background)]">
                {initials}
              </div>
              <span>{lesson.author}</span>
            </div>
            <span className="hidden sm:inline">{lesson.category}</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{lesson.duration}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="mr-2 hidden text-sm text-[var(--color-text-muted)] lg:inline">
          {lesson.submittedAt}
        </span>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-gray-100 hover:text-[var(--color-text)]"
            aria-label="More options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-[var(--color-border)] bg-white py-1 shadow-lg">
              <button
                onClick={() => {
                  onPreview(lesson)
                  setMenuOpen(false)
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--color-text)] transition-colors hover:bg-gray-100"
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
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--color-success)] transition-colors hover:bg-gray-100"
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
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--color-destructive)] transition-colors hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                  Reject
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
