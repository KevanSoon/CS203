"use client";

import { api } from "@/app/api/api";
import {
  OPTION_KEYS_MCQ,
  emptyCard,
  emptyChapter,
  emptyQuiz,
  optionKeysForType,
  CardForm,
  ChapterForm,
  QuizForm,
  QuizOptionMap,
  QuizType,
} from "@/app/components/create-lesson/form";
import { CartoonButton } from "@/app/components/CartoonButton";
import { Sidebar } from "@/app/components/Sidebar";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
    AlertTriangle,
    ArrowLeft,
    Check,
    Eye,
    ImagePlus,
    Layers,
    Plus,
    Upload,
    X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ChapterPanel } from "@/app/components/create-lesson/ChapterPanel";
import { SortableChapter } from "@/app/components/create-lesson/SortableWrappers";
import { LessonPreviewShell } from "@/app/components/create-lesson/LessonPreviewShell";

/* ───────────────────────────────────────────────── */
function CreateLessonPage() {
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
  const [lessonImage, setLessonImage] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
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

  /* ─── DnD sensors ─── */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  /* ─── Reorder helpers ─── */
  const reorderCards = useCallback(
    (chapterIdx: number, oldIdx: number, newIdx: number) => {
      setChapters((prev) =>
        prev.map((ch, i) =>
          i !== chapterIdx
            ? ch
            : { ...ch, cards: arrayMove(ch.cards, oldIdx, newIdx) },
        ),
      );
    },
    [],
  );

  const reorderQuizzes = useCallback(
    (chapterIdx: number, oldIdx: number, newIdx: number) => {
      setChapters((prev) =>
        prev.map((ch, i) =>
          i !== chapterIdx
            ? ch
            : { ...ch, quizzes: arrayMove(ch.quizzes, oldIdx, newIdx) },
        ),
      );
    },
    [],
  );

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
            `/api/lesson/manage?action=check-title&title=${encodeURIComponent(trimmed)}`,
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
    [isEditMode, editTitle],
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

      if (data.lessonPictureUrl) setThumbnailPreview(data.lessonPictureUrl);
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
                if (
                  q.quizType === "fill_blank" &&
                  Object.keys(opts).length === 0
                ) {
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
      !tags.includes(t) && t.toLowerCase().includes(tagInput.toLowerCase()),
  );

  /* ─── Thumbnail ─── */
  const handleThumbnailSelect = () => {
    imageInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLessonImage(file);
    setThumbnailPreview(URL.createObjectURL(file)); // show local preview
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

  const updateChapter = (idx: number, field: keyof ChapterForm, value: any) => {
    setChapters(
      chapters.map((ch: ChapterForm, i: number) =>
        i === idx ? { ...ch, [field]: value } : ch,
      ),
    );
  };

  const toggleChapter = (idx: number) => {
    setChapters(
      chapters.map((ch: ChapterForm, i: number) =>
        i === idx ? { ...ch, isExpanded: !ch.isExpanded } : ch,
      ),
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
    u[ci].cards = u[ci].cards.filter((_: CardForm, i: number) => i !== cardIdx);
    setChapters(u);
  };

  const updateCard = (
    ci: number,
    cardIdx: number,
    field: keyof CardForm,
    value: string,
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
    u[ci].quizzes = u[ci].quizzes.filter((_: QuizForm, i: number) => i !== qi);
    setChapters(u);
  };

  const updateQuiz = (
    ci: number,
    qi: number,
    field: keyof QuizForm,
    value: any,
  ) => {
    const u = [...chapters];
    u[ci].quizzes[qi] = { ...u[ci].quizzes[qi], [field]: value };
    setChapters(u);
  };

  const updateQuizOption = (
    ci: number,
    qi: number,
    key: string,
    value: string,
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
        A: clearAB ? "" : q.options.A || "",
        B: clearAB ? "" : q.options.B || "",
        C: clearAB ? "" : q.options.C || "",
        D: clearAB ? "" : q.options.D || "",
      };
      q.correctAnswer = "";
    } else {
      // MCQ — clear values if coming from true_false or fill_blank
      const clearAB = oldType === "true_false" || oldType === "fill_blank";
      q.options = {
        A: clearAB ? "" : q.options.A || "",
        B: clearAB ? "" : q.options.B || "",
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
        if (!ch.cards[j].front.trim()) errs.add(`chapter-${i}-card-${j}-front`);
        if (!ch.cards[j].back.trim()) errs.add(`chapter-${i}-card-${j}-back`);
      }

      for (let q = 0; q < ch.quizzes.length; q++) {
        const quiz = ch.quizzes[q];
        if (!quiz.question.trim()) errs.add(`chapter-${i}-quiz-${q}-question`);

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
        const has = Array.from(errs).some((k) => k.startsWith(`chapter-${i}-`));
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
        "A lesson with this title already exists. Please choose a different title.",
      );
      document
        .querySelector('[data-field="title"]')
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSaving(true);
    try {
      const chaptersPayload = chapters.map((ch: ChapterForm) => ({
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
    }));

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("chapters", JSON.stringify(chaptersPayload));
    tags.forEach((tag) => formData.append("tags", tag));
    if (lessonImage) formData.append("lessonImage", lessonImage);

    if (isEditMode) {
      await api.put(
        `/api/lesson/manage?originalTitle=${encodeURIComponent(editTitle!)}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success("Lesson updated and re-submitted for approval!");
    } else {
      await api.post("/api/lesson/manage", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Lesson created and submitted for approval!");
    }
    router.push("/admin");
      router.push("/admin");
    } catch (err: any) {
      toast.error("Save lesson failed:", err);
    } finally {
      setSaving(false);
    }
  };

  /* ─── Loading state ─── */
  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background"/>
    );
  }

  /* ════════════════════════════════════════════════════
     PREVIEW MODE
     ════════════════════════════════════════════════════ */
  if (viewMode === "preview") {
    return (
      <LessonPreviewShell
        title={title}
        description={description}
        chapters={chapters}
        selected={selected}
        setSelected={setSelected}
        previewChapterIdx={previewChapterIdx}
        setPreviewChapterIdx={setPreviewChapterIdx}
        previewCardIdx={previewCardIdx}
        setPreviewCardIdx={setPreviewCardIdx}
        previewFlipped={previewFlipped}
        setPreviewFlipped={setPreviewFlipped}
        quizOverlayOpen={quizOverlayOpen}
        setQuizOverlayOpen={setQuizOverlayOpen}
        onExitPreview={() => {
          setViewMode("edit");
          setPreviewCardIdx(null);
          setPreviewFlipped(false);
        }}
      />
    );
  }

  /* ════════════════════════════════════════════════════
     EDIT MODE
     ════════════════════════════════════════════════════ */
  const totalQuizCount = chapters.reduce(
    (sum, ch) => sum + ch.quizzes.length,
    0,
  );

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex w-full bg-background text-foreground">
        <Sidebar selected={selected} setSelected={setSelected} />
        <div className="flex-1 bg-background overflow-auto">
          {/* ── Hero / Lesson Header ── */}
          <div className="bg-gradient-to-b from-primary/10 to-background px-4 sm:px-6 pt-6 pb-8">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => router.push("/admin")}
                className="p-2 rounded-lg hover:bg-card/80 transition-colors shrink-0"
              >
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground truncate">
                  {isEditMode ? "Edit Lesson" : "Create New Lesson"}
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
                  {"Build your lesson with chapters, flashcards, and quizzes"}
                </p>
              </div>
            </div>

            {/* Thumbnail + Title row */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div
                onClick={handleThumbnailSelect}
                className="shrink-0 w-full md:w-56 h-36 rounded-xl border-2 border-dashed border-border bg-card hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 group"
              >
                {thumbnailPreview ? (
                  <img
                    src={thumbnailPreview}
                    alt="Lesson thumbnail"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                      Upload Thumbnail
                    </span>
                  </>
                )}

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
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
                      <span className="text-xs text-muted-foreground">
                        Checking...
                      </span>
                    </div>
                  )}
                  {!titleChecking &&
                    title.trim() &&
                    !errors.has("title") &&
                    !titleTaken && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Check className="h-3.5 w-3.5 text-success" />
                        <span className="text-xs text-success font-medium">
                          Available
                        </span>
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
                <p className="text-xs text-muted-foreground mt-1.5">
                  Type a custom tag and press{" "}
                  <kbd className="px-1 py-0.5 rounded border border-border bg-muted font-mono text-[10px]">Enter</kbd>{" "}
                  to create it.
                </p>
              </div>
            </div>
          </div>

          {/* ── Chapters ── */}
          <div className="px-4 sm:px-6 py-6">
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
                  const oldIdx = chapters.findIndex(
                    (_: ChapterForm, i: number) => `chapter-${i}` === active.id,
                  );
                  const newIdx = chapters.findIndex(
                    (_: ChapterForm, i: number) => `chapter-${i}` === over.id,
                  );
                  reorderChapters(oldIdx, newIdx);
                }
              }}
            >
              <SortableContext
                items={chapters.map(
                  (_: ChapterForm, i: number) => `chapter-${i}`,
                )}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-5">
                  {chapters.map((chapter: ChapterForm, ci: number) => (
                    <SortableChapter
                      key={`chapter-${ci}`}
                      id={`chapter-${ci}`}
                    >
                      {(chapterDragProps, chapterIsDragging) => (
                        <ChapterPanel
                          chapter={chapter}
                          ci={ci}
                          errors={errors}
                          sensors={sensors}
                          chapterDragProps={chapterDragProps}
                          chapterIsDragging={chapterIsDragging}
                          callbacks={{
                            onToggle: () => toggleChapter(ci),
                            onRemove: () => removeChapter(ci),
                            onUpdateTitle: (v) => updateChapter(ci, "title", v),
                            onUpdateDescription: (v) => updateChapter(ci, "description", v),
                            onAddCard: () => addCard(ci),
                            onRemoveCard: (cardIdx) => removeCard(ci, cardIdx),
                            onUpdateCard: (cardIdx, field, value) => updateCard(ci, cardIdx, field, value),
                            onReorderCards: (oldIdx, newIdx) => reorderCards(ci, oldIdx, newIdx),
                            onAddQuiz: (type) => addQuiz(ci, type),
                            onRemoveQuiz: (qi) => removeQuiz(ci, qi),
                            onUpdateQuiz: (qi, field, value) => updateQuiz(ci, qi, field, value),
                            onUpdateQuizOption: (qi, key, value) => updateQuizOption(ci, qi, key, value),
                            onChangeQuizType: (qi, newType) => changeQuizType(ci, qi, newType),
                            onReorderQuizzes: (oldIdx, newIdx) => reorderQuizzes(ci, oldIdx, newIdx),
                            clearError,
                          }}
                        />
                      )}
                    </SortableChapter>
                  ))}
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
          <div className="px-4 sm:px-6 pb-10 flex flex-wrap justify-end gap-2">
            <CartoonButton
              label="Cancel"
              color="bg-border"
              size="sm"
              onClick={() => router.push("/admin")}
            />
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
      </div>
    </div>
  );
}

export default function CreateLessonPageWrapper() {
  return (
    <Suspense>
      <CreateLessonPage />
    </Suspense>
  );
}
