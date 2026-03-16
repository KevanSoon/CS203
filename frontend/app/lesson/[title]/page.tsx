"use client";

import { use, useState, useEffect } from "react";
import { Sidebar } from "@/app/components/Sidebar";
import { LearningPath } from "./components/LearningPath";
import { FlippableCard } from "./components/FlippableCard";
import { AIChatAssistant } from "./components/AIChatAssistant";
import { MessageCircle } from "lucide-react";
import { api } from "@/app/api/api";
import { QuizCard } from "./components/QuizCard";
import { useProgressStore, LessonDetailProgress } from "@/app/store/ProgressStore";
import ReviewModal from "@/app/components/ReviewModal";
import ReviewViewModal from "@/app/components/ReviewViewModal";
import { ReportModal } from "@/app/components/ReportModal";
import { useSearchParams, useRouter } from "next/navigation";

// Backend DTO types
interface CardDTO {
  id: number;
  front: string;
  back: string;
  displayOrder: number;
}

interface QuizDTO {
  id: number;
  title: string;
  question: string;
  options: string;
  quizType: "mcq" | "true_false" | "fill_blank";
  correctAnswer: string;
}

interface ChapterDTO {
  id: number;
  title: string;
  description: string;
  cards: CardDTO[];
  quizQuestions: QuizDTO[];
}

interface LessonPageDTO {
  id: number;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
  chapters: ChapterDTO[];
}

// Frontend display types
interface Chapter {
  id: number;
  title: string;
  description: string;
  nodes: Node[];
}

interface Node {
  id: number;
  type: "lesson" | "quiz";
  status: "locked" | "available" | "completed";
  content?: {
    front: string;
    back: string;
  };
  quizData?: QuizDTO[];
}

function mapChaptersFromDTO(dtoChapters: ChapterDTO[], progress?: LessonDetailProgress): Chapter[] {
  return dtoChapters.map((chapter) => {
    // Find matching chapter progress if available
    const chapterProgress = progress?.chapters.find((c) => c.chapterId === chapter.id);

    const cardNodes: Node[] = [...chapter.cards]
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((card) => ({
        id: card.id,
        type: "lesson" as const,
        // If we have progress data, completed cards come from the backend
        // We'll refine to "completed" status after the full node list is built
        status: "locked" as const,
        content: {
          front: card.front,
          back: card.back,
        },
      }));

    const quizNode: Node = {
      id: chapter.id,
      type: "quiz" as const,
      status: "locked" as const,
      quizData: chapter.quizQuestions,
    };

    const allNodes = [...cardNodes, quizNode];

    if (chapterProgress) {
      // We know how many cards are completed — mark first N cards as completed
      const completedCardCount = chapterProgress.completedCards;
      allNodes.forEach((node, i) => {
        if (node.type === "lesson") {
          const cardIndex = i; // cardNodes are the first N nodes
          if (cardIndex < completedCardCount) {
            allNodes[i] = { ...node, status: "completed" };
          } else if (cardIndex === completedCardCount) {
            allNodes[i] = { ...node, status: "available" };
          }
          // else stays locked
        } else {
          // quiz node
          if (chapterProgress.quizCompleted) {
            allNodes[i] = { ...node, status: "completed" };
          } else if (completedCardCount === chapterProgress.totalCards) {
            // All cards done, quiz unlocked
            allNodes[i] = { ...node, status: "available" };
          }
          // else stays locked
        }
      });
    } else {
      // No progress — first node available, rest locked
      if (allNodes.length > 0) {
        allNodes[0].status = "available";
      }
    }

    return {
      id: chapter.id,
      title: chapter.title,
      description: chapter.description,
      nodes: allNodes,
    };
  });
}

