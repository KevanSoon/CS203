"use client";

import {
  closestCenter,
  DndContext,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  rectSortingStrategy,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Code2,
  Crown,
  ExternalLink,
  GripVertical,
  ImagePlus,
  Loader2,
  Plus,
  Sparkles,
  Star,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { CREATE_LESSON_LIMITS, OPTION_KEYS_MCQ, optionKeysForType, CardForm, ChapterForm, QuizForm, QuizType } from "./form";
import { SortableCard, SortableQuiz } from "./SortableWrappers";

const QUIZ_TYPE_LABELS: Record<QuizType, string> = {
  mcq: "Multiple Choice",
  true_false: "True / False",
  fill_blank: "Fill in the Blank",
};

/* ─── Verify types & constants ─── */
interface VerifyEvidence {
  url: string;
  title: string;
  content: string;
}

interface VerifyResult {
  slang_term: string;
  verdict: string;
  confidence: number;
  evidence: VerifyEvidence[];
  reasoning: string;
}

const VERDICT_LABELS: Record<string, string> = {
  real: "Real",
  likely_real: "Likely Real",
  unverified: "Unverified",
  ai_slop: "AI Slop",
};

function scoreVerdict(confidence: number): string {
  if (confidence >= 0.85) return "real";
  if (confidence >= 0.65) return "likely_real";
  if (confidence >= 0.40) return "unverified";
  return "ai_slop";
}

const VERDICT_PILL: Record<string, string> = {
  real: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  likely_real: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  unverified: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  ai_slop: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const VERDICT_ICON: Record<string, string> = {
  real: "text-green-500",
  likely_real: "text-blue-500",
  unverified: "text-yellow-500",
  ai_slop: "text-red-500",
};

/* ─── CardItem ─── */
interface CardItemProps {
  card: CardForm;
  cardIdx: number;
  frontKey: string;
  backKey: string;
  hasErr: boolean;
  isDragging: boolean;
  dragHandleProps: React.HTMLAttributes<HTMLElement>;
  errors: Set<string>;
  readOnly: boolean;
  onUpdateCard: (field: keyof CardForm, value: string) => void;
  onRemoveCard: () => void;
  clearError: (key: string) => void;
}

function CardItem({
  card,
  cardIdx,
  frontKey,
  backKey,
  hasErr,
  isDragging,
  dragHandleProps,
  errors,
  readOnly,
  onUpdateCard,
  onRemoveCard,
  clearError,
}: CardItemProps) {
  const [verifyState, setVerifyState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showAllSources, setShowAllSources] = useState(false);
  const [frontFocused, setFrontFocused] = useState(false);
  const [backFocused, setBackFocused] = useState(false);

  const handleVerify = async () => {
    setVerifyState("loading");
    setShowResult(false);
    try {
      const { data } = await axios.post<VerifyResult>("/api/verify", {
        question: card.front,
        content: card.back,
      });
      setVerifyResult(data);
      setVerifyState("done");
      setShowResult(true);
    } catch {
      setVerifyState("error");
    }
  };

  return (
    <div
      className={`relative rounded-2xl border-2 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-zinc-900 dark:via-zinc-900/95 dark:to-zinc-800 shadow-sm overflow-hidden group transition-colors ${
        hasErr ? "border-destructive/60" : "border-border"
      } ${isDragging ? "shadow-xl border-primary" : ""}`}
    >
      {!readOnly && (
        <>
          <div
            {...dragHandleProps}
            className="absolute top-3 left-3 z-10 cursor-grab active:cursor-grabbing p-0.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors touch-none"
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <button
            onClick={onRemoveCard}
            className="absolute top-3 right-3 z-10 p-1 text-muted-foreground hover:text-destructive transition-all opacity-100 sm:opacity-0 md:group-hover:opacity-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <div className="absolute top-3 left-8 z-10">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 text-primary text-xs font-bold">
              {cardIdx + 1}
            </span>
          </div>
        </>
      )}

      {readOnly && (
        <button
          onClick={handleVerify}
          disabled={verifyState === "loading"}
          title="Verify with AI"
          className={`absolute top-3 right-3 z-10 p-1.5 rounded-lg transition-all disabled:cursor-not-allowed
            ${verifyState === "done" && verifyResult
              ? VERDICT_ICON[scoreVerdict(verifyResult.confidence)]
              : "text-primary/60 hover:text-primary"
            }
            ${verifyState === "loading" ? "opacity-100" : ""}
          `}
        >
          {verifyState === "loading"
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <Sparkles className="h-3.5 w-3.5" />
          }
        </button>
      )}

      <div className={`p-4 space-y-3 ${readOnly ? "pt-4" : "pt-10"}`}>
        {readOnly && (
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 text-primary text-xs font-bold">
            {cardIdx + 1}
          </span>
        )}
        <div data-field={readOnly ? undefined : frontKey}>
          <div className="flex items-center gap-1.5 mb-1">
            <Zap className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
              Front
            </span>
          </div>
          {readOnly ? (
            <p className="text-sm text-foreground whitespace-pre-wrap rounded-lg bg-background/60 border border-border/50 px-3 py-2 min-h-[60px]">
              {card.front}
            </p>
          ) : (
            <>
              <textarea
                value={card.front}
                onChange={(e) => {
                  onUpdateCard("front", e.target.value);
                  clearError(frontKey);
                }}
                onFocus={() => setFrontFocused(true)}
                onBlur={() => setFrontFocused(false)}
                maxLength={CREATE_LESSON_LIMITS.cardFront}
                placeholder="Question or term..."
                rows={2}
                className={`w-full rounded-lg bg-background/60 border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none transition-colors ${
                  errors.has(frontKey)
                    ? "border-destructive ring-1 ring-destructive/50"
                    : "border-border/50"
                }`}
              />
              <p className={`text-[11px] mt-0.5 text-right transition-colors ${
                frontFocused && card.front.length >= CREATE_LESSON_LIMITS.cardFront ? "text-destructive font-medium" : "text-muted-foreground/70"
              }`}>
                {card.front.length} / {CREATE_LESSON_LIMITS.cardFront}
              </p>
            </>
          )}
        </div>

        <div data-field={readOnly ? undefined : backKey}>
          <div className="flex items-center gap-1.5 mb-1">
            <Code2 className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
              Back
            </span>
          </div>
          {readOnly ? (
            <p className="text-sm text-foreground whitespace-pre-wrap rounded-lg bg-background/60 border border-border/50 px-3 py-2 min-h-[60px]">
              {card.back}
            </p>
          ) : (
            <>
              <textarea
                value={card.back}
                onChange={(e) => {
                  onUpdateCard("back", e.target.value);
                  clearError(backKey);
                }}
                onFocus={() => setBackFocused(true)}
                onBlur={() => setBackFocused(false)}
                maxLength={CREATE_LESSON_LIMITS.cardBack}
                placeholder="Answer or definition..."
                rows={2}
                className={`w-full rounded-lg bg-background/60 border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none transition-colors ${
                  errors.has(backKey)
                    ? "border-destructive ring-1 ring-destructive/50"
                    : "border-border/50"
                }`}
              />
              <p className={`text-[11px] mt-0.5 text-right transition-colors ${
                backFocused && card.back.length >= CREATE_LESSON_LIMITS.cardBack ? "text-destructive font-medium" : "text-muted-foreground/70"
              }`}>
                {card.back.length} / {CREATE_LESSON_LIMITS.cardBack}
              </p>
            </>
          )}
        </div>

        {readOnly && verifyState === "error" && (
          <div className="flex items-center justify-between rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
            <span className="text-xs text-destructive">Verification failed.</span>
            <button onClick={handleVerify} className="text-xs text-destructive underline hover:no-underline">
              Retry
            </button>
          </div>
        )}

        {readOnly && showResult && verifyResult && (
          <div className="rounded-xl border border-border/50 bg-background/80 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">AI Verification</span>
              </div>
              <button
                onClick={() => setShowResult(false)}
                className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            <div className="px-3 py-2.5 space-y-2.5">
              {/* Verdict pill */}
              <div className="flex items-center gap-2">
                {(() => { const v = scoreVerdict(verifyResult.confidence); return (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${VERDICT_PILL[v]}`}>
                    {VERDICT_LABELS[v]}
                  </span>
                ); })()}
              </div>

              {/* Reasoning inline */}
              {verifyResult.reasoning && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">Reasoning:</span> {verifyResult.reasoning}
                </p>
              )}

              {/* Sources */}
              {verifyResult.evidence.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Sources</p>
                  <div className="space-y-1">
                    {(showAllSources ? verifyResult.evidence : verifyResult.evidence.slice(0, 1)).map((e, i) => (
                      <a
                        key={i}
                        href={e.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-1.5 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3 shrink-0 mt-0.5" />
                        <span className="truncate">{e.title || e.url}</span>
                      </a>
                    ))}
                    {verifyResult.evidence.length > 1 && (
                      <button
                        onClick={() => setShowAllSources((v) => !v)}
                        className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showAllSources ? "Show less" : `Show all ${verifyResult.evidence.length} sources`}
                      </button>
                    )}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-muted-foreground/70 italic">
                This AI verification uses Gen AI. Responses may be inaccurate.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* ─── QuizItem ─── */
interface QuizItemProps {
  quiz: QuizForm;
  qi: number;
  ci: number;
  errors: Set<string>;
  isDragging: boolean;
  dragHandleProps: React.HTMLAttributes<HTMLElement>;
  readOnly: boolean;
  onRemoveQuiz: () => void;
  onUpdateQuiz: (field: keyof QuizForm, value: any) => void;
  onUpdateQuizOption: (key: string, value: string) => void;
  onChangeQuizType: (type: QuizType) => void;
  clearError: (key: string) => void;
}

function QuizItem({
  quiz,
  qi,
  ci,
  errors,
  isDragging,
  dragHandleProps,
  readOnly,
  onRemoveQuiz,
  onUpdateQuiz,
  onUpdateQuizOption,
  onChangeQuizType,
  clearError,
}: QuizItemProps) {
  const keys = optionKeysForType(quiz.quizType);
  const qHasErr = Array.from(errors).some((k) =>
    k.startsWith(`chapter-${ci}-quiz-${qi}`),
  );
  const [questionFocused, setQuestionFocused] = useState(false);

  return (
    <div
      className={`rounded-2xl border-2 bg-warning/5 p-5 space-y-4 transition-colors ${
        qHasErr ? "border-destructive/50" : "border-warning/30"
      } ${isDragging ? "shadow-xl" : ""}`}
    >
      {/* Quiz header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!readOnly && (
            <div
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground/40 hover:text-muted-foreground transition-colors touch-none"
            >
              <GripVertical className="h-4 w-4" />
            </div>
          )}
          <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-warning/20 text-warning text-xs font-bold">
            Q{qi + 1}
          </span>
          {/* Type toggle — only in edit mode */}
          {!readOnly ? (
            <div className="flex rounded-lg border border-border overflow-hidden text-xs">
              {(Object.keys(QUIZ_TYPE_LABELS) as QuizType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onChangeQuizType(t)}
                  className={`px-2 sm:px-2.5 py-1 transition-colors ${
                    quiz.quizType === t
                      ? "bg-warning text-white font-medium"
                      : "bg-card text-muted-foreground hover:bg-warning/10"
                  }`}
                >
                  <span className="sm:hidden">
                    {t === "mcq" ? "MCQ" : t === "true_false" ? "T/F" : "Fill"}
                  </span>
                  <span className="hidden sm:inline">{QUIZ_TYPE_LABELS[t]}</span>
                </button>
              ))}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground font-medium px-2 py-0.5 rounded-full bg-warning/10 text-warning">
              {QUIZ_TYPE_LABELS[quiz.quizType]}
            </span>
          )}
        </div>
        {!readOnly && (
          <button
            onClick={onRemoveQuiz}
            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Question */}
      <div data-field={readOnly ? undefined : `chapter-${ci}-quiz-${qi}-question`}>
        {readOnly ? (
          <p className="text-sm text-foreground whitespace-pre-wrap bg-card/50 rounded-xl border border-border/50 px-4 py-3">
            {quiz.question}
          </p>
        ) : (
          <>
            <textarea
              value={quiz.question}
              onChange={(e) => {
                onUpdateQuiz("question", e.target.value);
                clearError(`chapter-${ci}-quiz-${qi}-question`);
              }}
              onFocus={() => setQuestionFocused(true)}
              onBlur={() => setQuestionFocused(false)}
              maxLength={CREATE_LESSON_LIMITS.quizQuestion}
              placeholder={
                quiz.quizType === "fill_blank"
                  ? `Use ___ for the blank, e.g. "The ___ is the powerhouse of the cell"`
                  : "Write your quiz question here... *"
              }
              rows={2}
              className={`w-full bg-card/50 rounded-xl border px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-warning/50 resize-none transition-colors ${
                errors.has(`chapter-${ci}-quiz-${qi}-question`)
                  ? "border-destructive"
                  : "border-border/50"
              }`}
            />
            <p className={`text-[11px] mt-0.5 text-right transition-colors ${
              questionFocused && quiz.question.length >= CREATE_LESSON_LIMITS.quizQuestion ? "text-destructive font-medium" : "text-muted-foreground/70"
            }`}>
              {quiz.question.length} / {CREATE_LESSON_LIMITS.quizQuestion}
            </p>
          </>
        )}

        {/* Fill-blank preview */}
        {quiz.quizType === "fill_blank" && quiz.question.trim() && (
          <div className="mt-2 px-4 py-2.5 rounded-xl bg-warning/5 border border-warning/20 text-sm text-foreground">
            <span className="text-[10px] font-semibold text-warning uppercase tracking-wide block mb-1">
              Preview
            </span>
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
        {!readOnly &&
          quiz.quizType === "fill_blank" &&
          quiz.question.trim() &&
          !quiz.question.includes("___") && (
            <p className="text-[11px] text-warning mt-1 flex items-center gap-1">
              ⚠ Add{" "}
              <code className="bg-warning/10 px-1 rounded">___</code> (3 underscores) to mark
              where the blank goes
            </p>
          )}
      </div>

      {/* Options */}
      {quiz.quizType === "fill_blank" ? (
        <div data-field={readOnly ? undefined : `chapter-${ci}-quiz-${qi}-options`}>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Word Bank
            {!readOnly &&
              errors.has(`chapter-${ci}-quiz-${qi}-answer`) && (
                <span className="text-destructive ml-2">
                  ← Select the correct word
                </span>
              )}
          </p>
          <div className="space-y-2.5">
            {OPTION_KEYS_MCQ.map((key) => (
              <div key={key} className="flex items-center gap-2.5">
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => {
                    if (readOnly) return;
                    onUpdateQuiz("correctAnswer", key);
                    clearError(`chapter-${ci}-quiz-${qi}-answer`);
                  }}
                  className={`shrink-0 h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                    quiz.correctAnswer === key
                      ? "bg-success text-white shadow-[0_3px_0_0_var(--color-success-shadow)] -translate-y-0.5"
                      : readOnly
                        ? "bg-card border-2 border-border text-muted-foreground"
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
                  readOnly={readOnly}
                  onChange={(e) => {
                    onUpdateQuizOption(key, e.target.value);
                    clearError(`chapter-${ci}-quiz-${qi}-options`);
                  }}
                  placeholder={`Word ${key}`}
                  className={`flex-1 rounded-xl border bg-card/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-warning/50 transition-colors ${
                    readOnly ? "cursor-default" : ""
                  } ${
                    !readOnly && errors.has(`chapter-${ci}-quiz-${qi}-options`)
                      ? "border-destructive/50"
                      : "border-border/50"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div data-field={readOnly ? undefined : `chapter-${ci}-quiz-${qi}-options`}>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Options
            {!readOnly &&
              errors.has(`chapter-${ci}-quiz-${qi}-answer`) && (
                <span className="text-destructive ml-2">
                  ← Select a correct answer
                </span>
              )}
          </p>
          <div className="space-y-2.5">
            {keys.map((key) => (
              <div key={key} className="flex items-center gap-2.5">
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => {
                    if (readOnly) return;
                    onUpdateQuiz("correctAnswer", key);
                    clearError(`chapter-${ci}-quiz-${qi}-answer`);
                  }}
                  className={`shrink-0 h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                    quiz.correctAnswer === key
                      ? "bg-success text-white shadow-[0_3px_0_0_var(--color-success-shadow)] -translate-y-0.5"
                      : readOnly
                        ? "bg-card border-2 border-border text-muted-foreground"
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
                  readOnly={readOnly || quiz.quizType === "true_false"}
                  disabled={!readOnly && quiz.quizType === "true_false"}
                  onChange={(e) => {
                    onUpdateQuizOption(key, e.target.value);
                    clearError(`chapter-${ci}-quiz-${qi}-options`);
                  }}
                  placeholder={
                    quiz.quizType === "true_false"
                      ? key === "A"
                        ? "True"
                        : "False"
                      : `Option ${key}`
                  }
                  className={`flex-1 rounded-xl border bg-card/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-warning/50 transition-colors ${
                    readOnly || quiz.quizType === "true_false"
                      ? "bg-muted/30 cursor-default"
                      : ""
                  } ${
                    !readOnly && errors.has(`chapter-${ci}-quiz-${qi}-options`)
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
  );
}

/* ─── ChapterPanel (public) ─── */
export interface ChapterPanelCallbacks {
  onToggle: () => void;
  onRemove: () => void;
  onUpdateTitle: (value: string) => void;
  onUpdateDescription: (value: string) => void;
  onAddCard: () => void;
  onRemoveCard: (cardIdx: number) => void;
  onUpdateCard: (cardIdx: number, field: keyof CardForm, value: string) => void;
  onReorderCards: (oldIdx: number, newIdx: number) => void;
  onAddQuiz: (type: QuizType) => void;
  onRemoveQuiz: (qi: number) => void;
  onUpdateQuiz: (qi: number, field: keyof QuizForm, value: any) => void;
  onUpdateQuizOption: (qi: number, key: string, value: string) => void;
  onChangeQuizType: (qi: number, newType: QuizType) => void;
  onReorderQuizzes: (oldIdx: number, newIdx: number) => void;
  clearError: (key: string) => void;
}

interface ChapterPanelProps {
  chapter: ChapterForm;
  ci: number;
  errors?: Set<string>;
  sensors?: any;
  chapterDragProps?: React.HTMLAttributes<HTMLElement>;
  chapterIsDragging?: boolean;
  readOnly?: boolean;
  callbacks?: ChapterPanelCallbacks;
}

export function ChapterPanel({
  chapter: chapterProp,
  ci,
  errors = new Set(),
  sensors,
  chapterDragProps,
  chapterIsDragging,
  readOnly = false,
  callbacks,
}: ChapterPanelProps) {
  // In read-only mode, manage expand state locally since there's no parent state
  const [localExpanded, setLocalExpanded] = useState(chapterProp.isExpanded ?? true);
  const isExpanded = readOnly ? localExpanded : chapterProp.isExpanded;
  const chapter = readOnly ? { ...chapterProp, isExpanded } : chapterProp;
  const [chTitleFocused, setChTitleFocused] = useState(false);
  const [chDescFocused, setChDescFocused] = useState(false);

  const chapterHasErr = !readOnly &&
    Array.from(errors).some((k) => k.startsWith(`chapter-${ci}-`));

  return (
    <div
      className={`rounded-xl border bg-card shadow-sm overflow-hidden transition-colors ${
        chapterHasErr ? "border-destructive/50" : "border-border"
      } ${chapterIsDragging ? "shadow-xl" : ""}`}
    >
      {/* ── Chapter Header ── */}
      <div
        className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
          isExpanded
            ? "bg-primary/10 border-b border-primary/20"
            : "hover:bg-border/30"
        }`}
        onClick={() => {
          if (readOnly) {
            setLocalExpanded((v) => !v);
          } else {
            callbacks?.onToggle();
          }
        }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {!readOnly && chapterDragProps && (
            <div
              {...chapterDragProps}
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 cursor-grab active:cursor-grabbing p-1 text-muted-foreground/40 hover:text-muted-foreground transition-colors touch-none"
            >
              <GripVertical className="h-4 w-4" />
            </div>
          )}
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white text-sm font-bold shrink-0">
            {ci + 1}
          </span>
          {!readOnly && isExpanded ? (
            <input
              type="text"
              value={chapter.title}
              data-field={`chapter-${ci}-title`}
              onChange={(e) => {
                callbacks?.onUpdateTitle(e.target.value);
                callbacks?.clearError(`chapter-${ci}-title`);
              }}
            onFocus={() => setChTitleFocused(true)}
              onBlur={() => setChTitleFocused(false)}
              onClick={(e) => e.stopPropagation()}
              maxLength={CREATE_LESSON_LIMITS.chapterTitle}
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
          <span className="hidden sm:inline text-xs text-muted-foreground shrink-0 ml-2">
            {chapter.cards.length} card{chapter.cards.length !== 1 ? "s" : ""} · {chapter.quizzes.length} quiz question{chapter.quizzes.length !== 1 ? "s" : ""}
            {!readOnly && isExpanded && (
              <span className={`ml-2 ${chTitleFocused && chapter.title.length >= CREATE_LESSON_LIMITS.chapterTitle ? "text-destructive font-medium" : "text-muted-foreground/60"}`}>
                · {chapter.title.length}/{CREATE_LESSON_LIMITS.chapterTitle}
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {!readOnly && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                callbacks?.onRemove();
              }}
              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* ── Chapter Body ── */}
      {isExpanded && (
        <div className="p-5 space-y-6">
          {/* Description */}
          {readOnly ? (
            chapter.description && (
              <p className="text-sm text-muted-foreground">{chapter.description}</p>
            )
          ) : (
            <>
              <input
                type="text"
                value={chapter.description}
                data-field={`chapter-${ci}-description`}
                onChange={(e) => {
                  callbacks?.onUpdateDescription(e.target.value);
                  callbacks?.clearError(`chapter-${ci}-description`);
                }}
                onFocus={() => setChDescFocused(true)}
                onBlur={() => setChDescFocused(false)}
                maxLength={CREATE_LESSON_LIMITS.chapterDescription}
                placeholder="Chapter description (optional)"
                className={`w-full text-sm bg-transparent border-b outline-none text-foreground placeholder:text-muted-foreground/50 pb-2 focus:border-primary transition-colors ${
                  errors.has(`chapter-${ci}-description`)
                    ? "border-destructive"
                    : "border-border/50"
                }`}
              />
              <p className={`text-[11px] mt-0.5 text-right transition-colors ${
                chDescFocused && chapter.description.length >= CREATE_LESSON_LIMITS.chapterDescription ? "text-destructive font-medium" : "text-muted-foreground/70"
              }`}>
                {chapter.description.length} / {CREATE_LESSON_LIMITS.chapterDescription}
              </p>
            </>
          )}

          {/* ── Flashcards ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                Flashcards ({chapter.cards.length})
              </h3>
              {!readOnly && (
                <button
                  onClick={() => callbacks?.onAddCard()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Card
                </button>
              )}
            </div>

            {!readOnly ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event: DragEndEvent) => {
                  const { active, over } = event;
                  if (over && active.id !== over.id) {
                    const oldIdx = chapter.cards.findIndex((c: CardForm) => c.id === active.id);
                    const newIdx = chapter.cards.findIndex((c: CardForm) => c.id === over.id);
                    if (oldIdx !== -1 && newIdx !== -1)
                      callbacks?.onReorderCards(oldIdx, newIdx);
                  }
                }}
              >
                <SortableContext
                  items={chapter.cards.map((c: CardForm) => c.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {chapter.cards.map((card: CardForm, cardIdx: number) => {
                      const fk = `chapter-${ci}-card-${cardIdx}-front`;
                      const bk = `chapter-${ci}-card-${cardIdx}-back`;
                      return (
                        <SortableCard key={card.id} id={card.id}>
                          {(dragHandleProps, isDragging) => (
                            <CardItem
                              card={card}
                              cardIdx={cardIdx}
                              frontKey={fk}
                              backKey={bk}
                              hasErr={errors.has(fk) || errors.has(bk)}
                              isDragging={isDragging}
                              dragHandleProps={dragHandleProps}
                              errors={errors}
                              readOnly={false}
                              onUpdateCard={(field, value) =>
                                callbacks?.onUpdateCard(cardIdx, field, value)
                              }
                              onRemoveCard={() => callbacks?.onRemoveCard(cardIdx)}
                              clearError={callbacks?.clearError ?? (() => {})}
                            />
                          )}
                        </SortableCard>
                      );
                    })}
                    <button
                      onClick={() => callbacks?.onAddCard()}
                      className="rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2 min-h-[200px] text-muted-foreground hover:text-primary"
                    >
                      <Plus className="h-8 w-8" />
                      <span className="text-sm font-medium">Add Card</span>
                    </button>
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chapter.cards.map((card: CardForm, cardIdx: number) => (
                  <CardItem
                    key={card.id}
                    card={card}
                    cardIdx={cardIdx}
                    frontKey=""
                    backKey=""
                    hasErr={false}
                    isDragging={false}
                    dragHandleProps={{}}
                    errors={new Set()}
                    readOnly={true}
                    onUpdateCard={() => {}}
                    onRemoveCard={() => {}}
                    clearError={() => {}}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Quiz Section ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Crown className="h-4 w-4 text-warning" />
                Quiz Questions ({chapter.quizzes.length})
              </h3>
              {!readOnly && (
                <div className="flex gap-1.5">
                  {(["mcq", "true_false", "fill_blank"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => callbacks?.onAddQuiz(t)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-warning/10 text-warning hover:bg-warning/20 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {t === "mcq" ? "MCQ" : t === "true_false" ? "T/F" : "Fill"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!readOnly ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event: DragEndEvent) => {
                  const { active, over } = event;
                  if (over && active.id !== over.id) {
                    const oldIdx = chapter.quizzes.findIndex((q: QuizForm) => q.id === active.id);
                    const newIdx = chapter.quizzes.findIndex((q: QuizForm) => q.id === over.id);
                    callbacks?.onReorderQuizzes(oldIdx, newIdx);
                  }
                }}
              >
                <SortableContext
                  items={chapter.quizzes.map((q: QuizForm) => q.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {chapter.quizzes.map((quiz: QuizForm, qi: number) => (
                      <SortableQuiz key={quiz.id} id={quiz.id}>
                        {(dragHandleProps, isDragging) => (
                          <QuizItem
                            quiz={quiz}
                            qi={qi}
                            ci={ci}
                            errors={errors}
                            isDragging={isDragging}
                            dragHandleProps={dragHandleProps}
                            readOnly={false}
                            onRemoveQuiz={() => callbacks?.onRemoveQuiz(qi)}
                            onUpdateQuiz={(field, value) =>
                              callbacks?.onUpdateQuiz(qi, field, value)
                            }
                            onUpdateQuizOption={(key, value) =>
                              callbacks?.onUpdateQuizOption(qi, key, value)
                            }
                            onChangeQuizType={(type) =>
                              callbacks?.onChangeQuizType(qi, type)
                            }
                            clearError={callbacks?.clearError ?? (() => {})}
                          />
                        )}
                      </SortableQuiz>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="space-y-4">
                {chapter.quizzes.map((quiz: QuizForm, qi: number) => (
                  <QuizItem
                    key={quiz.id}
                    quiz={quiz}
                    qi={qi}
                    ci={ci}
                    errors={new Set()}
                    isDragging={false}
                    dragHandleProps={{}}
                    readOnly={true}
                    onRemoveQuiz={() => {}}
                    onUpdateQuiz={() => {}}
                    onUpdateQuizOption={() => {}}
                    onChangeQuizType={() => {}}
                    clearError={() => {}}
                  />
                ))}
              </div>
            )}

            {!readOnly && (
              <div className="flex gap-1.5 mt-3">
                {(["mcq", "true_false", "fill_blank"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => callbacks?.onAddQuiz(t)}
                    className="flex-1 py-2.5 rounded-xl border-2 border-dashed border-warning/30 hover:border-warning hover:bg-warning/5 transition-colors flex items-center justify-center gap-1.5 text-muted-foreground hover:text-warning text-xs font-medium"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {t === "mcq" ? "MCQ" : t === "true_false" ? "T/F" : "Fill"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
