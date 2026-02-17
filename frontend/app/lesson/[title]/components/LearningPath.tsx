"use client";

import { Star, Trophy, Lock, CheckCircle2, Circle } from "lucide-react";

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
      <div className="relative flex flex-col items-center gap-8" style={{ zIndex: 1 }}>
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
          relative group
          w-20 h-20 rounded-full
          flex items-center justify-center
          border-4 transition-all duration-300
          ${
            isLocked
              ? "bg-muted border-border cursor-not-allowed opacity-60"
              : isCompleted
              ? "bg-success border-success-dark shadow-lg shadow-success/30 hover:scale-110"
              : isAvailable
              ? "bg-primary border-primary/50 shadow-xl shadow-primary/40 hover:scale-110 animate-pulse"
              : "bg-card border-border"
          }
        `}
      >
        {/* Icon */}
        {isQuiz ? (
          <Trophy
            size={32}
            className={`${
              isLocked
                ? "text-muted-foreground"
                : isCompleted
                ? "text-white"
                : "text-warning"
            }`}
          />
        ) : isCompleted ? (
          <CheckCircle2 size={32} className="text-white" />
        ) : isLocked ? (
          <Lock size={28} className="text-muted-foreground" />
        ) : (
          <Star
            size={32}
            className={`${isAvailable ? "text-white" : "text-muted-foreground"}`}
          />
        )}

        {/* Pulsing ring for available nodes */}
        {isAvailable && (
          <span className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-20" />
        )}
      </button>

      {/* Label */}
      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
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
  const height = nodeCount * 120; // Spacing between nodes
  const amplitude = 40; // How far left/right the wave goes
  const frequency = 1; // Wave frequency

  let path = `M 250 40`; // Start point (center)

  for (let i = 1; i < nodeCount; i++) {
    const y = i * 120;
    const x = 250 + Math.sin(i * frequency) * amplitude;
    path += ` Q ${x} ${y - 60}, ${x} ${y}`;
  }

  return path;
}
