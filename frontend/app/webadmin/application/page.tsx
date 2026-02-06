"use client"

import { useState, useMemo } from "react"
import { StatsCards } from "./components/stats-cards"
import { LessonsTable } from "./components/lessons-table"
import { Toast } from "./components/toast"

// Types
export type LessonStatus = "pending" | "approved" | "rejected"

export interface Lesson {
  id: string
  title: string
  description: string
  created_by: string
  createdAt: string
  category: string
  duration: string
  status: LessonStatus
}

export interface LessonStats {
  total: number
  pending: number
  approved: number
  rejected: number
}

// Mock Data
const mockLessons: Lesson[] = [
  {
    id: "1",
    title: "Gen Alpha Slangs 101",
    description: "No cap, this lesson is bussin! Learn the most fire slang from Gen Alpha including skibidi, rizz, and gyatt. Your brain rot era starts here fr fr.",
    created_by: "Skibidi Steve",
    createdAt: "2026-02-06T06:00:00",
    category: "gen-alpha",
    duration: "15 min",
    status: "pending",
  },
  {
    id: "2",
    title: "Gaming Lingo Basics",
    description: "Get gud at gaming terminology! Learn what GG, AFK, and noob mean. This lesson hits different - you'll be speaking gamer in no time, no cap.",
    created_by: "Rizz Master",
    createdAt: "2026-02-06T03:00:00",
    category: "gaming",
    duration: "20 min",
    status: "pending",
  },
  {
    id: "3",
    title: "TikTok Trends Decoded",
    description: "Slay the FYP with this bussin guide to TikTok trends! From the Skibidi Toilet to Grimace Shake, we got you covered. It's giving main character energy.",
    created_by: "Sigma Sarah",
    createdAt: "2026-02-05T08:00:00",
    category: "tiktok",
    duration: "25 min",
    status: "approved",
  },
  {
    id: "4",
    title: "Mewing for Beginners",
    description: "Want that sigma jawline? This lesson teaches proper mewing technique. Looksmax your way to success - your glow up starts now bestie!",
    created_by: "Chad McRizz",
    createdAt: "2026-02-04T08:00:00",
    category: "lifestyle",
    duration: "10 min",
    status: "approved",
  },
  {
    id: "5",
    title: "Ohio Memes Explained",
    description: "Only in Ohio would someone make a whole lesson about Ohio memes. This is lowkey unhinged but highkey educational. Certified brainrot content.",
    created_by: "Only in Ohio",
    createdAt: "2026-02-03T08:00:00",
    category: "memes",
    duration: "30 min",
    status: "rejected",
  },
  {
    id: "6",
    title: "Rizz Academy: Level Up",
    description: "Become the ultimate rizzler! Learn W rizz techniques that are absolutely goated. This lesson is so sigma it should be illegal. No L's allowed.",
    created_by: "Duke of Rizz",
    createdAt: "2026-02-06T04:00:00",
    category: "social",
    duration: "45 min",
    status: "pending",
  },
]

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
  const [lessons, setLessons] = useState<Lesson[]>(mockLessons)
  const [searchQuery, setSearchQuery] = useState("")
  const [toast, setToast] = useState<ToastState>({ show: false, message: "", type: "success" })

  const filteredLessons = useMemo(() => {
    if (!searchQuery.trim()) return lessons
    const query = searchQuery.toLowerCase()
    return lessons.filter(
      (lesson) =>
        lesson.title.toLowerCase().includes(query) ||
        lesson.created_by.toLowerCase().includes(query) ||
        lesson.category.toLowerCase().includes(query)
    )
  }, [lessons, searchQuery])

  const stats = useMemo(() => getLessonStats(lessons), [lessons])

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000)
  }

  const updateLessonStatus = (id: string, status: LessonStatus) => {
    setLessons((prev) =>
      prev.map((lesson) =>
        lesson.id === id ? { ...lesson, status } : lesson
      )
    )
  }

  const handleApprove = (id: string) => {
    const lesson = lessons.find((l) => l.id === id)
    updateLessonStatus(id, "approved")
    showToast(`"${lesson?.title}" has been approved for publishing.`, "success")
  }

  const handleReject = (id: string) => {
    const lesson = lessons.find((l) => l.id === id)
    updateLessonStatus(id, "rejected")
    showToast(`"${lesson?.title}" has been rejected.`, "error")
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Lesson Approval Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Review and approve lessons submitted by instructors for publication.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <StatsCards stats={stats} />
          <LessonsTable
            lessons={filteredLessons}
            onApprove={handleApprove}
            onReject={handleReject}
          />
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
