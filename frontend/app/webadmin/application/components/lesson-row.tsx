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
    <div className="flex items-center justify-between px-4 py-4 transition-colors hover:bg-background">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
          <BookOpen className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="truncate font-medium text-foreground">
              {lesson.title}
            </h3>
            <StatusBadge status={lesson.status} />
          </div>
          <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[8px] font-medium text-white">
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
        <span className="mr-2 hidden text-sm text-muted-foreground lg:inline">
          {lesson.submittedAt}
        </span>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            aria-label="More options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-border bg-card py-1 shadow-lg">
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
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-success transition-colors hover:bg-success-background"
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
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive-background"
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
