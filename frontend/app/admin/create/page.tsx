"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Sidebar } from "@/app/components/Sidebar";
import { CartoonButton } from "@/app/components/CartoonButton";
import { LearningPath } from "@/app/lesson/[title]/components/LearningPath";
import { api } from "@/app/api/api";
import toast from "react-hot-toast";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowLeft,
  Check,
  ImagePlus,
  Eye,
  Pencil,
  Star,
  Crown,
  Zap,
  Code2,
  Upload,
  AlertTriangle,
  X,
  GripVertical,
} from "lucide-react";

/* ─── Constants ─── */
const OPTION_KEYS_MCQ = ["A", "B", "C", "D"] as const;
const OPTION_KEYS_TF = ["A", "B"] as const;

type QuizType = "mcq" | "true_false" | "fill_blank";

const QUIZ_TYPE_LABELS: Record<QuizType, string> = {
  mcq: "Multiple Choice",
  true_false: "True / False",
  fill_blank: "Fill in the Blank",
};

/* ─── Types ─── */
interface CardForm {
  id: string;
  front: string;
  back: string;
  mediaUrl?: string;
}

interface QuizOptionMap {
  [key: string]: string;
}

interface QuizForm {
  id: string;
  title: string;
  question: string;
  quizType: QuizType;
  options: QuizOptionMap;
  correctAnswer: string;
}

interface ChapterForm {
  title: string;
  description: string;
  cards: CardForm[];
  quizzes: QuizForm[];
  isExpanded: boolean;
}

/* ─── Helpers ─── */
function emptyCard(): CardForm {
  return { id: crypto.randomUUID(), front: "", back: "" };
}

function emptyQuiz(type: QuizType = "mcq"): QuizForm {
  return {
    id: crypto.randomUUID(),
    title: "",
    question: "",
    quizType: type,
    options:
      type === "true_false"
        ? { A: "True", B: "False" }
        : { A: "", B: "", C: "", D: "" }, // mcq and fill_blank both use A/B/C/D word bank
    correctAnswer: "",
  };
}

function emptyChapter(): ChapterForm {
  return {
    title: "",
    description: "",
    cards: [emptyCard()],
    quizzes: [emptyQuiz()],
    isExpanded: true,
  };
}

function optionKeysForType(type: QuizType) {
  if (type === "true_false") return OPTION_KEYS_TF;
  return OPTION_KEYS_MCQ; // mcq and fill_blank both use A/B/C/D
}

/* ─── Shared transform helper: translate only, no scale distortion ─── */
function translateOnly(transform: Parameters<typeof CSS.Transform.toString>[0]) {
  if (!transform) return undefined;
  return CSS.Transform.toString({ ...transform, scaleX: 1, scaleY: 1 });
}

/* ─── Sortable card item wrapper ─── */
function SortableCard({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: (dragHandleProps: React.HTMLAttributes<HTMLElement>, isDragging: boolean) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    animateLayoutChanges: () => false,
  });
  const style: React.CSSProperties = {
    transform: translateOnly(transform),
    transition: isDragging ? "none" : (transition ?? undefined),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
    position: "relative",
  };
  return (
    <div ref={setNodeRef} style={style} className={className}>
      {children({ ...attributes, ...listeners }, isDragging)}
    </div>
  );
}

/* ─── Sortable quiz item wrapper ─── */
function SortableQuiz({
  id,
  children,
}: {
  id: string;
  children: (dragHandleProps: React.HTMLAttributes<HTMLElement>, isDragging: boolean) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id,
    animateLayoutChanges: () => false,
  });
  const style: React.CSSProperties = {
    transform: translateOnly(transform),
    transition: "none",
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
    position: "relative",
  };
  return (
    <div ref={setNodeRef} style={style}>
      {children({ ...attributes, ...listeners }, isDragging)}
    </div>
  );
}

/* ─── Sortable chapter item wrapper ─── */
function SortableChapter({
  id,
  children,
}: {
  id: string;
  children: (dragHandleProps: React.HTMLAttributes<HTMLElement>, isDragging: boolean) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id,
    animateLayoutChanges: () => false,
  });
  const style: React.CSSProperties = {
    transform: translateOnly(transform),
    transition: "none",
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
    position: "relative",
  };
  return (
    <div ref={setNodeRef} style={style}>
      {children({ ...attributes, ...listeners }, isDragging)}
    </div>
  );
}