export default function LessonRoadmapPage({
  params,
}: {
  params: Promise<{ title: string }>;
}) {
  const { title } = use(params);
  const [selected, setSelected] = useState("");
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessonId, setLessonId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lessonTitle = decodeURIComponent(title);
  const { lessonProgress, setLessonProgress, markCardCompleted, markQuizCompleted } = useProgressStore();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [showReviewView, setShowReviewView] = useState(false);

  const [reportOpen, setReportOpen] = useState(false);
  const searchParams = useSearchParams();

  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const fetchLessonPage = async () => {
      try {
        setLoading(true);
        // Fetch lesson content
        const { data } = await api.get<LessonPageDTO>("/api/lesson/page", {
          params: { title: lessonTitle },
        });

        setLessonId(data.id);

        // Always fetch fresh progress from backend when opening a lesson
        // (cache is only used for optimistic updates mid-session)
        let progress: LessonDetailProgress | undefined;
        try {
          const { data: progressData } = await api.get<LessonDetailProgress>(
            `/api/progress/lesson/${data.id}`
          );
          progress = progressData;
          setLessonProgress(data.id, progressData);
        } catch {
          // Progress fetch failed — fall back to cached value if available
          progress = lessonProgress[data.id];
        }

        setChapters(mapChaptersFromDTO(data.chapters, progress));
      } catch (err: any) {
        console.error("Failed to fetch lesson page:", err);
        setError(err.response?.data?.error || "Failed to load lesson");
      } finally {
        setLoading(false);
      }
    };

    fetchLessonPage();
  }, [lessonTitle]);

  useEffect(() => {
    if (searchParams.get("report") === "true") {
      setReportOpen(true);
    }
  }, [searchParams]);

  const handleReportClose = () => {
    setReportOpen(false);
    setSelected("");

    const params = new URLSearchParams(searchParams.toString());
    params.delete("report")
    router.replace(`/lesson/${encodeURIComponent(lessonTitle)}?${params.toString()}`)
  }

  const currentChapter = chapters[selectedChapter];

  const handleNodeClick = (node: Node) => {
    if (node.status === "locked") return;
    setSelectedNode(node);
  };

  const handleNodeComplete = (nodeId: number) => {
    // Determine what action to take BEFORE touching any state
    let action: { type: "card" | "quiz"; chapterId: number } | null = null;

    const currentNodes = chapters[selectedChapter]?.nodes ?? [];
    const completedNode = currentNodes.find((n) => n.id === nodeId);
    if (completedNode && completedNode.status !== "completed" && lessonId !== null) {
      const chapterId = chapters[selectedChapter].id;
      if (completedNode.type === "lesson") {
        action = { type: "card", chapterId };
      } else if (completedNode.type === "quiz") {
        action = { type: "quiz", chapterId };
      }
    }

    // Update local chapter node states
    setChapters((prev) =>
      prev.map((chapter, chIdx) => {
        if (chIdx !== selectedChapter) return chapter;

        const nodeIndex = chapter.nodes.findIndex((n) => n.id === nodeId);
        if (nodeIndex === -1) return chapter;

        const updatedNodes = chapter.nodes.map((node, i) => {
          if (i === nodeIndex) return { ...node, status: "completed" as const };
          if (i === nodeIndex + 1 && node.status === "locked")
            return { ...node, status: "available" as const };
          return node;
        });

        return { ...chapter, nodes: updatedNodes };
      })
    );

    // Fire side effects AFTER setChapters — never inside the updater
    if (action && lessonId !== null) {
      if (action.type === "card") {
        // Use fetch directly to avoid the global loading spinner interceptor
        fetch("/api/progress/card/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cardId: nodeId }),
        }).catch(() => {});
        markCardCompleted(lessonId, action.chapterId);
      } else if (action.type === "quiz") {
        // Quiz completion is handled by QuizCard via /api/quiz-result
        markQuizCompleted(lessonId, action.chapterId);
      }
    }

    setSelectedNode(null);
  };

  const lessonCompleted =
    chapters.length > 0 &&
    chapters.every((chapter) =>
      chapter.nodes.length > 0 &&
      chapter.nodes.every((node) => node.status === "completed")
    );
  
  useEffect(() => {
    const checkReview = async () => {
      if (!lessonCompleted || !lessonId || reviewSubmitted) return;
      try {
        const { data } = await api.get(`/api/lesson/${lessonId}/review`);
        if (data?.review?.hasReviewed) {
          setReviewSubmitted(true);
        } else {
          setShowReviewModal(true);
        }
      } catch (err) {
        console.error (err);
      }
    };
    checkReview();
  }, [lessonCompleted, lessonId, reviewSubmitted]);

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar
        selected={selected}
        setSelected={setSelected}
        defaultOpen={isDesktop}
        chapters={chapters.map((c) => ({ id: c.id, title: c.title, description: c.description }))}
        selectedChapter={selectedChapter}
        onChapterSelect={setSelectedChapter}
        completedChapterIds={chapters
          .filter((c) => c.nodes.length > 0 && c.nodes.every((n) => n.status === "completed"))
          .map((c) => c.id)
        }
        showReviewTab={reviewSubmitted}
        onReviewSelect={() => setShowReviewView(true)}
        onReportClick={() => setReportOpen(true)}
      />

      {/* Left: Roadmap */}
      <div className="flex-1 bg-gradient-to-b from-background to-accent-light/10 overflow-x-hidden overflow-y-auto pb-20">
        {/* Lesson Title */}
        <div className="px-4 pt-8 pb-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-foreground">
            {lessonTitle}
          </h1>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <p className="text-muted-foreground">Loading lesson...</p>
          </div>
        )}

        {error && (
          <div className="flex justify-center py-20">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {!loading && !error && !currentChapter && (
          <div className="flex justify-center py-20">
            <p className="text-muted-foreground">No chapters found.</p>
          </div>
        )}

        {/* Chapter content - only render when data is loaded */}
        {!loading && !error && currentChapter && (
          <>
            {/* Chapter Toast Banner */}
            {(() => {
              const isChapterComplete = currentChapter.nodes.every(
                (n) => n.status === "completed"
              );
              return (
                <div className="px-4 pt-4 pb-8 flex justify-center">
                  <div className={`relative w-full max-w-md rounded-xl border-2 px-6 py-3 overflow-hidden group ${
                    isChapterComplete
                      ? "bg-success border-success-shadow shadow-[0_4px_0_0_var(--color-success-shadow)]"
                      : "bg-primary border-primary-dark shadow-[0_4px_0_0_var(--color-primary-dark)]"
                  }`}>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-white/70">{currentChapter.title}</p>
                        {isChapterComplete && (
                          <span className="text-xs font-bold text-white bg-white/20 px-2 py-0.5 rounded-full">
                            ✓ Completed
                          </span>
                        )}
                      </div>
                      {currentChapter.description && (
                        <p className="text-lg font-bold text-white mt-1">
                          {currentChapter.description}
                        </p>
                      )}
                    </div>
                    <div className="absolute top-1/2 left-[-100%] w-16 h-24 bg-white/50 -translate-y-1/2 rotate-12 transition-all duration-500 ease-in-out group-hover:left-[200%]" />
                  </div>
                </div>
              );
            })()}

            {/* Learning Path */}
            <div className="px-4 flex justify-center">
              <LearningPath
                nodes={currentChapter.nodes}
                onNodeClick={handleNodeClick}
                chapterIndex={selectedChapter}
              />
            </div>

            {/* Flippable Card Modal */}
            {selectedNode && selectedNode.type === "lesson" && (
              <FlippableCard
                node={selectedNode}
                onClose={() => setSelectedNode(null)}
                onComplete={() => handleNodeComplete(selectedNode.id)}
              />
            )}
            {/* Quiz Card Modal */}
            {selectedNode && selectedNode.type === "quiz" && (
              <QuizCard
                node={selectedNode}
                onClose={() => setSelectedNode(null)}
                onComplete={() => handleNodeComplete(selectedNode.id)}
                timeLimit={30}
              />
            )}
          </>
        )}
      </div>

      {/* Right: AI Chat Assistant*/}
      <div className={`hidden lg:block w-96 shrink-0 relative ${selectedNode?.type === "quiz" ? "z-40" : "z-[60]"}`}>
        <div className="sticky top-0 h-screen">
          <AIChatAssistant />
        </div>
      </div>

      {/* Mobile Chat Bubble */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 lg:hidden w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Mobile Chat Overlay */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md h-[70vh]">
            <AIChatAssistant onClose={() => setChatOpen(false)} />
          </div>
        </div>
      )}

      {showReviewModal && lessonId && (
        <ReviewModal
          lessonId={lessonId}
          onClose={() => setShowReviewModal(false)}
          onSubmitted={() => setReviewSubmitted(true)}
        />
      )}

      {showReviewView && lessonId && (
        <ReviewViewModal
          lessonId={lessonId}
          onClose={() => setShowReviewView(false)}
        />
      )}
      
      {reportOpen && (
        <ReportModal
          lessonId={lessonId}
          chapters={chapters.map(c => ({ id: c.id, title: c.title}))}
          onClose={handleReportClose}
        />
      )}
    </div>
  );
}
