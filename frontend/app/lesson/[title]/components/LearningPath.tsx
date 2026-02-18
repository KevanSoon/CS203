"use client";

import { Star, Crown, Lock, Check, Circle } from "lucide-react";

interface Node {
  id: number;
  type: "lesson" | "quiz";
  status: "locked" | "available" | "completed";
  content?: {
    front: string;
    back: string;
  };
}

interface LearningPathProps {
  nodes: Node[];
  onNodeClick: (node: Node) => void;
}

export const LearningPath = ({ nodes, onNodeClick }: LearningPathProps) => {
  return (
    <div className="relative py-8">
      {/* SVG Path Background */}
      <svg
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-full pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <path
          d={generateSVGPath(nodes.length)}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray="8 8"
          className="text-border"
          opacity="0.3"
        />
      </svg>

      {/* Nodes */}
      <div className="relative flex flex-col items-center gap-4" style={{ zIndex: 1 }}>
        {nodes.map((node, index) => (
          <PathNode
            key={node.id}
            node={node}
            index={index}
            onClick={() => onNodeClick(node)}
          />
        ))}
      </div>
    </div>
  );
};

interface PathNodeProps {
  node: Node;
  index: number;
  onClick: () => void;
}

const PathNode = ({ node, index, onClick }: PathNodeProps) => {
  const isQuiz = node.type === "quiz";
  const isLocked = node.status === "locked";
  const isCompleted = node.status === "completed";
  const isAvailable = node.status === "available";

  // Alternate left and right positioning
  const position = index % 2 === 0 ? "translate-x-[-40px]" : "translate-x-[40px]";

  return (
    <div className={`relative ${position} transition-transform`}>
      <button
        onClick={onClick}
        disabled={isLocked}
        className={`
          relative group overflow-hidden
          w-20 h-19 rounded-full
          flex items-center justify-center
          transition-all duration-150
          -translate-y-2
          ${
            isLocked
              ? "bg-muted cursor-not-allowed opacity-50 translate-y-0 shadow-none"
              : isCompleted
              ? "bg-success shadow-[0_8px_0_0_#15803d] active:translate-y-0 active:shadow-none"
              : isAvailable
              ? "bg-primary shadow-[0_8px_0_0_#7c7dc9] active:translate-y-0 active:shadow-none animate-pulse"
              : "bg-card shadow-[0_8px_0_0_#c4bfaf]"
          }
        `}
      >
        {/* Icon */}
        {isQuiz ? (
          <Crown
            size={32}
            fill="currentColor"
            className={`relative z-10 ${
              isLocked
                ? "text-muted-foreground"
                : isCompleted
                ? "text-white"
                : "text-warning"
            }`}
          />
        ) : isCompleted ? (
          <Check size={32} strokeWidth={3} className="text-white relative z-10" />
        ) : isLocked ? (
          <Lock size={28} className="text-muted-foreground relative z-10" />
        ) : (
          <Star
            size={32}
            fill="currentColor"
            className={`relative z-10 ${isAvailable ? "text-white" : "text-muted-foreground"}`}
          />
        )}

        {/* Highlight effect on hover (like CartoonButton) */}
        {!isLocked && (
          <div className="absolute top-1/2 left-[-100%] w-16 h-24 bg-white/50 -translate-y-1/2 rotate-12 transition-all duration-500 ease-in-out group-hover:left-[200%]" />
        )}

        {/* Pulsing ring for available nodes */}
        {isAvailable && (
          <span className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-20" />
        )}
      </button>

      {/* Label */}
      <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span
          className={`text-xs font-bold ${
            isLocked ? "text-muted-foreground" : "text-foreground"
          }`}
        >
          {isQuiz ? "Quiz" : `Lesson ${index + 1}`}
        </span>
      </div>
    </div>
  );
};

// Generate a wavy SVG path for the nodes
function generateSVGPath(nodeCount: number): string {
  const spacing = 100; // Reduced spacing between nodes
  const amplitude = 40; // How far left/right the wave goes
  const frequency = 1; // Wave frequency

  let path = `M 250 40`; // Start point (center)

  for (let i = 1; i < nodeCount; i++) {
    const y = i * spacing;
    const x = 250 + Math.sin(i * frequency) * amplitude;
    path += ` Q ${x} ${y - spacing / 2}, ${x} ${y}`;
  }

  return path;
}
