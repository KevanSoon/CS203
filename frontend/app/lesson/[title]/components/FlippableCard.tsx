"use client";

import { useState, useEffect } from "react";
import { X, ArrowRight, Code2, /* Rocket, */ Zap, Check } from "lucide-react";
import { QuizCard } from "./QuizCard";

interface Node {
  id: number;
  type: "lesson" | "quiz";
  status: "locked" | "available" | "completed";
  content?: {
    front: string;
    back: string;
  };
}

interface FlippableCardProps {
  node: Node;
  onClose: () => void;
  onComplete?: () => void;
}

export const FlippableCard = ({ node, onClose, onComplete }: FlippableCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);


  // Regular lesson card with new flip style
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[300px] lg:max-w-[420px]"
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-200 transition z-50"
        >
          <X size={32} />
        </button>

        <div
          className="group relative h-[360px] lg:h-[480px] w-full"
          style={{ perspective: "2000px" }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div
            className="relative h-full w-full transition-all duration-700 cursor-pointer"
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front of card */}
            <div
              className={`
                absolute inset-0 h-full w-full rounded-2xl p-5 overflow-hidden
                bg-gradient-to-br from-white via-slate-50 to-slate-100
                dark:from-zinc-900 dark:via-zinc-900/95 dark:to-zinc-800
                border border-slate-200 dark:border-zinc-800/50
                shadow-lg dark:shadow-xl
                flex flex-col
                transition-all duration-700
                ${isFlipped ? "opacity-0" : "opacity-100"}
              `}
              style={{ backfaceVisibility: "hidden" }}
            >
              {/* Background gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 dark:from-primary/10 via-transparent to-blue-500/5 dark:to-blue-500/10" />

              {/* Top content */}
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-primary/90 to-primary/80">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-xl lg:text-2xl leading-snug font-semibold tracking-tight text-zinc-900 dark:text-white">
                    Question
                  </h3>
                </div>
                <div className="flex-1 flex items-center">
                  <p className="text-lg lg:text-xl tracking-tight text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {node.content?.front}
                  </p>
                </div>
              </div>

              {/* Bottom hint */}
              <div className="relative z-10 mt-auto border-t border-slate-200 dark:border-zinc-800 pt-4">
                <div className="flex items-center justify-between rounded-lg p-2.5 bg-gradient-to-r from-slate-100 dark:from-zinc-800 to-slate-100 dark:to-zinc-800 border border-transparent">
                  <span className="text-base font-semibold text-zinc-900 dark:text-white">
                    Click to reveal answer
                  </span>
                  <ArrowRight className="text-primary h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Back of card */}
            <div
              className={`
                absolute inset-0 h-full w-full rounded-2xl p-5 overflow-hidden
                bg-gradient-to-br from-white via-slate-50 to-slate-100
                dark:from-zinc-900 dark:via-zinc-900/95 dark:to-zinc-800
                border border-slate-200 dark:border-zinc-800
                shadow-lg dark:shadow-xl
                flex flex-col
                transition-all duration-700
                ${!isFlipped ? "opacity-0" : "opacity-100"}
              `}
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              {/* Background gradient */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 dark:from-primary/10 via-transparent to-blue-500/5 dark:to-blue-500/10" />

              <div className="relative z-10 flex-1 flex flex-col">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-primary/90 to-primary/80">
                    <Code2 className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-xl lg:text-2xl leading-snug font-semibold tracking-tight text-zinc-900 dark:text-white">
                    Answer
                  </h3>
                </div>
                <div className="flex-1 flex items-center">
                  <p className="text-lg lg:text-xl tracking-tight text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {node.content?.back}
                  </p>
                </div>
              </div>

              <div className="relative z-10 mt-auto border-t border-slate-200 dark:border-zinc-800 pt-4">
                {node.status === "completed" ? (
                  <div className="flex items-center justify-center rounded-lg p-2.5 bg-success/10 border border-success/20">
                    <Check className="text-success h-4 w-4 mr-2" />
                    <span className="text-base font-semibold text-success">
                      Completed
                    </span>
                  </div>
                ) : onComplete ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onComplete();
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-lg p-2.5 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold text-base transition-all hover:scale-[1.02]"
                  >
                    Mark Complete
                    <Check className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="flex items-center justify-between rounded-lg p-2.5 bg-gradient-to-r from-slate-100 dark:from-zinc-800 to-slate-100 dark:to-zinc-800 border border-transparent">
                    <span className="text-base font-semibold text-zinc-900 dark:text-white">
                      Click to flip back
                    </span>
                    <ArrowRight className="text-primary h-5 w-5" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
