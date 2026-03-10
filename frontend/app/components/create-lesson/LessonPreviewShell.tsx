"use client";

import { Sidebar } from "@/app/components/Sidebar";
import { LearningPath } from "@/app/lesson/[title]/components/LearningPath";
import { QuizCard } from "@/app/lesson/[title]/components/QuizCard";
import { Eye, Pencil, Zap, Code2 } from "lucide-react";
import { CardForm, ChapterForm } from "./form";

export interface LessonPreviewShellProps {
  title: string;
  description: string;
  chapters: ChapterForm[];
  selected: string;
  setSelected: (v: string) => void;
  previewChapterIdx: number;
  setPreviewChapterIdx: (i: number) => void;
  previewCardIdx: number | null;
  setPreviewCardIdx: (i: number | null) => void;
  previewFlipped: boolean;
  setPreviewFlipped: (v: boolean) => void;
  quizOverlayOpen: boolean;
  setQuizOverlayOpen: (v: boolean) => void;
  onExitPreview: () => void;
}

export function LessonPreviewShell({
  title,
  description,
  chapters,
  selected,
  setSelected,
  previewChapterIdx,
  setPreviewChapterIdx,
  previewCardIdx,
  setPreviewCardIdx,
  previewFlipped,
  setPreviewFlipped,
  quizOverlayOpen,
  setQuizOverlayOpen,
  onExitPreview,
}: LessonPreviewShellProps) {
  const currentChapter = chapters[previewChapterIdx];

  const pathNodes = currentChapter
    ? [
        ...currentChapter.cards.map((card: CardForm, idx: number) => ({
          id: idx,
          type: "lesson" as const,
          status: "available" as const,
          content: {
            front: card.front || `Card ${idx + 1}`,
            back: card.back,
          },
        })),
        ...(currentChapter.quizzes.length > 0
          ? [
              {
                id: currentChapter.cards.length,
                type: "quiz" as const,
                status: "available" as const,
              },
            ]
          : []),
      ]
    : [];

  const handleNodeClick = (node: { id: number; type: string }) => {
    if (node.type === "quiz") {
      setQuizOverlayOpen(true);
    } else {
      setPreviewCardIdx(node.id);
    }
    setPreviewFlipped(false);
  };

  const quizNodeData = currentChapter?.quizzes.map((q) => ({
    id: 0,
    title: q.title,
    question: q.question,
    options: JSON.stringify(q.options),
    correctAnswer: q.correctAnswer,
    quizType: q.quizType,
  }));

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex w-full bg-background text-foreground">
        <Sidebar
          selected={selected}
          setSelected={setSelected}
          defaultOpen={false}
          chapters={chapters.map((c: ChapterForm, i: number) => ({
            id: i,
            title: c.title || `Chapter ${i + 1}`,
            description: c.description,
          }))}
          selectedChapter={previewChapterIdx}
          onChapterSelect={(i: number) => {
            setPreviewChapterIdx(i);
            setPreviewCardIdx(null);
            setPreviewFlipped(false);
            setQuizOverlayOpen(false);
          }}
        />

        <div className="flex-1 bg-gradient-to-b from-background to-accent-light/10 overflow-x-hidden overflow-y-auto pb-20">
          <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Preview Mode</span>
            </div>
            <button
              onClick={onExitPreview}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
              Back to Editor
            </button>
          </div>

          <div className="px-4 pt-8 pb-4 text-center">
            <h1 className="text-3xl md:text-4xl font-black text-foreground">
              {title || "Untitled Lesson"}
            </h1>
            {description && (
              <p className="text-muted-foreground mt-2 max-w-lg mx-auto">{description}</p>
            )}
          </div>

          {currentChapter && (
            <>
              <div className="px-4 pt-4 pb-8 flex justify-center">
                <div className="relative w-full max-w-md rounded-xl bg-primary border-2 border-primary-dark px-6 py-3 shadow-[0_4px_0_0_var(--color-primary-dark)] overflow-hidden group">
                  <div className="relative z-10">
                    <p className="text-sm text-white/70">
                      {currentChapter.title || `Chapter ${previewChapterIdx + 1}`}
                    </p>
                    {currentChapter.description && (
                      <p className="text-lg font-bold text-white mt-1">
                        {currentChapter.description}
                      </p>
                    )}
                  </div>
                  <div className="absolute top-1/2 left-[-100%] w-16 h-24 bg-white/50 -translate-y-1/2 rotate-12 transition-all duration-500 ease-in-out group-hover:left-[200%]" />
                </div>
              </div>

              <div className="flex justify-center mt-4">
                <LearningPath
                  nodes={pathNodes}
                  onNodeClick={handleNodeClick}
                  chapterIndex={previewChapterIdx}
                />
              </div>

              {previewCardIdx !== null && (
                <div
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
                  onClick={() => setPreviewCardIdx(null)}
                >
                  <div
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    className="relative w-full max-w-[420px]"
                  >
                    <button
                      onClick={() => setPreviewCardIdx(null)}
                      className="absolute -top-12 right-0 text-white hover:text-gray-200 transition z-50 text-2xl"
                    >
                      ✕
                    </button>

                    <div
                      className="h-[420px] w-full cursor-pointer"
                      style={{ perspective: "2000px" }}
                      onClick={() => setPreviewFlipped(!previewFlipped)}
                    >
                      <div
                        className="relative h-full w-full transition-all duration-700"
                        style={{
                          transformStyle: "preserve-3d",
                          transform: previewFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                        }}
                      >
                        <div
                          className="absolute inset-0 rounded-2xl p-6 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-zinc-900 dark:via-zinc-900/95 dark:to-zinc-800 border border-slate-200 dark:border-zinc-800/50 shadow-lg flex flex-col"
                          style={{ backfaceVisibility: "hidden" }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 rounded-2xl" />
                          <div className="relative z-10 flex-1 flex flex-col">
                            <div className="mb-3 flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-primary/90 to-primary/80">
                                <Zap className="h-4 w-4 text-white" />
                              </div>
                              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">Question</h3>
                            </div>
                            <div className="flex-1 flex items-center">
                              <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                {currentChapter.cards[previewCardIdx]?.front || "No content"}
                              </p>
                            </div>
                          </div>
                          <div className="relative z-10 mt-auto border-t border-slate-200 dark:border-zinc-800 pt-4">
                            <div className="flex items-center justify-between rounded-lg p-2.5 bg-slate-100 dark:bg-zinc-800">
                              <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                                Click to reveal answer
                              </span>
                              <span className="text-primary">→</span>
                            </div>
                          </div>
                        </div>
                        <div
                          className="absolute inset-0 rounded-2xl p-6 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-zinc-900 dark:via-zinc-900/95 dark:to-zinc-800 border border-slate-200 dark:border-zinc-800 shadow-lg flex flex-col"
                          style={{
                            backfaceVisibility: "hidden",
                            transform: "rotateY(180deg)",
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 rounded-2xl" />
                          <div className="relative z-10 flex-1 flex flex-col">
                            <div className="mb-3 flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-primary/90 to-primary/80">
                                <Code2 className="h-4 w-4 text-white" />
                              </div>
                              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">Answer</h3>
                            </div>
                            <div className="flex-1 flex items-center">
                              <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                {currentChapter.cards[previewCardIdx]?.back || "No content"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {quizOverlayOpen && quizNodeData && quizNodeData.length > 0 && (
                <QuizCard
                  node={{
                    id: currentChapter.cards.length,
                    type: "quiz",
                    status: "available",
                    quizData: quizNodeData,
                  }}
                  onClose={() => setQuizOverlayOpen(false)}
                  previewMode={true}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
