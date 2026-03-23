"use client"

import { useEffect } from "react"
import { X, User } from "lucide-react"
import { StatusBadge } from "./status-badge"

type LessonStatus = "pending" | "approved" | "rejected"

interface Lesson {
  id?: number
  title: string
  description: string
  lessonPictureUrl?: string | null
  createdBy: string
  createdAt: string
  status: LessonStatus
}

interface LessonPreviewDetail {
  id?: number
  title: string
  description: string
  lessonPictureUrl?: string | null
  createdBy: string
  createdAt: string
  status?: LessonStatus
  chapters?: Array<{
    title: string
    cards?: Array<{ front: string; back: string }>
    quizQuestions?: Array<{ question: string }>
  }>
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toISOString().split("T")[0]
}

function isSafeImageSrc(src: string | null | undefined): boolean {
  if (!src) return false;
  return src.startsWith("https://") || src.startsWith("blob:");
}

interface PreviewModalProps {
  lesson: Lesson
  lessonDetail?: LessonPreviewDetail | null
  loadingDetail?: boolean
  onClose: () => void
}

export function PreviewModal({ lesson, lessonDetail, loadingDetail = false, onClose }: PreviewModalProps) {
  const activeLesson = lessonDetail ?? lesson
  const chapterCount = lessonDetail?.chapters?.length ?? 0
  const cardCount = lessonDetail?.chapters?.reduce((sum: number, chapter: { cards?: Array<{ front: string; back: string }> }) => sum + (chapter.cards?.length ?? 0), 0) ?? 0
  const quizCount = lessonDetail?.chapters?.reduce((sum: number, chapter: { quizQuestions?: Array<{ question: string }> }) => sum + (chapter.quizQuestions?.length ?? 0), 0) ?? 0

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
          {isSafeImageSrc(activeLesson.lessonPictureUrl) && (
            <img
              src={activeLesson.lessonPictureUrl!}
              alt={activeLesson.title}
              className="h-16 w-24 rounded-lg object-cover shrink-0"
            />
          )}
          <h2 className="text-xl font-semibold text-foreground">
            {activeLesson.title}
          </h2>
          <StatusBadge status={lesson.status} />
        </div>

        <div className="mt-6 space-y-4">
          {loadingDetail ? (
            <p className="text-sm text-muted-foreground">Loading full lesson preview...</p>
          ) : (
            <>
              <p className="text-muted-foreground">{activeLesson.description}</p>
              {!!lessonDetail?.chapters?.length && (
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-sm font-semibold text-foreground mb-2">Lesson content snapshot</p>
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <span>Chapters: {chapterCount}</span>
                    <span>Cards: {cardCount}</span>
                    <span>Quizzes: {quizCount}</span>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="rounded-lg border border-border bg-background p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Author</p>
                <p className="text-sm font-medium text-foreground">{activeLesson.createdBy}</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Created: {formatDate(activeLesson.createdAt)}
          </p>
        </div>
      </div>
    </div>
  )
}
