"use client";

import {
  LessonPageDTO,
  LessonReadOnlyView,
} from "@/app/components/create-lesson/LessonReadOnlyView";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/app/api/api";

function ReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const title = searchParams.get("title");
  const reportId = searchParams.get("reportId");

  const [lesson, setLesson] = useState<LessonPageDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLesson = useCallback(async () => {
    if (!title) return;
    setLoading(true);
    try {
      const { data } = await api.get<LessonPageDTO>(
        "/api/lesson/applications/preview",
        { params: { title } },
      );
      setLesson(data);
    } catch {
      toast.error("Failed to load lesson details");
      router.push("/webadmin");
    } finally {
      setLoading(false);
    }
  }, [title, router]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  if (!title) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">No lesson title provided.</p>
      </div>
    );
  }

  if (loading || !lesson) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background" />
    );
  }

  return (
    <LessonReadOnlyView
      lesson={lesson}
      backLabel={reportId ? "Back to Reports" : "Back to Applications"}
      onBack={() => {
        if (reportId) {
          router.push(`/webadmin?tab=Manage Reports&reportId=${reportId}`);
        } else {
          router.push("/webadmin");
        }
      }}
      headerTitle={reportId ? "View Approved Lesson" : "Review Lesson Application"}
      headerSubtitle={reportId ? "Read-only view of published lesson content" : "Read-only view — content as submitted"}
    />
  );
}

export default function ReviewPageWrapper() {
  return (
    <Suspense>
      <ReviewPage />
    </Suspense>
  );
}
