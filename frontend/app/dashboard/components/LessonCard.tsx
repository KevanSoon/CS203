"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { getVisibleTags } from "@/app/utils/tags";

type LessonCardProps = {
  image: string;
  title: string;
  description: string;
  progress: number;
  rating: number;
  tags?: string[];
};

export default function LessonCard({
  image,
  title,
  description,
  progress,
  rating,
  tags = [],
}: LessonCardProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const handleCardClick = () => {
    router.push(`/lesson/${encodeURIComponent(title)}`);
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };

    if (showModal) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showModal]);

  function getRatingStars() {
    const safeRating = Math.max(0, Math.min(5, Math.round(rating)));
    return "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
  }

  return (
    <>
      <div
        onClick={handleCardClick}
        className="
          group bg-card border border-border rounded-2xl overflow-hidden
          shadow-sm transition-all duration-300 cursor-pointer
          md:hover:shadow-xl md:hover:-translate-y-1
        "
      >
        <div className="overflow-hidden">
          <img
            src={image}
            alt={title}
            className="
              w-full object-cover
              h-32 sm:h-40
              transition-transform duration-500
              md:group-hover:scale-105
            "
          />
        </div>

        <div className="p-3 sm:p-4 space-y-3 flex flex-col">
          <div>
            <h3 className="text-sm sm:text-base font-bold leading-snug line-clamp-2">
              {title}
            </h3>

            <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
              {description}
            </p>

            {description.length > 200 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openModal();
                }}
                className="
                  mt-1 text-xs sm:text-sm text-primary font-semibold
                  hover:underline cursor-pointer
                "
              >
                See full description
              </button>
            )}
          </div>

          {tags.length > 0 &&
            (() => {
              const { visible, remaining } = getVisibleTags(tags);
              return (
                <div className="flex flex-wrap gap-1 mt-2 overflow-hidden max-h-[72px]">
                  {visible.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary font-semibold whitespace-nowrap border border-primary/20"
                    >
                      {tag}
                    </span>
                  ))}
                  {remaining > 0 && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">
                      +{remaining}
                    </span>
                  )}
                </div>
              );
            })()}

          <div className="space-y-2 mt-auto">
            <div className="flex justify-between text-[11px] sm:text-xs font-semibold text-muted-foreground">
              <span>Completion</span>
              <span>{progress}%</span>
            </div>

            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="text-[11px] sm:text-xs text-muted-foreground">
              Rating: <span className="text-yellow-500">{getRatingStars()}</span>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="
            fixed inset-0 z-50 bg-black/40 backdrop-blur-sm
            flex items-end sm:items-center justify-center
          "
          onClick={closeModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="
              bg-card w-full sm:max-w-md
              rounded-t-2xl sm:rounded-2xl
              p-5 sm:p-6 shadow-xl
              animate-scaleIn relative
            "
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-3 right-3 p-2 rounded-md hover:bg-muted"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg sm:text-xl font-bold mb-3">{title}</h3>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      )}
    </>
  );
}