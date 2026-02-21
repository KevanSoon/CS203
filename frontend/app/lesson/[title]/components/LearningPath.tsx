"use client";

import Lottie from "lottie-react";
import shibaAnimation from "@/public/shiba.json";
import catAnimation from "@/public/cat.json";
import pandaAnimation from "@/public/panda.json";
import { Star, Crown, Lock, Check } from "lucide-react";

const chapterMascots = [shibaAnimation, catAnimation, pandaAnimation];

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
  chapterIndex?: number;
}

// Generate S-curve positions for nodes
function getNodePositions(count: number) {
  const positions: { x: number; y: number }[] = [];
  const verticalSpacing = 200;
  const amplitude = 100;
  const nodesPerCurve = 3;

  for (let i = 0; i < count; i++) {
    const curveIndex = Math.floor(i / nodesPerCurve);
    const posInCurve = i % nodesPerCurve;
    const goingRight = curveIndex % 2 === 0;

    const t = posInCurve / (nodesPerCurve - 1 || 1);

    let x: number;
    if (goingRight) {
      x = -amplitude + t * 2 * amplitude;
    } else {
      x = amplitude - t * 2 * amplitude;
    }

    positions.push({ x, y: i * verticalSpacing });
  }

  return positions;
}

// Generate smooth SVG path through node positions
function generateSmoothPath(positions: { x: number; y: number }[]): string {
  if (positions.length < 2) return "";

  const centerX = 200;
  let path = `M ${centerX + positions[0].x} ${positions[0].y + 40}`;

  for (let i = 1; i < positions.length; i++) {
    const prev = positions[i - 1];
    const curr = positions[i];
    const midY = (prev.y + curr.y) / 2;

    path += ` C ${centerX + prev.x} ${midY + 40}, ${centerX + curr.x} ${midY + 40}, ${centerX + curr.x} ${curr.y + 40}`;
  }

  return path;
}

export const LearningPath = ({ nodes, onNodeClick, chapterIndex = 0 }: LearningPathProps) => {
  const positions = getNodePositions(nodes.length);
  const totalHeight =
    positions.length > 0 ? positions[positions.length - 1].y + 160 : 400;
  // Place mascot near the 3rd node (index 2), or last node if fewer than 3
  const mascotNodeIndex = Math.min(2, positions.length - 1);
  const mascotPos = positions[mascotNodeIndex];
  const mascotData = chapterMascots[chapterIndex % chapterMascots.length];

  return (
    <div className="relative py-8" style={{ height: totalHeight }}>
      {/* SVG Path Background */}
      <svg
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] pointer-events-none"
        style={{ zIndex: 0, height: totalHeight }}
      >
        <path
          d={generateSmoothPath(positions)}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray="8 8"
          className="text-border"
          opacity="0.3"
        />
      </svg>

      {/* Standalone mascot positioned near the 3rd node */}
      {mascotPos && (
        <div
          className="absolute left-1/2 pointer-events-none"
          style={{
            transform: `translateX(calc(-50% + ${mascotPos.x - 160}px))`,
            top: mascotPos.y - 20,
            zIndex: 3,
          }}
        >
          <Lottie
            animationData={mascotData}
            loop
            className="w-35 h-35 lg:w-40 lg:h-40"
          />
        </div>
      )}

      {/* Nodes positioned along the S-curve */}
      {nodes.map((node, index) => {
        const pos = positions[index];
        const isActive = node.status === "available";

        return (
          <div
            key={`${node.type}-${node.id}`}
            className="absolute left-1/2"
            style={{
              transform: `translateX(calc(-50% + ${pos.x}px))`,
              top: pos.y,
              zIndex: isActive ? 2 : 1,
            }}
          >
            <PathNode
              node={node}
              onClick={() => onNodeClick(node)}
            />
          </div>
        );
      })}
    </div>
  );
};

interface PathNodeProps {
  node: Node;
  onClick: () => void;
}

const PathNode = ({ node, onClick }: PathNodeProps) => {
  const isQuiz = node.type === "quiz";
  const isLocked = node.status === "locked";
  const isCompleted = node.status === "completed";
  const isAvailable = node.status === "available";

  const label = isQuiz ? "Quiz" : node.content?.front || "";

  return (
    <div className="relative flex flex-col items-center">
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
              ? "bg-success shadow-[0_8px_0_0_var(--color-success-shadow)] active:translate-y-0 active:shadow-none"
              : isAvailable
              ? "bg-primary shadow-[0_8px_0_0_var(--color-primary-dark)] active:translate-y-0 active:shadow-none animate-pulse"
              : "bg-card shadow-[0_8px_0_0_var(--color-locked-shadow)]"
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
                : "text-white"
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

        {/* Highlight effect on hover */}
        {!isLocked && (
          <div className="absolute top-1/2 left-[-100%] w-16 h-24 bg-white/50 -translate-y-1/2 rotate-12 transition-all duration-500 ease-in-out group-hover:left-[200%]" />
        )}

        {/* Pulsing ring for available nodes */}
        {isAvailable && (
          <span className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-20" />
        )}
      </button>

      {/* Label below node */}
      <div className="mt-3 max-w-[140px] text-center">
        <span
          className={`text-xs font-bold leading-tight ${
            isLocked ? "text-muted-foreground" : "text-foreground"
          }`}
        >
          {label}
        </span>
      </div>
    </div>
  );
};
