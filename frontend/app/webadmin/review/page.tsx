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
      backLabel="Back to Applications"
      onBack={() => router.push("/webadmin")}
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
