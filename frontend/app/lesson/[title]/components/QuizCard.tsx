"use client";

import { useState, useEffect } from "react";
import { X, ArrowRight, Check, Crown, RotateCcw } from "lucide-react";
import { api } from "@/app/api/api";
import toast from "react-hot-toast";

interface QuizDTO {
    id: number;
    title: string;
    question: string;
    quizType: "mcq" | "true_false" | "fill_blank";
    options: string;
    correctAnswer: string;
}

interface Node {
    id: number;
    type: "lesson" | "quiz";
    status: "locked" | "available" | "completed";
    quizData?: QuizDTO[];
}

interface QuizCardProps {
    node: Node;
    onClose: () => void;
    onComplete?: () => void;
    timeLimit?: number;
}

function parseOptions(raw: string): string[] {
    return Object.values(JSON.parse(raw) as Record<string, string>);
}

function resolveCorrectAnswer(correctAnswer: string, raw: string): string {
    return (JSON.parse(raw) as Record<string, string>)[correctAnswer];
}

// Replaces ___ in question with the selected word or a blank underline
function renderQuestion(question: string, selected: string | null, checked: boolean, isCorrect: boolean, correctAnswer: string) {
    const parts = question.split("___");
    if (parts.length < 2) return <span>{question}</span>;

    let fillDisplay: React.ReactNode;
    if (!selected) {
        fillDisplay = (
            <span className="inline-block border-b-2 border-dashed border-primary w-20 mx-1 align-bottom" />
        );
    } else if (checked && !isCorrect) {
        fillDisplay = (
            <span className="inline-flex items-center gap-1 mx-1">
                <span className="px-2 py-0.5 rounded font-bold bg-destructive-light text-destructive line-through">
                    {selected}
                </span>
                <span className="px-2 py-0.5 rounded font-bold bg-success-light text-success">
                    {correctAnswer}
                </span>
            </span>
        );
    } else if (checked && isCorrect) {
        fillDisplay = (
            <span className="inline-block mx-1 px-2 py-0.5 rounded font-bold bg-success-light text-success">
                {selected}
            </span>
        );
    } else {
        fillDisplay = (
            <span className="inline-block mx-1 px-2 py-0.5 rounded font-bold bg-primary/10 text-primary border-b-2 border-primary">
                {selected}
            </span>
        );
    }

    return (
        <span>
            {parts[0]}
            {fillDisplay}
            {parts[1]}
        </span>
    );
}

