"use client";
import { useEffect, useState } from "react";
import { BookOpen, FileText, GraduationCap } from "lucide-react";
import { api } from "@/app/api/api";

type AdminLessonStats = {
  totalLessons: number;
  publishedLessons: number;
  totalAttempts: number;
  totalCompletions: number;
};

export const StatsGrid = () => {
  const [stats, setStats] = useState<AdminLessonStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await api.get("/api/lesson/admin/stats");
        setStats(result.data);
      } catch (err) {
        console.error("Failed to fetch lesson stats", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
        </div>
        <h3 className="font-medium text-muted-foreground mb-1">
          Total Lessons
        </h3>
        <p className="text-2xl font-bold text-foreground">{stats?.totalLessons ?? "--"}</p>
      </div>

      <div className="p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-5 w-5 text-primary" />
          </div>
        </div>
        <h3 className="font-medium text-muted-foreground mb-1">
          Lessons Published
        </h3>
        <p className="text-2xl font-bold text-foreground">{stats?.publishedLessons ?? "--"}</p>
      </div>

      <div className="p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
        </div>
        <h3 className="font-medium text-muted-foreground mb-1">
          Completions
        </h3>
        <p className="text-2xl font-bold text-foreground">{stats?.totalCompletions ?? "--"}</p>
      </div>
    </div>
  );
};
