"use client";

import { useState, useEffect } from "react";
import { X, RotateCw, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

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
}

export const FlippableCard = ({ node, onClose }: FlippableCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // If it's a quiz, navigate to quiz page
  if (node.type === "quiz") {
    return (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn px-4"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-card rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-scaleIn border-4 border-warning"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition"
          >
            <X size={24} />
          </button>

          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-warning/20 rounded-full flex items-center justify-center">
              <span className="text-4xl">🏆</span>
            </div>

            <h3 className="text-2xl font-bold mb-3 text-foreground">
              Chapter Quiz
            </h3>

            <p className="text-muted-foreground mb-8">
              Test your knowledge and complete this chapter!
            </p>

            <button
              onClick={() => {
                // Navigate to quiz page - you can implement this
                alert("Quiz page coming soon!");
                onClose();
              }}
              className="w-full bg-warning hover:bg-warning-dark text-white font-bold py-4 px-6 rounded-2xl transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Start Quiz
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Regular lesson card
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg"
        style={{ perspective: "1000px" }}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-200 transition z-50"
        >
          <X size={32} />
        </button>

        <div
          className={`relative w-full transition-transform duration-500 cursor-pointer`}
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front of card */}
          <div
            className="absolute w-full bg-card rounded-3xl p-8 shadow-2xl border-4 border-primary"
            style={{
              backfaceVisibility: "hidden",
              minHeight: "300px",
            }}
          >
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 mb-6 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">❓</span>
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-4">
                {node.content?.front}
              </h3>

              <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
                <RotateCw size={16} />
                <span>Click to reveal answer</span>
              </div>
            </div>
          </div>

          {/* Back of card */}
          <div
            className="absolute w-full bg-card rounded-3xl p-8 shadow-2xl border-4 border-success"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              minHeight: "300px",
            }}
          >
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 mb-6 bg-success/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">✅</span>
              </div>

              <p className="text-lg text-foreground leading-relaxed">
                {node.content?.back}
              </p>

              <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
                <RotateCw size={16} />
                <span>Click to flip back</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
