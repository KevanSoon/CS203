"use client";

import { use, useState, useEffect } from "react";
import { Sidebar } from "@/app/components/Sidebar";
import { LearningPath } from "./components/LearningPath";
import { FlippableCard } from "./components/FlippableCard";
import { AIChatAssistant } from "./components/AIChatAssistant";
import { MessageCircle } from "lucide-react";
import { api } from "@/app/api/api";

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
}

function mapChaptersFromDTO(dtoChapters: ChapterDTO[]): Chapter[] {
  return dtoChapters.map((chapter) => {
    const cardNodes: Node[] = [...chapter.cards]
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((card) => ({
        id: card.id,
        type: "lesson" as const,
        status: "completed" as const,
        content: {
          front: card.front,
          back: card.back,
        },
      }));

    const quizNodes: Node[] = chapter.quizQuestions.map((quiz) => ({
      id: quiz.id,
      type: "quiz" as const,
      status: "available" as const,
    }));

    return {
      id: chapter.id,
      title: chapter.title,
      nodes: [...cardNodes, ...quizNodes],
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lessonTitle = decodeURIComponent(title);

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
        const { data } = await api.get<LessonPageDTO>("/api/lesson/page", {
          params: { title: lessonTitle },
        });
        setChapters(mapChaptersFromDTO(data.chapters));
      } catch (err: any) {
        console.error("Failed to fetch lesson page:", err);
        setError(err.response?.data?.error || "Failed to load lesson");
      } finally {
        setLoading(false);
      }
    };

    fetchLessonPage();
  }, [lessonTitle]);

  const currentChapter = chapters[selectedChapter];

  const handleNodeClick = (node: Node) => {
    if (node.status === "locked") return;
    setSelectedNode(node);
  };

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar
        selected={selected}
        setSelected={setSelected}
        defaultOpen={isDesktop}
        chapters={chapters.map((c) => ({ id: c.id, title: c.title }))}
        selectedChapter={selectedChapter}
        onChapterSelect={setSelectedChapter}
      />

      {/* Left: Roadmap */}
      <div className="flex-1 bg-gradient-to-b from-background to-accent-light/10 overflow-x-hidden overflow-y-auto pb-20">
        {/* Lesson Title */}
        <div className="px-4 pt-8 pb-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-foreground">
            {lessonTitle}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Follow the learning path to master this topic
          </p>
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
            <div className="px-4 pt-4 pb-8 flex justify-center">
              <div className="relative w-full max-w-md rounded-xl bg-primary border-2 border-primary-dark px-6 py-3 shadow-[0_4px_0_0_var(--color-primary-dark)] overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-xs font-bold text-white/80 uppercase tracking-wider">
                    {`Chapter ${selectedChapter + 1}`}
                  </p>
                  <p className="text-lg font-bold text-white">
                    {currentChapter.title}
                  </p>
                </div>
                <div className="absolute top-1/2 left-[-100%] w-16 h-24 bg-white/50 -translate-y-1/2 rotate-12 transition-all duration-500 ease-in-out group-hover:left-[200%]" />
              </div>
            </div>

            {/* Learning Path */}
            <div className="px-4 flex justify-center">
              <LearningPath
                nodes={currentChapter.nodes}
                onNodeClick={handleNodeClick}
                chapterIndex={selectedChapter}
              />
            </div>

            {/* Flippable Card Modal */}
            {selectedNode && (
              <FlippableCard
                node={selectedNode}
                onClose={() => setSelectedNode(null)}
              />
            )}
          </>
        )}
      </div>

      {/* Right: AI Chat Assistant - Desktop */}
      <div className="hidden lg:block w-96 shrink-0 p-4">
        <div className="sticky top-4 h-[calc(100vh-2rem)]">
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
    </div>
  );
}
