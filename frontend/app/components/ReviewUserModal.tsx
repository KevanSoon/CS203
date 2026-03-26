"use client";

import { useEffect, useState } from "react";
import { Star, X } from "lucide-react";
import toast from "react-hot-toast";

type UserReview = {
  rating: number;
  feedback: string;
  createdAt?: string;
};

type Props = {
  lessonId: number;
  onClose: () => void;
};

export default function ReviewUserModal({ lessonId, onClose }: Props) {
  const [review, setReview] = useState<UserReview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserReview = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/lesson/${lessonId}/review`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error("Failed to fetch review");
        }

        setReview(data?.review?.review || null);
      } catch (err) {
        toast.error("Failed to load your review.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserReview();
  }, [lessonId]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating
            ? "fill-yellow-400 text-yellow-400"
            : "text-slate-300"
        }`}
      />
    ));
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">
            Your Review
          </h2>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          {loading && (
            <div className="h-[120px] rounded-xl bg-muted animate-pulse" />
          )}

          {!loading && !review && (
            <div className="text-center py-10">
              <p className="text-sm text-muted-foreground">
                You have not submitted a review yet.
              </p>
            </div>
          )}

          {!loading && review && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="flex">{renderStars(review.rating)}</div>
                <span className="text-sm font-semibold text-foreground">
                  {review.rating}/5
                </span>
              </div>

              <div className="rounded-xl border border-border bg-background p-3">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {review.feedback?.trim() || (
                    <span className="italic text-muted-foreground">
                      No feedback provided.
                    </span>
                  )}
                </p>
              </div>

              {review.createdAt && (
                <p className="text-xs text-muted-foreground">
                  Submitted on{" "}
                  {new Date(review.createdAt).toLocaleDateString(
                    undefined,
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  )}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}