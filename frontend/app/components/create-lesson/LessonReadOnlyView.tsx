"use client";

import { Sidebar } from "@/app/components/Sidebar";
import {
  ArrowLeft,
  Eye,
  Layers,
  Tag,
  User,
} from "lucide-react";
import { useState } from "react";
import { ChapterPanel } from "./ChapterPanel";
import { LessonPreviewShell } from "./LessonPreviewShell";
import { emptyQuiz, type ChapterForm, type QuizForm, type QuizType, type QuizOptionMap } from "./form";

/* ─── API response types (from backend LessonPageDTO) ─── */
export interface LessonPageDTO {
  id?: number;
  title: string;
  description: string;
  lessonPictureUrl?: string | null;
  createdBy: string;
  createdAt: string;
  tags?: string[] | null;
  chapters: Array<{
    title: string;
    description?: string;
    cards: Array<{ front: string; back: string }>;
    quizQuestions: Array<{
      title?: string;
      question: string;
      quizType?: string;
      options?: any;
      correctAnswer?: string;
    }>;
  }>;
}

/* ─── Convert API response to ChapterForm[] ─── */
export function lessonPageDTOToChapters(dto: LessonPageDTO): ChapterForm[] {
  return dto.chapters.map((ch) => {
    const quizzes: QuizForm[] =
      ch.quizQuestions && ch.quizQuestions.length > 0
        ? ch.quizQuestions.map((q) => {
            let opts: QuizOptionMap = { A: "", B: "", C: "", D: "" };
            try {
              opts =
                typeof q.options === "string"
                  ? JSON.parse(q.options)
                  : q.options ?? opts;
            } catch {
              opts = { A: "", B: "", C: "", D: "" };
            }
            if (q.quizType === "fill_blank" && Object.keys(opts).length === 0) {
              opts = { A: "", B: "", C: "", D: "" };
            }
            const qType: QuizType =
              q.quizType === "true_false"
                ? "true_false"
                : q.quizType === "fill_blank"
                  ? "fill_blank"
                  : "mcq";
            return {
              id: crypto.randomUUID(),
              title: q.title || "",
              question: q.question || "",
              quizType: qType,
              options: opts,
              correctAnswer: q.correctAnswer || "",
            } as QuizForm;
          })
        : [emptyQuiz()];

    return {
      title: ch.title,
      description: ch.description || "",
      cards: ch.cards.map((c) => ({
        id: crypto.randomUUID(),
        front: c.front,
        back: c.back,
      })),
      quizzes,
      isExpanded: true,
    } as ChapterForm;
  });
}

/* ─── Props ─── */
export interface LessonReadOnlyViewProps {
  lesson: LessonPageDTO;
  /** Label for the back / exit button */
  backLabel?: string;
  onBack: () => void;
  sidebarSelected?: string;
  onSidebarSelect?: (v: string) => void;
}

export function LessonReadOnlyView({
  lesson,
  backLabel = "Back",
  onBack,
  sidebarSelected = "Lesson Applications",
  onSidebarSelect,
}: LessonReadOnlyViewProps) {
  const [selected, setSelected] = useState(sidebarSelected);
  const [chapters] = useState<ChapterForm[]>(() =>
    lessonPageDTOToChapters(lesson),
  );

  /* Preview state */
  const [viewMode, setViewMode] = useState<"read" | "preview">("read");
  const [previewChapterIdx, setPreviewChapterIdx] = useState(0);
  const [previewCardIdx, setPreviewCardIdx] = useState<number | null>(null);
  const [previewFlipped, setPreviewFlipped] = useState(false);
  const [quizOverlayOpen, setQuizOverlayOpen] = useState(false);

  const tags: string[] = Array.isArray(lesson.tags) ? lesson.tags : [];
  const totalCards = chapters.reduce((s, ch) => s + ch.cards.length, 0);
  const totalQuizzes = chapters.reduce((s, ch) => s + ch.quizzes.length, 0);

  /* ── Preview mode ── */
  if (viewMode === "preview") {
    return (
      <LessonPreviewShell
        title={lesson.title}
        description={lesson.description}
        chapters={chapters}
        selected={selected}
        setSelected={onSidebarSelect ?? setSelected}
        previewChapterIdx={previewChapterIdx}
        setPreviewChapterIdx={setPreviewChapterIdx}
        previewCardIdx={previewCardIdx}
        setPreviewCardIdx={setPreviewCardIdx}
        previewFlipped={previewFlipped}
        setPreviewFlipped={setPreviewFlipped}
        quizOverlayOpen={quizOverlayOpen}
        setQuizOverlayOpen={setQuizOverlayOpen}
        onExitPreview={() => {
          setViewMode("read");
          setPreviewCardIdx(null);
          setPreviewFlipped(false);
        }}
      />
    );
  }

  /* ── Read-only edit view ── */
  return (
    <div className="flex min-h-screen w-full">
      <div className="flex w-full bg-background text-foreground">
        <Sidebar
          selected={selected}
          setSelected={onSidebarSelect ?? setSelected}
        />
        <div className="flex-1 bg-background overflow-auto">
          {/* ── Hero / Lesson Header ── */}
          <div className="bg-gradient-to-b from-primary/10 to-background px-4 sm:px-6 pt-6 pb-8">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-card/80 transition-colors shrink-0"
              >
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground truncate">
                  Review Lesson Application
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
                  Read-only view — content as submitted
                </p>
              </div>
            </div>

            {/* Metadata row */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Thumbnail */}
              {lesson.lessonPictureUrl ? (
                <img
                  src={lesson.lessonPictureUrl}
                  alt={lesson.title}
                  className="shrink-0 w-full md:w-56 h-36 rounded-xl border-2 border-border object-cover"
                />
              ) : (
                <div className="shrink-0 w-full md:w-56 h-36 rounded-xl border-2 border-border bg-card flex flex-col items-center justify-center gap-2 text-muted-foreground/50">
                  <span className="text-xs">No thumbnail</span>
                </div>
              )}

              <div className="flex-1 space-y-3 w-full">
                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-black text-foreground">
                  {lesson.title}
                </h2>

                {/* Description */}
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {lesson.description}
                </p>

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-primary/15 text-primary rounded-full font-medium"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Meta info */}
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {lesson.createdBy}
                  </span>
                  <span className="flex items-center gap-1">
                    Submitted{" "}
                    {new Date(lesson.createdAt).toLocaleDateString("en-SG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span>{chapters.length} chapter{chapters.length !== 1 ? "s" : ""}</span>
                  <span>{totalCards} card{totalCards !== 1 ? "s" : ""}</span>
                  <span>{totalQuizzes} quiz question{totalQuizzes !== 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Chapters (read-only) ── */}
          <div className="px-4 sm:px-6 py-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">
                  Chapters ({chapters.length})
                </h2>
              </div>
              <button
                onClick={() => setViewMode("preview")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
              >
                <Eye className="h-4 w-4" />
                Preview
              </button>
            </div>

            {/* Chapter list — no outer DndContext needed since chapters are read-only */}
            <div className="space-y-5">
              {chapters.map((chapter, ci) => (
                <ChapterPanel
                  key={`chapter-${ci}`}
                  chapter={chapter}
                  ci={ci}
                  readOnly={true}
                />
              ))}
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
