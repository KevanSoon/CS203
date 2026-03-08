import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

// ─── Progress-only types (no lesson metadata) ──────────────

export interface ChapterProgress {
  chapterId: number;
  title: string;
  totalCards: number;
  completedCards: number;
  hasQuiz: boolean;
  quizCompleted: boolean;
  totalItems: number;
  completedItems: number;
  progressPercent: number;
}

/** Lightweight dashboard progress — no title/image/tags. */
export interface DashboardProgress {
  lessonId: number;
  status: "in_progress" | "completed" | "not_started";
  totalItems: number;
  completedItems: number;
  progressPercent: number;
}

/** Per-lesson detail progress — chapter breakdown, no lesson metadata. */
export interface LessonDetailProgress {
  lessonId: number;
  status: "in_progress" | "completed" | "not_started";
  chapters: ChapterProgress[];
  totalItems: number;
  completedItems: number;
  progressPercent: number;
}

// ─── Store ─────────────────────────────────────────────────

interface ProgressState {
  /** Dashboard: progress-only list (no lesson metadata) */
  dashboardProgress: DashboardProgress[];
  dashboardFetchedAt: number | null;

  /** Per-lesson detail: lessonId → chapter-level progress */
  lessonProgress: Record<number, LessonDetailProgress>;
  lessonProgressFetchedAt: Record<number, number>;

  setDashboardProgress: (data: DashboardProgress[]) => void;
  setLessonProgress: (lessonId: number, data: LessonDetailProgress) => void;

  /** Optimistically +1 completedCards for a chapter */
  markCardCompleted: (lessonId: number, chapterId: number) => void;
  /** Optimistically mark quiz done for a chapter */
  markQuizCompleted: (lessonId: number, chapterId: number) => void;

  /** Clear all caches (e.g. on logout) */
  invalidate: () => void;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const useProgressStore = create<ProgressState>()(
  devtools(
    persist(
      (set) => ({
        dashboardProgress: [],
        dashboardFetchedAt: null,
        lessonProgress: {},
        lessonProgressFetchedAt: {},

        setDashboardProgress: (data) =>
          set({ dashboardProgress: data, dashboardFetchedAt: Date.now() }),

        setLessonProgress: (lessonId, data) =>
          set((s) => ({
            lessonProgress: { ...s.lessonProgress, [lessonId]: data },
            lessonProgressFetchedAt: { ...s.lessonProgressFetchedAt, [lessonId]: Date.now() },
          })),

        markCardCompleted: (lessonId, chapterId) =>
          set((s) => {
            // ── Update per-lesson detail ──
            const detail = s.lessonProgress[lessonId];
            let updatedDetail = detail;
            if (detail) {
              const chapters = detail.chapters.map((ch) => {
                if (ch.chapterId !== chapterId) return ch;
                const newCompleted = Math.min(ch.completedCards + 1, ch.totalCards);
                const newCompletedItems = newCompleted + (ch.quizCompleted ? 1 : 0);
                return {
                  ...ch,
                  completedCards: newCompleted,
                  completedItems: newCompletedItems,
                  progressPercent: ch.totalItems > 0
                    ? Math.round((newCompletedItems / ch.totalItems) * 1000) / 10
                    : 0,
                };
              });
              const totalCompleted = chapters.reduce((sum, c) => sum + c.completedItems, 0);
              const totalItems = chapters.reduce((sum, c) => sum + c.totalItems, 0);
              updatedDetail = {
                ...detail,
                chapters,
                completedItems: totalCompleted,
                progressPercent: totalItems > 0
                  ? Math.round((totalCompleted / totalItems) * 1000) / 10
                  : 0,
              };
            }

            // ── Update dashboard progress counts ──
            const dashboardProgress = s.dashboardProgress.map((dp) => {
              if (dp.lessonId !== lessonId) return dp;
              const newCompleted = Math.min(dp.completedItems + 1, dp.totalItems);
              return {
                ...dp,
                status: "in_progress" as const,
                completedItems: newCompleted,
                progressPercent: dp.totalItems > 0
                  ? Math.round((newCompleted / dp.totalItems) * 1000) / 10
                  : 0,
              };
            });

            return {
              dashboardProgress,
              lessonProgress: detail
                ? { ...s.lessonProgress, [lessonId]: updatedDetail }
                : s.lessonProgress,
            };
          }),

        markQuizCompleted: (lessonId, chapterId) =>
          set((s) => {
            // ── Update per-lesson detail ──
            const detail = s.lessonProgress[lessonId];
            let updatedDetail = detail;
            if (detail) {
              const chapters = detail.chapters.map((ch) => {
                if (ch.chapterId !== chapterId || ch.quizCompleted) return ch;
                const newCompletedItems = ch.completedCards + 1;
                return {
                  ...ch,
                  quizCompleted: true,
                  completedItems: newCompletedItems,
                  progressPercent: ch.totalItems > 0
                    ? Math.round((newCompletedItems / ch.totalItems) * 1000) / 10
                    : 0,
                };
              });
              const totalCompleted = chapters.reduce((sum, c) => sum + c.completedItems, 0);
              const totalItems = chapters.reduce((sum, c) => sum + c.totalItems, 0);
              const allDone = chapters.every((c) => c.progressPercent === 100);
              updatedDetail = {
                ...detail,
                chapters,
                completedItems: totalCompleted,
                progressPercent: totalItems > 0
                  ? Math.round((totalCompleted / totalItems) * 1000) / 10
                  : 0,
                status: allDone ? "completed" : detail.status,
              };
            }

            // ── Update dashboard progress counts ──
            const dashboardProgress = s.dashboardProgress.map((dp) => {
              if (dp.lessonId !== lessonId) return dp;
              const newCompleted = Math.min(dp.completedItems + 1, dp.totalItems);
              const allDone = newCompleted >= dp.totalItems;
              return {
                ...dp,
                completedItems: newCompleted,
                progressPercent: dp.totalItems > 0
                  ? Math.round((newCompleted / dp.totalItems) * 1000) / 10
                  : 0,
                status: allDone ? ("completed" as const) : dp.status,
              };
            });

            return {
              dashboardProgress,
              lessonProgress: detail
                ? { ...s.lessonProgress, [lessonId]: updatedDetail }
                : s.lessonProgress,
            };
          }),

        invalidate: () =>
          set({
            dashboardProgress: [],
            dashboardFetchedAt: null,
            lessonProgress: {},
            lessonProgressFetchedAt: {},
          }),
      }),
      { name: "progress-storage" }
    )
  )
);

export const isDashboardStale = () => {
  const { dashboardFetchedAt } = useProgressStore.getState();
  if (!dashboardFetchedAt) return true;
  return Date.now() - dashboardFetchedAt > CACHE_TTL_MS;
};

export const isLessonProgressStale = (lessonId: number) => {
  const { lessonProgressFetchedAt } = useProgressStore.getState();
  const fetchedAt = lessonProgressFetchedAt[lessonId];
  if (!fetchedAt) return true;
  return Date.now() - fetchedAt > CACHE_TTL_MS;
};
