"use client";

import { useEffect, useMemo, useState } from "react";
import LessonCard from "@/app/dashboard/components/LessonCard";
import { Sidebar } from "@/app/components/Sidebar";
import { api } from "@/app/api/api";
import TagFilterSearch from "@/app/components/TagFilterSearch";

interface Lesson {
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
  tags?: string; 
}

function parseTags(tags?: string): string[] {
  if (!tags) return [];
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function normalize(s: string) {
  return s.trim().toLowerCase();
}

export default function DashboardPage() {
  const [selected, setSelected] = useState("View Lessons");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [error, setError] = useState<string | null>(null);

  // user input (tag search text)
  const [tagQuery, setTagQuery] = useState("");

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const { data } = await api.get<Lesson[]>("/api/lesson/");
        setLessons(data);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load lessons.");
      }
    };

    fetchLessons();
  }, []);

  // Filter logic:
  // - if tagQuery empty: show all
  // - else: show lessons where ANY tag includes the query (case-insensitive)
  const filteredLessons = useMemo(() => {
    const q = normalize(tagQuery);
    if (!q) return lessons;

    return lessons.filter((lesson) => {
      const tagsArr = parseTags(lesson.tags).map(normalize);
      return tagsArr.some((t) => t.includes(q));
    });
  }, [lessons, tagQuery]);

  const clearFilter = () => setTagQuery("");

  const isFiltering = tagQuery.trim().length > 0;

  return (
    <div className="flex w-full bg-background text-foreground">
      <Sidebar selected={selected} setSelected={setSelected} />

      <div className="flex-1 px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-black mb-2">
          Your Daily Grind 🔥
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Enrolled & Available Courses
        </p>

        {/* ✅ Tag search bar (no suggestions) */}
        <TagFilterSearch
          value={tagQuery}
          onChange={setTagQuery}
          onClear={clearFilter}
          placeholder="filter by tag (case insensitive)"
        />

        {isFiltering && (
          <div className="mt-2">
            <span className="text-xs px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/20">
              Filtering: {tagQuery.trim()}
            </span>
          </div>
        )}

        {error && <p className="text-red-500 mt-6">{error}</p>}

        {/* ✅ No results for filter */}
        {!error && isFiltering && filteredLessons.length === 0 && (
          <p className="text-muted-foreground mt-6">
            No lessons found for this tag
          </p>
        )}

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredLessons.map((lesson, i) => (
            <LessonCard
              key={`${lesson.title}-${i}`}
              title={lesson.title}
              description={lesson.description}
              image={`/images/questionmark.jpg`}
              progress={0}
              rating={3}
              tags={parseTags(lesson.tags)}
            />
          ))}
        </div>

        {/* No lessons at all */}
        {lessons.length === 0 && !error && (
          <p className="text-muted-foreground mt-6">
            No courses available yet.
          </p>
        )}
      </div>
    </div>
  );
}