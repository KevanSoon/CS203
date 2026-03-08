"use client"

import { useState, useRef, useEffect } from "react"
import { Check, X, Eye, MoreHorizontal, BookOpen } from "lucide-react"
import { StatusBadge } from "./status-badge"
import { parseTags, getVisibleTags } from "@/app/utils/tags"

type LessonStatus = "pending" | "approved" | "rejected"

interface Lesson {
  title: string
  description: string
  createdBy: string
  createdAt: string
  status: LessonStatus
  tags?: string[] | string | null
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toISOString().split("T")[0]
}

interface LessonRowProps {
  lesson: Lesson
  onApprove: (title: string) => void
  onReject: (title: string) => void
  onPreview: (lesson: Lesson) => void
}

export function LessonRow({
  lesson,
  onApprove,
  onReject,
  onPreview,
}: LessonRowProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [descModalOpen, setDescModalOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const descLimit = 125
  const isLongDesc = lesson.description.length > descLimit
  const truncatedDesc = isLongDesc
    ? lesson.description.slice(0, descLimit) + "..."
    : lesson.description

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
    <div className="px-4 py-6 transition-colors hover:bg-background">
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
                <StatusBadge status={lesson.status} />
                {lesson.tags && (
                  (() => {
                    const tagsArr = parseTags(lesson.tags)
                    const { visible, remaining } = getVisibleTags(tagsArr)

                    return (
                      <div className="flex flex-wrap gap-1">
                        {visible.map((t) => (
                          <span
                            key={t}
                            className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                          >
                            {t}
                          </span>
                        ))}
                        {remaining > 0 && (
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">
                            +{remaining}
                          </span>
                        )}
                      </div>
                    )
                  })()
                )}
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
                <div className="absolute right-0 top-full z-10 mt-1 w-44 rounded-lg border border-border bg-card py-1 shadow-lg">
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
                        onApprove(lesson.title)
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
                        onReject(lesson.title)
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
          <p className="text-sm text-muted-foreground mb-1">
            {truncatedDesc}
            {isLongDesc && (
              <button
                onClick={() => setDescModalOpen(true)}
                className="ml-1 text-primary hover:underline font-medium"
              >
                See full description
              </button>
            )}
          </p>

          {descModalOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
              onClick={() => setDescModalOpen(false)}
            >
              <div
                className="mx-4 max-w-lg w-full rounded-lg border border-border bg-card p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">{lesson.title}</h3>
                  <button
                    onClick={() => setDescModalOpen(false)}
                    className="p-1 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {lesson.description}
                </p>
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {lesson.createdBy} · Created: {formatDate(lesson.createdAt)}
          </p>
        </div>
      </div>
    </div>
  )
}
