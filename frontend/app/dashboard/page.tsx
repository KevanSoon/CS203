"use client";

import { useEffect, useState } from "react";
import LessonCard from "@/app/dashboard/components/LessonCard";
import { Sidebar } from "@/app/components/Sidebar";
import { api } from "@/app/api/api";

interface Lesson {
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [selected, setSelected] = useState("View Lessons");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="flex w-full bg-background text-foreground">
      <Sidebar selected={selected} setSelected={setSelected} />
      <div className="flex-1 px-6 py-12">
        
        <h1 className="text-3xl md:text-4xl font-black mb-2">
          Your Daily Grind 🔥
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Enrolled & Available Courses
        </p>

        {error && <p className="text-red-500 mb-6">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson, i) => (
            <LessonCard
              key={`${lesson.title}-${i}`}
              title={lesson.title}
              description={lesson.description}
              image={`https://source.unsplash.com/random/400x300?sig=${i}`}
              progress={0}
              rating={3} // hardcoded rating for now
            />
          ))}
        </div>

        {lessons.length === 0 && !error && (
          <p className="text-muted-foreground mt-6">
            No courses available yet.
          </p>
        )}
      </div>
    </div>
  );
}
