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
  author: string
  category: string
  duration: string
  status: LessonStatus
  submittedAt: string
  description: string
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
    title: "Introduction to React Hooks",
    author: "Sarah Chen",
    category: "Frontend",
    duration: "45 min",
    status: "pending",
    submittedAt: "2 hours ago",
    description: "Learn the fundamentals of React Hooks including useState, useEffect, and custom hooks. This lesson covers practical examples and best practices for modern React development.",
  },
  {
    id: "2",
    title: "Advanced TypeScript Patterns",
    author: "Michael Park",
    category: "TypeScript",
    duration: "60 min",
    status: "pending",
    submittedAt: "5 hours ago",
    description: "Explore advanced TypeScript patterns including conditional types, mapped types, and template literal types. Perfect for developers looking to level up their TypeScript skills.",
  },
  {
    id: "3",
    title: "Building REST APIs with Node.js",
    author: "Emily Johnson",
    category: "Backend",
    duration: "90 min",
    status: "approved",
    submittedAt: "1 day ago",
    description: "A comprehensive guide to building scalable REST APIs using Node.js and Express. Covers routing, middleware, authentication, and error handling.",
  },
  {
    id: "4",
    title: "CSS Grid Layout Mastery",
    author: "David Kim",
    category: "CSS",
    duration: "30 min",
    status: "approved",
    submittedAt: "2 days ago",
    description: "Master CSS Grid Layout with practical examples. Learn how to create complex layouts with minimal code and responsive design patterns.",
  },
  {
    id: "5",
    title: "Database Design Fundamentals",
    author: "Lisa Wang",
    category: "Database",
    duration: "75 min",
    status: "rejected",
    submittedAt: "3 days ago",
    description: "Learn the principles of database design including normalization, indexing, and query optimization. Covers both SQL and NoSQL approaches.",
  },
  {
    id: "6",
    title: "Git Workflow Best Practices",
    author: "James Wilson",
    category: "DevOps",
    duration: "40 min",
    status: "pending",
    submittedAt: "4 hours ago",
    description: "Discover effective Git workflows for team collaboration. Covers branching strategies, code review practices, and CI/CD integration.",
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
        lesson.author.toLowerCase().includes(query) ||
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
          <h1 className="text-2xl font-bold text-foreground">
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
