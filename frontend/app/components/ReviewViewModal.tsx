"use client";

import { useEffect, useState } from "react";
import { X, Star } from "lucide-react";
import { api } from "@/app/api/api";
import { toast } from "react-hot-toast";

interface Review {
  rating: number;
  feedback: string;
  createdAt?: string;
}

interface ReviewViewModalProps {
  lessonId: number;
  onClose: () => void;
}

export default function ReviewViewModal({
  lessonId,
  onClose,
}: ReviewViewModalProps) {
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        setLoading(true);

        const { data } = await api.get(`/api/lesson/${lessonId}/review`);

        if (!data?.review) {
          toast.error("Failed to retrieve your review.");
          return;
        }

        setReview(data.review.review);
      } catch (err) {
        toast.error("Failed to load review.");
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [lessonId]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating
            ? "fill-yellow-400 text-yellow-400"
            : "text-muted-foreground"
        }`}
      />
    ));
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold text-foreground mb-4">
          Your Review
        </h2>

        {loading && (
          <p className="text-muted-foreground text-sm">
            Loading review...
          </p>
        )}

        {!loading && review && (
          <div className="space-y-5">

            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Rating
              </p>
              <div className="flex gap-1">
                {renderStars(review.rating)}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Feedback
              </p>
              <div className="rounded-md border border-border bg-background p-3 text-sm">
                {review.feedback || "No feedback provided."}
              </div>
            </div>

            {review.createdAt && (
              <p className="text-xs text-muted-foreground">
                Submitted on: {" "}
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}