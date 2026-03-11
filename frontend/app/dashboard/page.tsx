"use client";

import { useEffect, useMemo, useState } from "react";
import LessonCard from "@/app/dashboard/components/LessonCard";
import { Sidebar } from "@/app/components/Sidebar";
import { api } from "@/app/api/api";
import FilterSearch from "@/app/components/FilterSearch";
import { useProgressStore, isDashboardStale, DashboardProgress } from "@/app/store/ProgressStore";

interface LessonSummary {
  id: number;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
  tags: string | null;
  lessonPictureUrl: string | null;
}

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
  const [mode, setMode] = useState<"search" | "tag">("search");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const { dashboardProgress, setDashboardProgress } = useProgressStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
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

  const availableTags = useMemo(() => {
    const all = merged.flatMap((l) => parseTags(l.tags));
    return [...new Set(all)].sort();
  }, [merged]);

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

  const clearAll = () => {
    setSelectedTags([]);
    setQuery("");
  };

  const filteredLessons = useMemo(() => {
    let result = merged;

    if (selectedTags.length > 0) {
      const selectedNorm = selectedTags.map(normalize);
      result = result.filter((lesson) => {
        const lessonTags = parseTags(lesson.tags).map(normalize);
        return selectedNorm.every((sel) => lessonTags.includes(sel));
      });
    }

    if (mode === "search" && query.trim()) {
      const q = normalize(query);
      result = result.filter(
        (lesson) =>
          normalize(lesson.title).includes(q) ||
          normalize(lesson.description).includes(q)
      );
    }

    return result;
  }, [merged, selectedTags, query, mode]);

  const isFiltering =
    selectedTags.length > 0 || (mode === "search" && query.trim().length > 0);

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

        <FilterSearch
          query={query}
          setQuery={setQuery}
          mode={mode}
          setMode={setMode}
          selectedTags={selectedTags}
          addTag={addTag}
          removeTag={removeTag}
          clearAll={clearAll}
          availableTags={availableTags}
        />

        {error && <p className="text-red-500 mt-6">{error}</p>}

        {!error && isFiltering && filteredLessons.length === 0 && (
          <p className="text-muted-foreground mt-6">No lessons found matching your search.</p>
        )}

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