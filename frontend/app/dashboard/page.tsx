"use client";

import { useEffect, useMemo, useState } from "react";
import LessonCard from "@/app/dashboard/components/LessonCard";
import { Sidebar } from "@/app/components/Sidebar";
import { api } from "@/app/api/api";
import TagFilterSearch from "@/app/components/TagFilterSearch";
import { useProgressStore, isDashboardStale, DashboardProgress } from "@/app/store/ProgressStore";

/** Shape returned by existing GET /api/lesson (LessonSummaryResponse) */
interface LessonSummary {
  id: number;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
  tags: string | null;
  lessonPictureUrl: string | null;
}

/** Merged view for rendering — lesson metadata + progress overlay */
interface MergedLesson {
  lessonId: number;
  title: string;
  description: string;
  lessonPictureUrl: string | null;
  tags: string | null;
  status: "in_progress" | "completed" | "not_started";
  progressPercent: number;
}

function parseTags(tags?: string | null): string[] {
  if (!tags) return [];
  return tags.split(",").map((t) => t.trim()).filter(Boolean);
}

function normalize(s: string) {
  return s.trim().toLowerCase();
}

export default function DashboardPage() {
  const [selected, setSelected] = useState("View Lessons");
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  /** Lesson metadata from existing LessonController */
  const [lessons, setLessons] = useState<LessonSummary[]>([]);

  const { dashboardProgress, setDashboardProgress } = useProgressStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Parallel fetch: lesson metadata + lightweight progress
        const [lessonsRes, progressRes] = await Promise.all([
          api.get<LessonSummary[]>("/api/lesson"),
          isDashboardStale() || dashboardProgress.length === 0
            ? api.get<DashboardProgress[]>("/api/progress/dashboard")
            : Promise.resolve(null),
        ]);

        setLessons(lessonsRes.data);

        if (progressRes) {
          setDashboardProgress(progressRes.data);
        }
      } catch (err: unknown) {
        console.error(err);
        setError("Failed to load lessons.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /** Merge lessons + progress by lessonId */
  const merged: MergedLesson[] = useMemo(() => {
    const progressMap = new Map(dashboardProgress.map((p) => [p.lessonId, p]));
    return lessons.map((lesson) => {
      const progress = progressMap.get(lesson.id);
      return {
        lessonId: lesson.id,
        title: lesson.title,
        description: lesson.description,
        lessonPictureUrl: lesson.lessonPictureUrl,
        tags: lesson.tags,
        status: progress?.status ?? "not_started",
        progressPercent: progress?.progressPercent ?? 0,
      };
    });
  }, [lessons, dashboardProgress]);

  const addTag = (tag: string) => {
    const cleaned = tag.trim();
    if (!cleaned) return;
    const exists = selectedTags.some((t) => normalize(t) === normalize(cleaned));
    if (exists) return;
    setSelectedTags((prev) => [...prev, cleaned]);
  };

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const clearAll = () => setSelectedTags([]);

  const filteredLessons = useMemo(() => {
    if (selectedTags.length === 0) return merged;
    const selectedNorm = selectedTags.map(normalize);
    return merged.filter((lesson) => {
      const lessonTags = parseTags(lesson.tags).map(normalize);
      return selectedNorm.every((sel) => lessonTags.includes(sel));
    });
  }, [merged, selectedTags]);

  const inProgress = filteredLessons.filter((l) => l.status === "in_progress");
  const notStarted = filteredLessons.filter((l) => l.status === "not_started");
  const completed  = filteredLessons.filter((l) => l.status === "completed");

  const renderSection = (title: string, items: MergedLesson[]) => {
    if (items.length === 0) return null;
    return (
      <div className="mt-10">
        <h2 className="text-lg font-bold mb-4 text-foreground">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((lesson) => (
            <LessonCard
              key={lesson.lessonId}
              lessonId={lesson.lessonId}
              title={lesson.title}
              description={lesson.description}
              image={lesson.lessonPictureUrl ?? "/images/questionmark.jpg"}
              progress={lesson.progressPercent}
              status={lesson.status}
              tags={parseTags(lesson.tags)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex w-full bg-background text-foreground">
      <Sidebar selected={selected} setSelected={setSelected} />

      <div className="flex-1 px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-black mb-2">
          Your Daily Grind 🔥
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Enrolled &amp; Available Courses
        </p>

        <TagFilterSearch
          query={query}
          setQuery={setQuery}
          selectedTags={selectedTags}
          addTag={addTag}
          removeTag={removeTag}
          clearAll={clearAll}
        />

        {error && <p className="text-red-500 mt-6">{error}</p>}

        {!error && !loading && merged.length === 0 && (
          <p className="text-muted-foreground mt-6">No courses available yet.</p>
        )}

        {loading && (
          <div className="flex justify-center mt-16">
            <div className="h-8 w-8 rounded-full border-4 border-border border-t-primary animate-spin" />
          </div>
        )}

        {renderSection("Continue Learning", inProgress)}
        {renderSection("Not Started", notStarted)}
        {renderSection("Completed", completed)}
      </div>
    </div>
  );
}