/* ───────────────────────────────────────────────── */
export default function CreateLessonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editTitle = searchParams.get("edit");
  const isEditMode = !!editTitle;

  const [selected, setSelected] = useState("Manage Lessons");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");

  /* Lesson fields */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  /* Tags autocomplete */
  const [allTags, setAllTags] = useState<string[]>([]);
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  /* Title uniqueness */
  const [titleTaken, setTitleTaken] = useState(false);
  const [titleChecking, setTitleChecking] = useState(false);
  const titleCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Chapters */
  const [chapters, setChapters] = useState<ChapterForm[]>([emptyChapter()]);

  /* Preview */
  const [previewChapterIdx, setPreviewChapterIdx] = useState(0);
  const [previewCardIdx, setPreviewCardIdx] = useState<number | null>(null);
  const [previewFlipped, setPreviewFlipped] = useState(false);
  const [quizOverlayOpen, setQuizOverlayOpen] = useState(false);
  const [quizOverlayIdx, setQuizOverlayIdx] = useState(0);
  const [quizSelectedAnswer, setQuizSelectedAnswer] = useState<string | null>(null);
  const [quizAnswerRevealed, setQuizAnswerRevealed] = useState(false);

  /* ─── DnD sensors ─── */
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  /* ─── Reorder helpers ─── */
  const reorderCards = useCallback((chapterIdx: number, oldIdx: number, newIdx: number) => {
    setChapters((prev) =>
      prev.map((ch, i) =>
        i !== chapterIdx ? ch : { ...ch, cards: arrayMove(ch.cards, oldIdx, newIdx) }
      )
    );
  }, []);

  const reorderQuizzes = useCallback((chapterIdx: number, oldIdx: number, newIdx: number) => {
    setChapters((prev) =>
      prev.map((ch, i) =>
        i !== chapterIdx ? ch : { ...ch, quizzes: arrayMove(ch.quizzes, oldIdx, newIdx) }
      )
    );
  }, []);

  const reorderChapters = useCallback((oldIdx: number, newIdx: number) => {
    setChapters((prev) => arrayMove(prev, oldIdx, newIdx));
  }, []);

  /* Validation errors */
  const [errors, setErrors] = useState<Set<string>>(new Set());

  /* ─── Fetch all tags for autocomplete ─── */
  useEffect(() => {
    fetch("/api/lesson/manage?action=tags")
      .then((r) => r.json())
      .then((data) => setAllTags(data))
      .catch(() => {});
  }, []);

  /* ─── Debounced title uniqueness check ─── */
  const checkTitle = useCallback(
    (val: string) => {
      if (titleCheckTimer.current) clearTimeout(titleCheckTimer.current);
      const trimmed = val.trim();
      if (!trimmed) {
        setTitleTaken(false);
        setTitleChecking(false);
        return;
      }
      if (isEditMode && trimmed === editTitle) {
        setTitleTaken(false);
        setTitleChecking(false);
        return;
      }
      setTitleChecking(true);
      titleCheckTimer.current = setTimeout(async () => {
        try {
          const res = await fetch(
            `/api/lesson/manage?action=check-title&title=${encodeURIComponent(trimmed)}`
          );
          const data = await res.json();
          setTitleTaken(!data.available);
        } catch {
          setTitleTaken(false);
        } finally {
          setTitleChecking(false);
        }
      }, 500);
    },
    [isEditMode, editTitle]
  );

  /* ─── Load existing lesson for editing ─── */
  const loadLesson = useCallback(async () => {
    if (!editTitle) return;
    setLoading(true);
    try {
      const { data } = await api.get("/api/lesson/manage", {
        params: { title: editTitle },
      });
      setTitle(data.title);
      setDescription(data.description || "");
      setTags(data.tags || []);

      const mapped: ChapterForm[] = data.chapters.map((ch: any) => {
        const quizzes: QuizForm[] =
          ch.quizQuestions && ch.quizQuestions.length > 0
            ? ch.quizQuestions.map((q: any) => {
                let opts: QuizOptionMap = { A: "", B: "", C: "", D: "" };
                try {
                  opts =
                    typeof q.options === "string"
                      ? JSON.parse(q.options)
                      : q.options;
                } catch {
                  opts = { A: "", B: "", C: "", D: "" };
                }
                // Ensure fill_blank always has A/B/C/D keys (same as MCQ)
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
          cards: ch.cards.map((c: any) => ({
            id: crypto.randomUUID(),
            front: c.front,
            back: c.back,
          })),
          quizzes,
          isExpanded: true,
        } as ChapterForm;
      });
      setChapters(mapped.length > 0 ? mapped : [emptyChapter()]);
    } catch {
      toast.error("Failed to load lesson for editing");
      router.push("/admin");
    } finally {
      setLoading(false);
    }
  }, [editTitle, router]);

  useEffect(() => {
    if (isEditMode) loadLesson();
  }, [isEditMode, loadLesson]);

  /* ─── Tag helpers ─── */
  const addTag = (tagName?: string, keepDropdownOpen = false) => {
    const t = (tagName || tagInput).trim();
    if (!t || tags.includes(t)) return;
    setTags([...tags, t]);
    setTagInput("");
    if (!keepDropdownOpen) setTagDropdownOpen(false);
  };
  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const filteredTags = allTags.filter(
    (t) =>
      !tags.includes(t) && t.toLowerCase().includes(tagInput.toLowerCase())
  );

  /* ─── Thumbnail placeholder ─── */
  const handleThumbnailSelect = () => {
    toast("Image upload coming soon! This is a placeholder.", { icon: "📷" });
    setThumbnailPreview("/images/placeholder-lesson.png");
  };

  /* ─── Chapter helpers ─── */
  const addChapter = () => setChapters([...chapters, emptyChapter()]);

  const removeChapter = (idx: number) => {
    if (chapters.length <= 1) {
      toast.error("A lesson must have at least one chapter");
      return;
    }
    setChapters(chapters.filter((_: ChapterForm, i: number) => i !== idx));
  };

  const updateChapter = (
    idx: number,
    field: keyof ChapterForm,
    value: any
  ) => {
    setChapters(
      chapters.map((ch: ChapterForm, i: number) =>
        i === idx ? { ...ch, [field]: value } : ch
      )
    );
  };

  const toggleChapter = (idx: number) => {
    setChapters(
      chapters.map((ch: ChapterForm, i: number) =>
        i === idx ? { ...ch, isExpanded: !ch.isExpanded } : ch
      )
    );
  };

  /* ─── Card helpers ─── */
  const addCard = (ci: number) => {
    const u = [...chapters];
    u[ci].cards.push(emptyCard());
    setChapters(u);
  };

  const removeCard = (ci: number, cardIdx: number) => {
    const u = [...chapters];
    if (u[ci].cards.length <= 1) {
      toast.error("Each chapter must have at least one card");
      return;
    }
    u[ci].cards = u[ci].cards.filter(
      (_: CardForm, i: number) => i !== cardIdx
    );
    setChapters(u);
  };

  const updateCard = (
    ci: number,
    cardIdx: number,
    field: keyof CardForm,
    value: string
  ) => {
    const u = [...chapters];
    u[ci].cards[cardIdx] = { ...u[ci].cards[cardIdx], [field]: value };
    setChapters(u);
  };

  /* ─── Quiz helpers (multi-question) ─── */
  const addQuiz = (ci: number, type: QuizType = "mcq") => {
    const u = [...chapters];
    u[ci].quizzes.push(emptyQuiz(type));
    setChapters(u);
  };

  const removeQuiz = (ci: number, qi: number) => {
    const u = [...chapters];
    if (u[ci].quizzes.length <= 1) {
      toast.error("Each chapter must have at least one quiz question");
      return;
    }
    u[ci].quizzes = u[ci].quizzes.filter(
      (_: QuizForm, i: number) => i !== qi
    );
    setChapters(u);
  };

  const updateQuiz = (
    ci: number,
    qi: number,
    field: keyof QuizForm,
    value: any
  ) => {
    const u = [...chapters];
    u[ci].quizzes[qi] = { ...u[ci].quizzes[qi], [field]: value };
    setChapters(u);
  };

  const updateQuizOption = (
    ci: number,
    qi: number,
    key: string,
    value: string
  ) => {
    const u = [...chapters];
    u[ci].quizzes[qi].options = {
      ...u[ci].quizzes[qi].options,
      [key]: value,
    };
    setChapters(u);
  };

  const changeQuizType = (ci: number, qi: number, newType: QuizType) => {
    const u = [...chapters];
    const q = u[ci].quizzes[qi];
    const oldType = q.quizType;
    q.quizType = newType;
    if (newType === "true_false") {
      q.options = { A: "True", B: "False" };
      if (q.correctAnswer !== "A" && q.correctAnswer !== "B")
        q.correctAnswer = "";
    } else if (newType === "fill_blank") {
      // fill_blank uses same A/B/C/D word bank structure as MCQ
      const clearAB = oldType === "true_false";
      q.options = {
        A: clearAB ? "" : (q.options.A || ""),
        B: clearAB ? "" : (q.options.B || ""),
        C: clearAB ? "" : (q.options.C || ""),
        D: clearAB ? "" : (q.options.D || ""),
      };
      q.correctAnswer = "";
    } else {
      // MCQ — clear values if coming from true_false or fill_blank
      const clearAB = oldType === "true_false" || oldType === "fill_blank";
      q.options = {
        A: clearAB ? "" : (q.options.A || ""),
        B: clearAB ? "" : (q.options.B || ""),
        C: "",
        D: "",
      };
      q.correctAnswer = "";
    }
    setChapters(u);
  };

  /* ─── Validation ─── */
  const validate = (): boolean => {
    const errs = new Set<string>();

    if (!title.trim()) errs.add("title");
    if (!description.trim()) errs.add("description");

    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      if (!ch.title.trim()) errs.add(`chapter-${i}-title`);

      for (let j = 0; j < ch.cards.length; j++) {
        if (!ch.cards[j].front.trim())
          errs.add(`chapter-${i}-card-${j}-front`);
        if (!ch.cards[j].back.trim()) errs.add(`chapter-${i}-card-${j}-back`);
      }

      for (let q = 0; q < ch.quizzes.length; q++) {
        const quiz = ch.quizzes[q];
        if (!quiz.question.trim())
          errs.add(`chapter-${i}-quiz-${q}-question`);

        if (quiz.quizType === "fill_blank") {
          // fill_blank: question must contain ___, needs ≥2 word bank options and a correct answer
          if (!quiz.question.includes("___"))
            errs.add(`chapter-${i}-quiz-${q}-question`);
          const filled = OPTION_KEYS_MCQ.filter((k) => quiz.options[k]?.trim());
          if (filled.length < 2) errs.add(`chapter-${i}-quiz-${q}-options`);
          if (!quiz.correctAnswer) errs.add(`chapter-${i}-quiz-${q}-answer`);
          else if (!quiz.options[quiz.correctAnswer]?.trim())
            errs.add(`chapter-${i}-quiz-${q}-answer`);
        } else {
          const keys = optionKeysForType(quiz.quizType);
          const filled = keys.filter((k) => quiz.options[k]?.trim());
          if (filled.length < 2) errs.add(`chapter-${i}-quiz-${q}-options`);

          if (!quiz.correctAnswer) errs.add(`chapter-${i}-quiz-${q}-answer`);
          else if (!quiz.options[quiz.correctAnswer]?.trim())
            errs.add(`chapter-${i}-quiz-${q}-answer`);
        }
      }
    }

    setErrors(errs);

    if (errs.size > 0) {
      for (let i = 0; i < chapters.length; i++) {
        const has = Array.from(errs).some((k) =>
          k.startsWith(`chapter-${i}-`)
        );
        if (has && !chapters[i].isExpanded) {
          toggleChapter(i);
          break;
        }
      }
      setTimeout(() => {
        const first = Array.from(errs)[0];
        const el = document.querySelector(`[data-field="${first}"]`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      toast.error("Please fix the highlighted fields");
      return false;
    }
    return true;
  };

  const clearError = (key: string) => {
    if (errors.has(key)) {
      const next = new Set(errors);
      next.delete(key);
      setErrors(next);
    }
  };

  /* ─── Submit ─── */
  const handleSubmit = async () => {
    if (!validate()) return;

    if (!isEditMode && titleTaken) {
      toast.error(
        "A lesson with this title already exists. Please choose a different title."
      );
      document
        .querySelector('[data-field="title"]')
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        tags: tags.length > 0 ? tags : null,
        chapters: chapters.map((ch: ChapterForm) => ({
          title: ch.title.trim(),
          description: ch.description.trim(),
          cards: ch.cards.map((card: CardForm, idx: number) => ({
            front: card.front.trim(),
            back: card.back.trim(),
            displayOrder: idx + 1,
          })),
          quizzes: ch.quizzes.map((q: QuizForm) => ({
            title: q.title.trim() || ch.title.trim() + " Quiz",
            question: q.question.trim(),
            quizType: q.quizType,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer,
          })),
        })),
      };

      if (isEditMode) {
        await api.put(
          `/api/lesson/manage?originalTitle=${encodeURIComponent(editTitle!)}`,
          payload
        );
        toast.success("Lesson updated and re-submitted for approval!");
      } else {
        await api.post("/api/lesson/manage", payload);
        toast.success("Lesson created and submitted for approval!");
      }
      router.push("/admin");
    } catch (err: any) {
      console.error("Save lesson failed:", err);
    } finally {
      setSaving(false);
    }
  };

  /* ─── Loading state ─── */
  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <p className="text-muted-foreground text-lg">Loading lesson...</p>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════
     PREVIEW MODE
     ════════════════════════════════════════════════════ */
  if (viewMode === "preview") {
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
          /* Single quiz node at the end of each chapter */
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
        setQuizOverlayIdx(0);
        setQuizSelectedAnswer(null);
        setQuizAnswerRevealed(false);
      } else {
        setPreviewCardIdx(node.id);
      }
      setPreviewFlipped(false);
    };

    return (
      <div className="flex min-h-screen w-full">
        <div className="flex w-full bg-background text-foreground">
          <Sidebar
            selected={selected}
            setSelected={setSelected}
            defaultOpen={true}
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
            {/* Top bar */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  Preview Mode
                </span>
              </div>
              <button
                onClick={() => {
                  setViewMode("edit");
                  setPreviewCardIdx(null);
                  setPreviewFlipped(false);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
                Back to Editor
              </button>
            </div>

            {/* Lesson Title */}
            <div className="px-4 pt-8 pb-4 text-center">
              <h1 className="text-3xl md:text-4xl font-black text-foreground">
                {title || "Untitled Lesson"}
              </h1>
              {description && (
                <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                  {description}
                </p>
              )}
            </div>

            {currentChapter && (
              <>
                {/* Chapter Banner */}
                <div className="px-4 pt-4 pb-8 flex justify-center">
                  <div className="relative w-full max-w-md rounded-xl bg-primary border-2 border-primary-dark px-6 py-3 shadow-[0_4px_0_0_var(--color-primary-dark)] overflow-hidden group">
                    <div className="relative z-10">
                      <p className="text-sm text-white/70">
                        {currentChapter.title ||
                          `Chapter ${previewChapterIdx + 1}`}
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

                {/* S-curve LearningPath with extra top spacing */}
                <div className="flex justify-center mt-4">
                  <LearningPath
                    nodes={pathNodes}
                    onNodeClick={handleNodeClick}
                    chapterIndex={previewChapterIdx}
                  />
                </div>

                {/* Card overlay (flashcard only) */}
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

                      {/* Flippable Card */}
                        <div
                          className="h-[420px] w-full cursor-pointer"
                          style={{ perspective: "2000px" }}
                          onClick={() => setPreviewFlipped(!previewFlipped)}
                        >
                          <div
                            className="relative h-full w-full transition-all duration-700"
                            style={{
                              transformStyle: "preserve-3d",
                              transform: previewFlipped
                                ? "rotateY(180deg)"
                                : "rotateY(0deg)",
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
                                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
                                    Question
                                  </h3>
                                </div>
                                <div className="flex-1 flex items-center">
                                  <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    {currentChapter.cards[previewCardIdx]
                                      ?.front || "No content"}
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
                                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
                                    Answer
                                  </h3>
                                </div>
                                <div className="flex-1 flex items-center">
                                  <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    {currentChapter.cards[previewCardIdx]
                                      ?.back || "No content"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                    </div>
                  </div>
                )}

                {/* ── Multi-question Quiz Overlay ── */}
                {quizOverlayOpen && currentChapter.quizzes.length > 0 && (() => {
                  const quiz = currentChapter.quizzes[quizOverlayIdx];
                  if (!quiz) return null;
                  const totalQ = currentChapter.quizzes.length;
                  const isCorrect = quizAnswerRevealed && quizSelectedAnswer === quiz.correctAnswer;

                  return (
                    <div
                      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
                      onClick={() => {
                        setQuizOverlayOpen(false);
                        setQuizSelectedAnswer(null);
                        setQuizAnswerRevealed(false);
                      }}
                    >
                      <div
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        className="relative w-full max-w-[480px]"
                      >
                        <button
                          onClick={() => {
                            setQuizOverlayOpen(false);
                            setQuizSelectedAnswer(null);
                            setQuizAnswerRevealed(false);
                          }}
                          className="absolute -top-12 right-0 text-white hover:text-gray-200 transition z-50 text-2xl"
                        >
                          ✕
                        </button>

                        <div className="bg-card rounded-3xl p-8 shadow-2xl border-4 border-warning">
                          {/* Progress bar */}
                          <div className="flex items-center gap-2 mb-5">
                            {Array.from({ length: totalQ }).map((_, i) => (
                              <div
                                key={i}
                                className={`h-1.5 flex-1 rounded-full transition-colors ${
                                  i < quizOverlayIdx
                                    ? "bg-success"
                                    : i === quizOverlayIdx
                                    ? "bg-warning"
                                    : "bg-border"
                                }`}
                              />
                            ))}
                          </div>

                          {/* Header */}
                          <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto mb-4 bg-warning/20 rounded-full flex items-center justify-center">
                              <span className="text-3xl">🏆</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1 font-medium tracking-wide uppercase">
                              Question {quizOverlayIdx + 1} of {totalQ}
                            </p>
                            <h3 className="text-xl font-bold text-foreground">
                              {quiz.title || "Quiz"}
                            </h3>
                            <span className="text-xs text-muted-foreground mt-1 inline-block">
                              {QUIZ_TYPE_LABELS[quiz.quizType]}
                            </span>
                          </div>

                          {/* Question */}
                          {quiz.quizType === "fill_blank" ? (
                            /* Sentence with blank rendered as a styled slot */
                            <p className="text-foreground font-medium mb-6 text-center leading-loose text-lg">
                              {quiz.question.split("___").map((part, idx, arr) => (
                                <span key={idx}>
                                  {part}
                                  {idx < arr.length - 1 && (
                                    quizSelectedAnswer ? (
                                      <span className={`inline-block mx-1 px-3 py-0.5 rounded-lg border-2 font-semibold text-base transition-all ${
                                        quizAnswerRevealed
                                          ? isCorrect
                                            ? "border-success bg-success/10 text-success"
                                            : "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-500 line-through"
                                          : "border-warning bg-warning/10 text-warning"
                                      }`}>
                                        {quiz.options[quizSelectedAnswer]}
                                        {quizAnswerRevealed && !isCorrect && (
                                          <span className="ml-2 no-underline line-through-none text-success not-line-through">
                                          </span>
                                        )}
                                      </span>
                                    ) : (
                                      <span className="inline-block mx-1 px-6 py-0.5 rounded-lg border-2 border-dashed border-warning/50 bg-warning/5 text-warning/40 font-bold text-base min-w-[60px] text-center">
                                        ___
                                      </span>
                                    )
                                  )}
                                </span>
                              ))}
                            </p>
                          ) : (
                            <p className="text-foreground font-medium mb-6 text-center">
                              {quiz.question || "No question set"}
                            </p>
                          )}

                          {/* Word bank chips (fill_blank) OR MCQ option buttons */}
                          {quiz.quizType === "fill_blank" ? (
                            <div className="mb-2">
                              <p className="text-xs text-muted-foreground text-center mb-3 uppercase tracking-wide font-medium">
                                Word Bank
                              </p>
                              <div className="flex flex-wrap justify-center gap-2">
                                {OPTION_KEYS_MCQ.filter(k => quiz.options[k]?.trim()).map(k => (
                                  <button
                                    key={k}
                                    disabled={quizAnswerRevealed}
                                    onClick={() => {
                                      setQuizSelectedAnswer(k);
                                      setQuizAnswerRevealed(true);
                                    }}
                                    className={`px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all shadow-sm ${
                                      quizAnswerRevealed
                                        ? k === quiz.correctAnswer
                                          ? "border-success bg-success/10 text-success"
                                          : k === quizSelectedAnswer
                                          ? "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-500"
                                          : "border-border opacity-30 cursor-not-allowed"
                                        : quizSelectedAnswer === k
                                        ? "border-warning bg-warning/10 text-warning"
                                        : "border-border bg-card hover:border-warning hover:bg-warning/5 hover:-translate-y-0.5 hover:shadow-md"
                                    }`}
                                  >
                                    {quiz.options[k]}
                                  </button>
                                ))}
                              </div>
                              {quizAnswerRevealed && !isCorrect && (
                                <p className="text-center text-xs text-success mt-3 font-medium">
                                  ✓ Correct answer: <span className="font-bold">{quiz.options[quiz.correctAnswer]}</span>
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {Object.entries(quiz.options).map(
                                ([key, val]: [string, string]) =>
                                  val.trim() && (
                                    <button
                                      key={key}
                                      disabled={quizAnswerRevealed}
                                      onClick={() => {
                                        setQuizSelectedAnswer(key);
                                        setQuizAnswerRevealed(true);
                                      }}
                                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-colors text-left ${
                                        quizAnswerRevealed
                                          ? key === quiz.correctAnswer
                                            ? "border-success bg-success/10"
                                            : key === quizSelectedAnswer
                                            ? "border-red-400 bg-red-50 dark:bg-red-900/20"
                                            : "border-border opacity-60"
                                          : quizSelectedAnswer === key
                                          ? "border-primary bg-primary/5"
                                          : "border-border hover:border-primary/40 hover:bg-primary/5"
                                      }`}
                                    >
                                      <span
                                        className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                          quizAnswerRevealed && key === quiz.correctAnswer
                                            ? "bg-success text-white"
                                            : quizAnswerRevealed && key === quizSelectedAnswer
                                            ? "bg-red-400 text-white"
                                            : "bg-border text-foreground"
                                        }`}
                                      >
                                        {key}
                                      </span>
                                      <span className="text-foreground flex-1">{val}</span>
                                      {quizAnswerRevealed && key === quiz.correctAnswer && (
                                        <Check className="h-4 w-4 text-success ml-auto" />
                                      )}
                                      {quizAnswerRevealed && key === quizSelectedAnswer && key !== quiz.correctAnswer && (
                                        <X className="h-4 w-4 text-red-400 ml-auto" />
                                      )}
                                    </button>
                                  )
                              )}
                            </div>
                          )}

                          {/* Feedback */}
                          {quizAnswerRevealed && (
                            <div className={`mt-4 p-3 rounded-xl text-center text-sm font-semibold ${
                              isCorrect ? "bg-success/10 text-success" : "bg-red-50 dark:bg-red-900/20 text-red-500"
                            }`}>
                              {isCorrect
                                ? "🎉 Correct!"
                                : quiz.quizType === "fill_blank"
                                ? "❌ Not quite — check the correct answer above"
                                : `❌ Incorrect — the answer is "${quiz.options[quiz.correctAnswer] || quiz.correctAnswer}"`}
                            </div>
                          )}

                          {/* Navigation */}
                          <div className="flex items-center justify-between mt-6">
                            <button
                              disabled={quizOverlayIdx === 0}
                              onClick={() => {
                                setQuizOverlayIdx(quizOverlayIdx - 1);
                                setQuizSelectedAnswer(null);
                                setQuizAnswerRevealed(false);
                              }}
                              className="px-4 py-2 rounded-xl text-sm font-semibold border-2 border-border text-muted-foreground hover:bg-accent-light/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              ← Previous
                            </button>

                            {quizOverlayIdx < totalQ - 1 ? (
                              <button
                                onClick={() => {
                                  setQuizOverlayIdx(quizOverlayIdx + 1);
                                  setQuizSelectedAnswer(null);
                                  setQuizAnswerRevealed(false);
                                }}
                                className="px-5 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors"
                              >
                                Next →
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setQuizOverlayOpen(false);
                                  setQuizSelectedAnswer(null);
                                  setQuizAnswerRevealed(false);
                                }}
                                className="px-5 py-2 rounded-xl text-sm font-semibold bg-success text-white hover:bg-success/90 transition-colors"
                              >
                                Finish Quiz ✓
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════
     EDIT MODE
     ════════════════════════════════════════════════════ */
  const totalQuizCount = chapters.reduce(
    (sum, ch) => sum + ch.quizzes.length,
    0
  );

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex w-full bg-background text-foreground">
        <Sidebar selected={selected} setSelected={setSelected} />
        <div className="flex-1 bg-background overflow-auto">
          {/* ── Hero / Lesson Header ── */}
          <div className="bg-gradient-to-b from-primary/10 to-background px-6 pt-6 pb-8">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => router.push("/admin")}
                className="p-2 rounded-lg hover:bg-card/80 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-black text-foreground">
                  {isEditMode ? "Edit Lesson" : "Create New Lesson"}
                </h1>
                <p className="text-muted-foreground text-sm mt-0.5">
                  {"Build your lesson with chapters, flashcards, and quizzes"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("preview")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </button>
                <CartoonButton
                  label={
                    saving
                      ? "Saving..."
                      : isEditMode
                      ? "Update & Re-submit"
                      : "Submit for Approval"
                  }
                  color="bg-success"
                  textColor="text-white"
                  size="sm"
                  disabled={saving}
                  onClick={handleSubmit}
                />
              </div>
            </div>

            {/* Thumbnail + Title row */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div
                onClick={handleThumbnailSelect}
                className="shrink-0 w-full md:w-56 h-36 rounded-xl border-2 border-dashed border-border bg-card hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 group"
              >
                {thumbnailPreview ? (
                  <div className="w-full h-full rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                    <ImagePlus className="h-8 w-8 text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                      Upload Thumbnail
                    </span>
                  </>
                )}
              </div>

              <div className="flex-1 space-y-3 w-full">
                {/* Title */}
                <div data-field="title">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      clearError("title");
                      checkTitle(e.target.value);
                    }}
                    placeholder="Lesson Title *"
                    className={`w-full text-2xl md:text-3xl font-black bg-transparent border-b-2 outline-none text-foreground placeholder:text-muted-foreground/50 focus:ring-0 pb-1 transition-colors ${
                      errors.has("title")
                        ? "border-destructive"
                        : titleTaken
                        ? "border-warning"
                        : "border-transparent focus:border-primary"
                    }`}
                  />
                  {/* Status below the title */}
                  {titleChecking && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/30 border-t-primary animate-spin" />
                      <span className="text-xs text-muted-foreground">Checking...</span>
                    </div>
                  )}
                  {!titleChecking && title.trim() && !errors.has("title") && !titleTaken && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Check className="h-3.5 w-3.5 text-success" />
                      <span className="text-xs text-success font-medium">Available</span>
                    </div>
                  )}
                  {titleTaken && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                      <span className="text-xs text-warning font-medium">
                        This lesson title is already taken
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div data-field="description">
                  <textarea
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      clearError("description");
                    }}
                    placeholder="Describe what this lesson covers... *"
                    rows={2}
                    className={`w-full bg-transparent border-b outline-none text-foreground placeholder:text-muted-foreground/50 resize-none focus:ring-0 text-sm pb-1 transition-colors ${
                      errors.has("description")
                        ? "border-destructive"
                        : "border-transparent focus:border-primary"
                    }`}
                  />
                </div>

                {/* Tags autocomplete */}
                <div className="relative">
                  <div className="flex flex-wrap items-center gap-2">
                    {tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-primary/15 text-primary rounded-full font-medium"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-destructive transition-colors ml-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <div className="relative inline-flex items-center">
                      <input
                        ref={tagInputRef}
                        type="text"
                        value={tagInput}
                        onChange={(e) => {
                          setTagInput(e.target.value);
                          setTagDropdownOpen(true);
                        }}
                        onFocus={() => setTagDropdownOpen(true)}
                        onBlur={() =>
                          setTimeout(() => setTagDropdownOpen(false), 200)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        placeholder="+ Add tag"
                        className="w-32 bg-transparent border-none outline-none text-xs text-muted-foreground placeholder:text-muted-foreground/50 focus:ring-0"
                      />
                      {tagDropdownOpen &&
                        (filteredTags.length > 0 || tagInput.trim()) && (
                          <div className="absolute top-full left-0 mt-1 w-56 max-h-48 overflow-auto rounded-xl border border-border bg-card shadow-lg z-40">
                            {filteredTags.map((t: string) => (
                              <button
                                key={t}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  addTag(t, true);
                                  tagInputRef.current?.focus();
                                }}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-primary/10 text-foreground transition-colors"
                              >
                                {t}
                              </button>
                            ))}
                            {tagInput.trim() &&
                              !allTags.includes(tagInput.trim()) && (
                                <button
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => addTag()}
                                  className="w-full text-left px-3 py-2 text-xs text-primary font-medium hover:bg-primary/10 transition-colors border-t border-border"
                                >
                                  + Create &ldquo;{tagInput.trim()}&rdquo;
                                </button>
                              )}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Chapters ── */}
          <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">
                  Chapters ({chapters.length})
                </h2>
              </div>
              <CartoonButton
                label="+ Add Chapter"
                size="sm"
                onClick={addChapter}
              />
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event: DragEndEvent) => {
                const { active, over } = event;
                if (over && active.id !== over.id) {
                  const oldIdx = chapters.findIndex((_: ChapterForm, i: number) => `chapter-${i}` === active.id);
                  const newIdx = chapters.findIndex((_: ChapterForm, i: number) => `chapter-${i}` === over.id);
                  reorderChapters(oldIdx, newIdx);
                }
              }}
            >
              <SortableContext
                items={chapters.map((_: ChapterForm, i: number) => `chapter-${i}`)}
                strategy={verticalListSortingStrategy}
              >
            <div className="space-y-5">
              {chapters.map((chapter: ChapterForm, ci: number) => {
                const chapterHasErr = Array.from(errors).some((k) =>
                  k.startsWith(`chapter-${ci}-`)
                );
                return (
                  <SortableChapter key={`chapter-${ci}`} id={`chapter-${ci}`}>
                    {(chapterDragHandleProps, chapterIsDragging) => (
                  <div
                    className={`rounded-xl border bg-card shadow-sm overflow-hidden transition-colors ${
                      chapterHasErr ? "border-destructive/50" : "border-border"
                    } ${chapterIsDragging ? "shadow-xl" : ""}`}
                  >
                    {/* Chapter Header */}
                    <div
                      className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                        chapter.isExpanded
                          ? "bg-primary/10 border-b border-primary/20"
                          : "hover:bg-border/30"
                      }`}
                      onClick={() => toggleChapter(ci)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Chapter drag handle */}
                        <div
                          {...chapterDragHandleProps}
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0 cursor-grab active:cursor-grabbing p-1 text-muted-foreground/40 hover:text-muted-foreground transition-colors touch-none"
                        >
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white text-sm font-bold shrink-0">
                          {ci + 1}
                        </span>
                        {chapter.isExpanded ? (
                          <input
                            type="text"
                            value={chapter.title}
                            data-field={`chapter-${ci}-title`}
                            onChange={(e) => {
                              updateChapter(ci, "title", e.target.value);
                              clearError(`chapter-${ci}-title`);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            placeholder={`Chapter ${ci + 1} title *`}
                            className={`flex-1 bg-transparent font-semibold text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-0 border-b-2 pb-0.5 transition-colors ${
                              errors.has(`chapter-${ci}-title`)
                                ? "border-destructive"
                                : "border-transparent focus:border-primary"
                            }`}
                          />
                        ) : (
                          <span className="font-semibold text-foreground truncate">
                            {chapter.title || `Chapter ${ci + 1}`}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground shrink-0 ml-2">
                          {chapter.cards.length} card
                          {chapter.cards.length !== 1 ? "s" : ""} ·{" "}
                          {chapter.quizzes.length} question
                          {chapter.quizzes.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeChapter(ci);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        {chapter.isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Chapter Body */}
                    {chapter.isExpanded && (
                      <div className="p-5 space-y-6">
                        <input
                          type="text"
                          value={chapter.description}
                          onChange={(e) =>
                            updateChapter(ci, "description", e.target.value)
                          }
                          placeholder="Chapter description (optional)"
                          className="w-full text-sm bg-transparent border-b border-border/50 outline-none text-foreground placeholder:text-muted-foreground/50 pb-2 focus:border-primary transition-colors"
                        />

                        {/* ── Flashcards ── */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                              <Star className="h-4 w-4 text-primary" />
                              Flashcards ({chapter.cards.length})
                            </h3>
                            <button
                              onClick={() => addCard(ci)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Add Card
                            </button>
                          </div>

                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(event: DragEndEvent) => {
                              const { active, over } = event;
                              if (over && active.id !== over.id) {
                                const oldIdx = chapter.cards.findIndex((c: CardForm) => c.id === active.id);
                                const newIdx = chapter.cards.findIndex((c: CardForm) => c.id === over.id);
                                if (oldIdx !== -1 && newIdx !== -1) reorderCards(ci, oldIdx, newIdx);
                              }
                            }}
                          >
                            <SortableContext
                              items={chapter.cards.map((c: CardForm) => c.id)}
                              strategy={rectSortingStrategy}
                            >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {chapter.cards.map(
                              (card: CardForm, cardIdx: number) => {
                                const fk = `chapter-${ci}-card-${cardIdx}-front`;
                                const bk = `chapter-${ci}-card-${cardIdx}-back`;
                                const cardHasErr =
                                  errors.has(fk) || errors.has(bk);
                                return (
                                  <SortableCard key={card.id} id={card.id}>
                                    {(dragHandleProps, isDragging) => (
                                  <div
                                    className={`relative rounded-2xl border-2 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-zinc-900 dark:via-zinc-900/95 dark:to-zinc-800 shadow-sm overflow-hidden group transition-colors ${
                                      cardHasErr
                                        ? "border-destructive/60"
                                        : "border-border"
                                    } ${isDragging ? "shadow-xl border-primary" : ""}`}
                                  >
                                    {/* Drag handle */}
                                    <div
                                      {...dragHandleProps}
                                      className="absolute top-3 left-3 z-10 cursor-grab active:cursor-grabbing p-0.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors touch-none"
                                    >
                                      <GripVertical className="h-4 w-4" />
                                    </div>
                                    <div className="absolute top-3 left-8 z-10">
                                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 text-primary text-xs font-bold">
                                        {cardIdx + 1}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => removeCard(ci, cardIdx)}
                                      className="absolute top-3 right-3 z-10 p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>

                                    <div className="p-4 pt-10 space-y-3">
                                      <div data-field={fk}>
                                        <div className="flex items-center gap-1.5 mb-1">
                                          <Zap className="h-3 w-3 text-primary" />
                                          <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                                            Front
                                          </span>
                                        </div>
                                        <textarea
                                          value={card.front}
                                          onChange={(e) => {
                                            updateCard(
                                              ci,
                                              cardIdx,
                                              "front",
                                              e.target.value
                                            );
                                            clearError(fk);
                                          }}
                                          placeholder="Question or term..."
                                          rows={2}
                                          className={`w-full rounded-lg bg-background/60 border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none transition-colors ${
                                            errors.has(fk)
                                              ? "border-destructive ring-1 ring-destructive/50"
                                              : "border-border/50"
                                          }`}
                                        />
                                      </div>
                                      <div data-field={bk}>
                                        <div className="flex items-center gap-1.5 mb-1">
                                          <Code2 className="h-3 w-3 text-primary" />
                                          <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                                            Back
                                          </span>
                                        </div>
                                        <textarea
                                          value={card.back}
                                          onChange={(e) => {
                                            updateCard(
                                              ci,
                                              cardIdx,
                                              "back",
                                              e.target.value
                                            );
                                            clearError(bk);
                                          }}
                                          placeholder="Answer or definition..."
                                          rows={2}
                                          className={`w-full rounded-lg bg-background/60 border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none transition-colors ${
                                            errors.has(bk)
                                              ? "border-destructive ring-1 ring-destructive/50"
                                              : "border-border/50"
                                          }`}
                                        />
                                      </div>
                                      <button
                                        onClick={() =>
                                          toast(
                                            "Card media upload coming soon!",
                                            { icon: "🖼️" }
                                          )
                                        }
                                        className="w-full py-2 rounded-lg border border-dashed border-border/50 text-xs text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors flex items-center justify-center gap-1.5"
                                      >
                                        <ImagePlus className="h-3 w-3" />
                                        Add Media
                                      </button>
                                    </div>
                                  </div>
                                    )}
                                  </SortableCard>
                                );
                              }
                            )}

                            <button
                              onClick={() => addCard(ci)}
                              className="rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2 min-h-[200px] text-muted-foreground hover:text-primary"
                            >
                              <Plus className="h-8 w-8" />
                              <span className="text-sm font-medium">
                                Add Card
                              </span>
                            </button>
                          </div>
                            </SortableContext>
                          </DndContext>
                        </div>

                        {/* ── Quiz Section (multi-question) ── */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                              <Crown className="h-4 w-4 text-warning" />
                              Quiz Questions ({chapter.quizzes.length})
                            </h3>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => addQuiz(ci, "mcq")}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-warning/10 text-warning hover:bg-warning/20 transition-colors"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                MCQ
                              </button>
                              <button
                                onClick={() => addQuiz(ci, "true_false")}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-warning/10 text-warning hover:bg-warning/20 transition-colors"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                T/F
                              </button>
                              <button
                                onClick={() => addQuiz(ci, "fill_blank")}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-warning/10 text-warning hover:bg-warning/20 transition-colors"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Fill
                              </button>
                            </div>
                          </div>

                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(event: DragEndEvent) => {
                              const { active, over } = event;
                              if (over && active.id !== over.id) {
                                const oldIdx = chapter.quizzes.findIndex((q: QuizForm) => q.id === active.id);
                                const newIdx = chapter.quizzes.findIndex((q: QuizForm) => q.id === over.id);
                                reorderQuizzes(ci, oldIdx, newIdx);
                              }
                            }}
                          >
                            <SortableContext
                              items={chapter.quizzes.map((q: QuizForm) => q.id)}
                              strategy={verticalListSortingStrategy}
                            >
                          <div className="space-y-4">
                            {chapter.quizzes.map(
                              (quiz: QuizForm, qi: number) => {
                                const keys = optionKeysForType(quiz.quizType);
                                const qHasErr = Array.from(errors).some((k) =>
                                  k.startsWith(`chapter-${ci}-quiz-${qi}`)
                                );

                                return (
                                  <SortableQuiz key={quiz.id} id={quiz.id}>
                                    {(dragHandleProps, isDragging) => (
                                  <div
                                    className={`rounded-2xl border-2 bg-warning/5 p-5 space-y-4 transition-colors ${
                                      qHasErr
                                        ? "border-destructive/50"
                                        : "border-warning/30"
                                    } ${isDragging ? "shadow-xl" : ""}`}
                                  >
                                    {/* Quiz question header */}
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        {/* Drag handle */}
                                        <div
                                          {...dragHandleProps}
                                          className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground/40 hover:text-muted-foreground transition-colors touch-none"
                                        >
                                          <GripVertical className="h-4 w-4" />
                                        </div>
                                        <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-warning/20 text-warning text-xs font-bold">
                                          Q{qi + 1}
                                        </span>
                                        {/* Type toggle */}
                                        <div className="flex rounded-lg border border-border overflow-hidden text-xs">
                                          {(
                                            Object.keys(
                                              QUIZ_TYPE_LABELS
                                            ) as QuizType[]
                                          ).map((t) => (
                                            <button
                                              key={t}
                                              type="button"
                                              onClick={() =>
                                                changeQuizType(ci, qi, t)
                                              }
                                              className={`px-2.5 py-1 transition-colors ${
                                                quiz.quizType === t
                                                  ? "bg-warning text-white font-medium"
                                                  : "bg-card text-muted-foreground hover:bg-warning/10"
                                              }`}
                                            >
                                              {QUIZ_TYPE_LABELS[t]}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => removeQuiz(ci, qi)}
                                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>

                                    {/* Question text */}
                                    <div
                                      data-field={`chapter-${ci}-quiz-${qi}-question`}
                                    >
                                      <textarea
                                        value={quiz.question}
                                        onChange={(e) => {
                                          updateQuiz(
                                            ci,
                                            qi,
                                            "question",
                                            e.target.value
                                          );
                                          clearError(
                                            `chapter-${ci}-quiz-${qi}-question`
                                          );
                                        }}
                                        placeholder={
                                          quiz.quizType === "fill_blank"
                                            ? `Use ___ for the blank, e.g. "The ___ is the powerhouse of the cell"`
                                            : "Write your quiz question here... *"
                                        }
                                        rows={2}
                                        className={`w-full bg-card/50 rounded-xl border px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-warning/50 resize-none transition-colors ${
                                          errors.has(
                                            `chapter-${ci}-quiz-${qi}-question`
                                          )
                                            ? "border-destructive"
                                            : "border-border/50"
                                        }`}
                                      />
                                      {/* Live sentence preview for fill_blank */}
                                      {quiz.quizType === "fill_blank" && quiz.question.trim() && (
                                        <div className="mt-2 px-4 py-2.5 rounded-xl bg-warning/5 border border-warning/20 text-sm text-foreground">
                                          <span className="text-[10px] font-semibold text-warning uppercase tracking-wide block mb-1">Preview</span>
                                          {quiz.question.split("___").map((part, idx, arr) => (
                                            <span key={idx}>
                                              {part}
                                              {idx < arr.length - 1 && (
                                                <span className="inline-block mx-1 px-3 py-0.5 rounded-md bg-warning/20 border-b-2 border-warning text-warning font-semibold text-xs">
                                                  {quiz.options[quiz.correctAnswer]?.trim()
                                                    ? quiz.options[quiz.correctAnswer]
                                                    : "______"}
                                                </span>
                                              )}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                      {quiz.quizType === "fill_blank" && quiz.question.trim() && !quiz.question.includes("___") && (
                                        <p className="text-[11px] text-warning mt-1 flex items-center gap-1">
                                          ⚠ Add <code className="bg-warning/10 px-1 rounded">___</code> to mark where the blank goes
                                        </p>
                                      )}
                                    </div>

                                    {/* Options / Answer */}
                                    {quiz.quizType === "fill_blank" ? (
                                      /* Fill in the Blank — word bank (A/B/C/D) + mark correct */
                                      <div data-field={`chapter-${ci}-quiz-${qi}-options`}>
                                        <p className="text-xs font-medium text-muted-foreground mb-2">
                                          Word Bank — click the letter to mark the correct word
                                          {errors.has(`chapter-${ci}-quiz-${qi}-answer`) && (
                                            <span className="text-destructive ml-2">← Select the correct word</span>
                                          )}
                                        </p>
                                        <div className="space-y-2.5">
                                          {OPTION_KEYS_MCQ.map((key) => (
                                            <div key={key} className="flex items-center gap-2.5">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  updateQuiz(ci, qi, "correctAnswer", key);
                                                  clearError(`chapter-${ci}-quiz-${qi}-answer`);
                                                }}
                                                className={`shrink-0 h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                                                  quiz.correctAnswer === key
                                                    ? "bg-success text-white shadow-[0_3px_0_0_var(--color-success-shadow)] -translate-y-0.5"
                                                    : errors.has(`chapter-${ci}-quiz-${qi}-answer`)
                                                    ? "bg-card border-2 border-destructive/50 text-muted-foreground"
                                                    : "bg-card border-2 border-border text-muted-foreground hover:border-warning hover:text-warning"
                                                }`}
                                              >
                                                {quiz.correctAnswer === key ? <Check className="h-4 w-4" /> : key}
                                              </button>
                                              <input
                                                type="text"
                                                value={quiz.options[key] || ""}
                                                onChange={(e) => {
                                                  updateQuizOption(ci, qi, key, e.target.value);
                                                  clearError(`chapter-${ci}-quiz-${qi}-options`);
                                                }}
                                                placeholder={`Word ${key}`}
                                                className={`flex-1 rounded-xl border bg-card/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-warning/50 transition-colors ${
                                                  errors.has(`chapter-${ci}-quiz-${qi}-options`)
                                                    ? "border-destructive/50"
                                                    : "border-border/50"
                                                }`}
                                              />
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ) : (
                                      /* MCQ / True-False — option buttons */
                                      <div
                                        data-field={`chapter-${ci}-quiz-${qi}-options`}
                                      >
                                        <p className="text-xs font-medium text-muted-foreground mb-2">
                                          Options — click the letter to mark
                                          correct answer
                                          {errors.has(
                                            `chapter-${ci}-quiz-${qi}-answer`
                                          ) && (
                                            <span className="text-destructive ml-2">
                                              ← Select a correct answer
                                            </span>
                                          )}
                                        </p>
                                        <div className="space-y-2.5">
                                          {keys.map((key) => (
                                            <div
                                              key={key}
                                              className="flex items-center gap-2.5"
                                              data-field={
                                                key === quiz.correctAnswer
                                                  ? `chapter-${ci}-quiz-${qi}-answer`
                                                  : undefined
                                              }
                                            >
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  updateQuiz(
                                                    ci,
                                                    qi,
                                                    "correctAnswer",
                                                    key
                                                  );
                                                  clearError(
                                                    `chapter-${ci}-quiz-${qi}-answer`
                                                  );
                                                }}
                                                className={`shrink-0 h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                                                  quiz.correctAnswer === key
                                                    ? "bg-success text-white shadow-[0_3px_0_0_var(--color-success-shadow)] -translate-y-0.5"
                                                    : errors.has(
                                                        `chapter-${ci}-quiz-${qi}-answer`
                                                      )
                                                    ? "bg-card border-2 border-destructive/50 text-muted-foreground"
                                                    : "bg-card border-2 border-border text-muted-foreground hover:border-warning hover:text-warning"
                                                }`}
                                              >
                                                {quiz.correctAnswer === key ? (
                                                  <Check className="h-4 w-4" />
                                                ) : (
                                                  key
                                                )}
                                              </button>
                                              <input
                                                type="text"
                                                value={
                                                  quiz.options[key] || ""
                                                }
                                                onChange={(e) => {
                                                  updateQuizOption(
                                                    ci,
                                                    qi,
                                                    key,
                                                    e.target.value
                                                  );
                                                  clearError(
                                                    `chapter-${ci}-quiz-${qi}-options`
                                                  );
                                                }}
                                                disabled={
                                                  quiz.quizType === "true_false"
                                                }
                                                placeholder={
                                                  quiz.quizType === "true_false"
                                                    ? key === "A"
                                                      ? "True"
                                                      : "False"
                                                    : `Option ${key}`
                                                }
                                                className={`flex-1 rounded-xl border bg-card/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-warning/50 transition-colors ${
                                                  quiz.quizType === "true_false"
                                                    ? "bg-muted/30 cursor-not-allowed"
                                                    : ""
                                                } ${
                                                  errors.has(
                                                    `chapter-${ci}-quiz-${qi}-options`
                                                  )
                                                    ? "border-destructive/50"
                                                    : "border-border/50"
                                                }`}
                                              />
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                    )}
                                  </SortableQuiz>
                                );
                              }
                            )}
                          </div>
                            </SortableContext>
                          </DndContext>

                          {/* Add another question — bottom shortcut */}
                          <div className="flex gap-1.5 mt-3">
                            {(["mcq", "true_false", "fill_blank"] as const).map((t) => (
                              <button
                                key={t}
                                onClick={() => addQuiz(ci, t)}
                                className="flex-1 py-2.5 rounded-xl border-2 border-dashed border-warning/30 hover:border-warning hover:bg-warning/5 transition-colors flex items-center justify-center gap-1.5 text-muted-foreground hover:text-warning text-xs font-medium"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                {t === "mcq" ? "MCQ" : t === "true_false" ? "T/F" : "Fill"}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                    )}
                  </SortableChapter>
                );
              })}
            </div>
              </SortableContext>
            </DndContext>

            <button
              onClick={addChapter}
              className="w-full mt-5 py-5 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-primary"
            >
              <Plus className="h-5 w-5" />
              <span className="font-medium">Add Another Chapter</span>
            </button>
          </div>

          {/* Bottom Submit */}
          <div className="px-6 pb-10 flex justify-end gap-3">
            <CartoonButton
              label="Cancel"
              color="bg-border"
              onClick={() => router.push("/admin")}
            />
            <button
              onClick={() => setViewMode("preview")}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
            <CartoonButton
              label={
                saving
                  ? "Saving..."
                  : isEditMode
                  ? "Update & Re-submit"
                  : "Submit for Approval"
              }
              color="bg-success"
              textColor="text-white"
              disabled={saving}
              onClick={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
