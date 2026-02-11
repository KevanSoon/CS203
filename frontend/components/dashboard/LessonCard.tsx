"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

type LessonCardProps = {
  image: string;
  title: string;
  description: string; // truncated preview
  progress: number;
  rating: number;
};

export default function LessonCard({
  image,
  title,
  description,
  progress,
  rating,
}: LessonCardProps) {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };

    if (showModal) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showModal]);

  return (
    <>
      <div className="group bg-card border border-border rounded-3xl overflow-hidden shadow-sm 
                      hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

        <div className="overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-lg font-bold">{title}</h3>

            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {description}
            </p>

            <button
              onClick={openModal}
              className="text-xs text-primary font-semibold mt-1 hover:underline transition"
            >
              See full description
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground">
              <span>Completion</span>
              <span>{progress}%</span>
            </div>

            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-2 text-xs text-muted-foreground">
              Rating: {rating} ★
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
          onClick={closeModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-2xl p-6 max-w-md w-full shadow-xl relative animate-scaleIn"
          >
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
