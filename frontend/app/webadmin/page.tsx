"use client"

import { useState, useEffect } from "react"
import { api } from "@/app/api/api"
import { StatsCards } from "./components/stats-cards"
import { LessonsTable } from "./components/lessons-table"
import { Toast } from "./components/toast"
import { Sidebar } from "@/app/components/Sidebar";

// Types
export type LessonStatus = "pending" | "approved" | "rejected"

export interface Lesson {
  title: string
  description: string
  createdBy: string
  createdAt: string
  status: LessonStatus
}

export interface LessonStats {
  total: number
  pending: number
  approved: number
  rejected: number
}

function getLessonStats(lessons: Lesson[]): LessonStats {
  return {
    total: lessons.length,
    pending: lessons.filter((l) => l.status === "pending").length,
    approved: lessons.filter((l) => l.status === "approved").length,
    rejected: lessons.filter((l) => l.status === "rejected").length,
  }
}

interface ToastState {
  show: boolean
  message: string
  type: "success" | "error"
}

export default function DashboardPage() {
  const [selected, setSelected] = useState("Manage Applications");
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<ToastState>({ show: false, message: "", type: "success" })

  useEffect(() => {
    async function fetchLessons() {
      try {
        const [pendingRes, applicationsRes] = await Promise.all([
          api.get("/api/lesson/applications/pending"),
          api.get("/api/lesson/applications"),
        ])
        const pendingLessons = pendingRes.data.map((l: Omit<Lesson, "status">) => ({ ...l, status: "pending" as const }))
        const allLessons = [...pendingLessons, ...applicationsRes.data]
        setLessons(allLessons)
      } catch (err) {
        console.error("Failed to fetch lessons:", err)
        showToast("Failed to fetch lessons.", "error")
      } finally {
        setLoading(false)
      }
    }
    fetchLessons()
  }, [])

  const stats = getLessonStats(lessons)

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000)
  }

  const updateLessonStatus = (title: string, status: LessonStatus) => {
    setLessons((prev) =>
      prev.map((lesson) =>
        lesson.title === title ? { ...lesson, status } : lesson
      )
    )
  }

  const handleApprove = (title: string) => {
    updateLessonStatus(title, "approved")
    showToast(`"${title}" has been approved for publishing.`, "success")
  }

  const handleReject = (title: string) => {
    updateLessonStatus(title, "rejected")
    showToast(`"${title}" has been rejected.`, "error")
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar selected={selected} setSelected={setSelected} />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Lesson Approval Dashboard
            </h1>
            <p className="mt-1 text-muted-foreground">
              Review and approve lessons submitted by instructors for publication.
            </p>
          </div>

          {loading ? (
            <p className="text-muted-foreground">Loading lessons...</p>
          ) : (
            <div className="flex flex-col gap-6">
              <StatsCards stats={stats} />
              <LessonsTable
                lessons={lessons}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            </div>
          )}
        </div>
      </main>

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  )
}
