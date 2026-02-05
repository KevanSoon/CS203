"use client"

import { useState } from "react"
import { LessonRow } from "./lesson-row"
import { FilterTabs } from "./filter-tabs"
import { PreviewModal } from "./preview-modal"

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

type FilterValue = "all" | LessonStatus

interface LessonsTableProps {
  lessons: Lesson[]
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

export function LessonsTable({
  lessons,
  onApprove,
  onReject,
}: LessonsTableProps) {
  const [filter, setFilter] = useState<FilterValue>("all")
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null)

  const filteredLessons =
    filter === "all" ? lessons : lessons.filter((l) => l.status === filter)

  const counts = {
    all: lessons.length,
    pending: lessons.filter((l) => l.status === "pending").length,
    approved: lessons.filter((l) => l.status === "approved").length,
    rejected: lessons.filter((l) => l.status === "rejected").length,
  }

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white">
      <div className="flex flex-col gap-4 border-b border-[var(--color-border)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">
          Lesson Submissions
        </h2>
        <FilterTabs
          activeFilter={filter}
          onFilterChange={setFilter}
          counts={counts}
        />
      </div>

      <div className="divide-y divide-[var(--color-border)]">
        {filteredLessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-[var(--color-text-muted)]">No lessons found</p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {filter !== "all"
                ? `No ${filter} lessons at the moment`
                : "No lessons have been submitted yet"}
            </p>
          </div>
        ) : (
          filteredLessons.map((lesson) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              onApprove={onApprove}
              onReject={onReject}
              onPreview={setPreviewLesson}
            />
          ))
        )}
      </div>

      {previewLesson && (
        <PreviewModal
          lesson={previewLesson}
          onClose={() => setPreviewLesson(null)}
        />
      )}
    </div>
  )
}