export const QuizCard = ({
    node,
    onClose,
    onComplete,
    timeLimit = 30,
}: QuizCardProps) => {
    const questions = node.quizData ?? [];
    const total = questions.length;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const [checked, setChecked] = useState(false);
    const [results, setResults] = useState<(boolean | null)[]>(
        Array(total).fill(null)
    );
    const [finished, setFinished] = useState(false);
    const [timeLeft, setTimeLeft] = useState(timeLimit);
    const [timeUp, setTimeUp] = useState(false);

    const currentQuiz = questions[currentIndex];
    const options = parseOptions(currentQuiz.options);
    const correctAnswerText = resolveCorrectAnswer(currentQuiz.correctAnswer, currentQuiz.options);
    const isFillBlank = currentQuiz.quizType === "fill_blank";
    const isCorrect = isFillBlank
        ? selected?.trim().toLowerCase() === correctAnswerText.trim().toLowerCase()
        : selected === correctAnswerText;
    const score = results.filter((r) => r === true).length;
    const timerPercent = (timeLeft / timeLimit) * 100;
    const timerColor =
        timeLeft > timeLimit * 0.5
        ? "var(--color-success)"
        : timeLeft > timeLimit * 0.25
        ? "var(--color-warning)"
        : "var(--color-destructive)";

    // Reset timer on question change
    useEffect(() => {
        setTimeLeft(timeLimit);
        setTimeUp(false);
    }, [currentIndex, timeLimit]);

    // Countdown
    useEffect(() => {
        if (checked || timeUp || finished) return;
        if (timeLeft <= 0) {
            setTimeUp(true);
            return;
        }
        const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
        return () => clearTimeout(t);
    }, [timeLeft, checked, timeUp, finished]);

    // ESC to close
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    const handleCheck = () => {
        if (!selected && !timeUp) return;
        setChecked(true);
        setResults((prev) => {
            const updated = [...prev];
            updated[currentIndex] = isCorrect;
            return updated;
        });
    };

    const handleNext = () => {
        if (currentIndex + 1 >= total) {
            const finalScore = score + (isCorrect ? 1 : 0);
            const percentage = Math.round((finalScore / total) * 100);

            api.post("/api/quiz-result", {
                chapterId: node.id,
                score: percentage,
            })
            .then(() => toast.success("Quiz result saved!"))
            .catch(() => toast.error("Failed to save quiz result"));

            setFinished(true);
        } else {
            setCurrentIndex((i) => i + 1);
            setSelected(null);
            setChecked(false);
        }
    };

    const handleRetry = () => {
        setCurrentIndex(0);
        setSelected(null);
        setChecked(false);
        setResults(Array(total).fill(null));
        setFinished(false);
        setTimeLeft(timeLimit);
        setTimeUp(false);
    };

    const handleComplete = () => {
        if (onComplete) onComplete();
        else onClose();
    };

    const isFullMarks = score === total;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn px-4"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-[300px] lg:max-w-[420px]"
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 text-white hover:text-gray-200 transition z-50"
                >
                    <X size={32} />
                </button>

                {/* Card */}
                <div className="relative w-full rounded-2xl p-5 overflow-hidden bg-card border border-border shadow-lg flex flex-col gap-4">
                    {/* Subtle tint */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

                    {/* ── RESULTS SCREEN ── */}
                    {finished ? (
                        <div className="relative z-10 flex flex-col items-center gap-5 py-4">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-primary/20 border-2 border-primary/30 shadow-lg">
                                <span className="text-4xl">{isFullMarks ? "🏆" : "📝"}</span>
                            </div>

                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-foreground mb-1">
                                    {isFullMarks ? "Perfect Score!" : "Quiz Complete"}
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                    You got{" "}
                                    <span className="font-bold text-primary">
                                        {score} / {total}
                                    </span>{" "}
                                    correct
                                </p>
                            </div>

                            {/* Score bar */}
                            <div className="w-full bg-border rounded-full h-3 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-primary transition-all duration-700"
                                    style={{ width: `${(score / total) * 100}%` }}
                                />
                            </div>

                            {/* Per-question result dots */}
                            <div className="flex gap-2 justify-center">
                                {results.map((r, i) => (
                                    <div
                                        key={i}
                                        className={`w-3 h-3 rounded-full ${
                                            r === true
                                                ? "bg-success"
                                                : r === false
                                                ? "bg-destructive"
                                                : "bg-border"
                                        }`}
                                    />
                                ))}
                            </div>

                            <div className="w-full flex flex-col gap-2 pt-2 border-t border-border">
                                {isFullMarks ? (
                                    <button
                                        onClick={handleComplete}
                                        className="w-full flex items-center justify-center gap-2 rounded-xl py-3 bg-success text-white font-semibold text-base hover:scale-[1.02] transition-all shadow-md"
                                    >
                                        Complete Chapter
                                        <Check className="h-4 w-4" />
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleRetry}
                                            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 bg-primary text-white font-semibold text-base hover:bg-primary-dark hover:scale-[1.02] transition-all shadow-md"
                                        >
                                            Try Again
                                            <RotateCcw className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={onClose}
                                            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 border border-border text-muted-foreground font-semibold text-base hover:bg-border/30 transition-all"
                                        >
                                            Close
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* ── QUESTION SCREEN ── */}

                            {/* Header: icon + progress bar + timer */}
                            <div className="relative z-10 flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                                    <Crown className="h-4 w-4 text-white" />
                                </div>

                                <div className="flex-1 flex flex-col gap-1">
                                    <div className="flex gap-1">
                                        {questions.map((_, i) => {
                                            let barColor = "bg-border";
                                            if (i < currentIndex) {
                                                barColor = results[i] === true ? "bg-success" : "bg-destructive";
                                            } else if (i === currentIndex) {
                                                barColor = "bg-primary";
                                            }
                                            return (
                                                <div
                                                    key={i}
                                                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${barColor}`}
                                                />
                                            );
                                        })}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Question {currentIndex + 1} of {total}
                                    </p>
                                </div>

                                {/* Timer ring */}
                                {!checked && (
                                    <div className="relative w-9 h-9 shrink-0">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                            <circle
                                                cx="18" cy="18" r="15"
                                                fill="none" stroke="currentColor" strokeWidth="3"
                                                className="text-border"
                                            />
                                            <circle
                                                cx="18" cy="18" r="15"
                                                fill="none" strokeWidth="3"
                                                stroke={timerColor}
                                                strokeDasharray={`${(timerPercent / 100) * 94.2} 94.2`}
                                                strokeLinecap="round"
                                                style={{ transition: "stroke-dasharray 1s linear, stroke 0.5s" }}
                                            />
                                        </svg>
                                        <span
                                            className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                                            style={{ color: timerColor }}
                                        >
                                            {timeLeft}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Question text */}
                            <div className="relative z-10">
                                <p className="text-base lg:text-lg text-foreground leading-relaxed font-medium">
                                    {isFillBlank
                                        ? renderQuestion(currentQuiz.question, selected, checked, isCorrect, correctAnswerText)
                                        : currentQuiz.question
                                    }
                                </p>
                            </div>

                            {/* Options / Word Bank */}
                            <div className="relative z-10 flex flex-col gap-2">
                                {isFillBlank ? (
                                    <>
                                        {/* Word bank label */}
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center mb-1">
                                            Word Bank
                                        </p>
                                        {/* Word bank chips */}
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            {options.map((option, i) => {
                                                const isSelected = selected === option;
                                                let chipStyle = "border border-border bg-card text-foreground hover:border-primary hover:bg-primary/5 cursor-pointer";

                                                if (checked) {
                                                    if (option === correctAnswerText) {
                                                        chipStyle = "border-2 border-success bg-success-light text-success font-semibold cursor-default";
                                                    } else if (isSelected) {
                                                        chipStyle = "border-2 border-destructive bg-destructive-light text-destructive line-through cursor-default";
                                                    } else {
                                                        chipStyle = "border border-border bg-card text-muted-foreground opacity-50 cursor-default";
                                                    }
                                                } else if (isSelected) {
                                                    chipStyle = "border-2 border-primary bg-primary/10 text-primary font-semibold cursor-pointer";
                                                }

                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => {
                                                            if (checked || timeUp) return;
                                                            // Toggle off if already selected
                                                            setSelected(isSelected ? null : option);
                                                        }}
                                                        disabled={checked || timeUp}
                                                        className={`px-4 py-2 rounded-xl text-sm transition-all duration-150 ${chipStyle}`}
                                                    >
                                                        {option}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </>
                                ) : (
                                    /* MCQ / True-False: regular option buttons */
                                    options.map((option, i) => {
                                        let optionStyle =
                                            "border border-border bg-card text-foreground hover:border-primary hover:bg-primary/5";

                                        if (checked) {
                                            if (option === correctAnswerText) {
                                                optionStyle = "border-2 border-success bg-success-light text-success font-semibold";
                                            } else if (option === selected) {
                                                optionStyle = "border-2 border-destructive bg-destructive-light text-destructive font-semibold";
                                            } else {
                                                optionStyle = "border border-border bg-card text-muted-foreground opacity-50";
                                            }
                                        } else if (option === selected) {
                                            optionStyle = "border-2 border-primary bg-primary/10 text-foreground font-semibold";
                                        }

                                        return (
                                            <button
                                                key={i}
                                                onClick={() => !checked && !timeUp && setSelected(option)}
                                                disabled={checked || timeUp}
                                                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-150 ${optionStyle} ${
                                                    !checked && !timeUp ? "cursor-pointer" : "cursor-default"
                                                }`}
                                            >
                                                {option}
                                            </button>
                                        );
                                    })
                                )}

                                {timeUp && !checked && (
                                    <p className="text-center text-sm text-destructive font-semibold mt-1">
                                        Time&apos;s up!
                                    </p>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="relative z-10 border-t border-border pt-4">
                                {!checked ? (
                                    <button
                                        onClick={handleCheck}
                                        disabled={!selected && !timeUp}
                                        className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-base transition-all ${
                                            selected || timeUp
                                                ? "bg-primary hover:bg-primary-dark text-white hover:scale-[1.02] shadow-md"
                                                : "bg-border text-muted-foreground cursor-not-allowed"
                                        }`}
                                    >
                                        Check
                                        <Check className="h-4 w-4" />
                                    </button>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <div
                                            className={`rounded-xl px-4 py-2 text-center font-bold text-sm ${
                                                isCorrect
                                                    ? "bg-success-light text-success border border-success/20"
                                                    : "bg-destructive-light text-destructive border border-destructive/20"
                                            }`}
                                        >
                                            {isCorrect ? "🎉 Correct!" : `✗ Correct answer: ${correctAnswerText}`}
                                        </div>

                                        <button
                                            onClick={handleNext}
                                            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 bg-primary hover:bg-primary-dark text-white font-semibold text-base hover:scale-[1.02] transition-all"
                                        >
                                            {currentIndex + 1 >= total ? "See Results" : "Next Question"}
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};