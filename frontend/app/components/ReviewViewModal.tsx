"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star, X } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { api } from "@/app/api/api"

type LessonReview = {
  id: number;
  userId: number;
  username: string;
  profilePictureUrl?: string | null;
  rating: number;
  feedback: string;
  createdAt?: string;
};

type ReviewsResponse = {
  reviews: LessonReview[];
};

type ViewReviewsModalProps = {
  lessonId: number;
  onClose: () => void;
};

export default function ViewReviewsModal({
  lessonId,
  onClose,
}: ViewReviewsModalProps) {
  const [reviews, setReviews] = useState<LessonReview[]>([]);
  const [allReviews, setAllReviews] = useState<LessonReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const sliderRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
          const res = await api.get(`/api/lesson/${lessonId}/reviews`);
          const all = res.data.reviews || [];
          const top5 = all
            .sort((a: any, b: any) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
            .slice(0, 5);
          setAllReviews(all);
          setReviews(top5);
        } finally {
          setLoading(false);
        }
      };

    fetchReviews();
  }, [lessonId]);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;

    const checkScroll = () => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };

    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [reviews]);

  const average = useMemo(() => {
    if (!allReviews.length) return 0;
    return allReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / allReviews.length;
  }, [allReviews]);

  const distribution = useMemo(() => {
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allReviews.forEach((r) => {
      const rounded = Math.round(r.rating);
      if (rounded >= 1 && rounded <= 5) dist[rounded]++;
    });
    return dist;
  }, [allReviews]);

  const renderStars = (rating: number, size: "sm" | "md" = "sm") => {
    const sz = size === "md" ? "h-5 w-5" : "h-4 w-4";
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`${sz} ${
          i < rating
            ? "fill-yellow-400 text-yellow-400"
            : "fill-transparent text-slate-300"
        }`}
      />
    ));
  };

  const scrollByCard = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    const cardWidth = sliderRef.current.firstElementChild
      ? (sliderRef.current.firstElementChild as HTMLElement).offsetWidth
      : 300;
    const gap = 12;
    sliderRef.current.scrollBy({
      left: direction === "right" ? cardWidth + gap : -(cardWidth + gap),
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    const handleScroll = () => {
      const cardWidth = el.firstElementChild
        ? (el.firstElementChild as HTMLElement).offsetWidth
        : 300;
      const gap = 12;
      const idx = Math.round(el.scrollLeft / (cardWidth + gap));
      setCurrentIndex(Math.max(0, Math.min(idx, reviews.length - 1)));
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [reviews]);

  useEffect(() => {
    const isMobile = window.innerWidth < 640;
    if (!isMobile) return;

    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  const getInitial = (username?: string) =>
    (username?.trim()?.[0] || "?").toUpperCase();

  const getAvatarColor = (username?: string) => {
    const colors = [
      "bg-violet-200 text-violet-800",
      "bg-blue-200 text-blue-800",
      "bg-emerald-200 text-emerald-800",
      "bg-rose-200 text-rose-800",
      "bg-amber-200 text-amber-800",
      "bg-indigo-200 text-indigo-800",
      "bg-pink-200 text-pink-800",
      "bg-teal-200 text-teal-800",
    ];
    const idx = (username?.charCodeAt(0) ?? 0) % colors.length;
    return colors[idx];
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-border">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              User Reviews
            </h2>
            {!loading && allReviews.length > 0 && (
              <p className="mt-1 text-sm text-muted-foreground">
                {average.toFixed(1)} average rating · {allReviews.length} review
                {allReviews.length !== 1 ? "s" : ""}
              </p>
            )}
            {loading && (
              <div className="mt-1 h-4 w-40 rounded bg-muted animate-pulse" />
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close reviews modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto">
          {/* Loading — mirrors the loaded layout exactly but without borders/dividers */}
          {loading && (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Summary skeleton */}
              <div className="flex-shrink-0 lg:w-48 flex flex-col items-center lg:items-start gap-3">
                <div className="h-14 w-20 rounded-lg bg-muted animate-pulse" />
                <div className="h-5 w-28 rounded bg-muted animate-pulse" />
                <div className="h-3 w-12 rounded bg-muted animate-pulse" />
                <div className="space-y-1.5 mt-1 w-full">
                  {[5, 4, 3, 2, 1].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-muted animate-pulse" />
                      <div className="w-3 h-3 rounded bg-muted animate-pulse" />
                      <div className="flex-1 h-2 rounded-full bg-muted animate-pulse" />
                      <div className="w-4 h-3 rounded bg-muted animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider (Hidden during loading to avoid ghost lines) */}
              <div className="hidden lg:block w-px bg-transparent self-stretch" />

              {/* Cards skeleton */}
              <div className="flex-1 flex gap-3 overflow-hidden">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="min-w-[300px] rounded-2xl bg-muted/30 p-4 flex flex-col gap-3 h-[220px]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-muted animate-pulse flex-shrink-0" />
                      <div className="flex flex-col gap-1.5 flex-1">
                        <div className="h-3.5 w-24 rounded bg-muted animate-pulse" />
                        <div className="h-3 w-16 rounded bg-muted animate-pulse" />
                      </div>
                    </div>
                    <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                    <div className="h-[90px] rounded-xl bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && allReviews.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                <Star className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-base font-semibold text-foreground">
                No reviews yet
              </p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Be the first to leave a review for this lesson.
              </p>
            </div>
          )}

          {/* Summary + Carousel */}
          {!loading && allReviews.length > 0 && (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Summary block */}
              <div className="flex-shrink-0 lg:w-48 flex flex-col items-center lg:items-start gap-3">
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-5xl font-extrabold text-foreground leading-none">
                    {average.toFixed(1)}
                  </span>
                  <div className="flex items-center gap-0.5 mt-1.5">
                    {renderStars(Math.round(average), "md")}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    out of 5
                  </span>
                </div>

                {/* Distribution bars */}
                <div className="w-full space-y-1 mt-1">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = distribution[star] ?? 0;
                    const pct = allReviews.length
                      ? Math.round((count / allReviews.length) * 100)
                      : 0;
                    return (
                      <div
                        key={star}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <span className="w-3 text-right font-medium">
                          {star}
                        </span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 rounded-full transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-6 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="hidden lg:block w-px bg-border self-stretch" />

              {/* Carousel section */}
              <div className="flex-1 min-w-0 flex flex-col gap-3">
                <div className="relative">
                  {canScrollLeft && (
                    <button
                      onClick={() => scrollByCard("left")}
                      className="hidden sm:flex absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-3 h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-md hover:bg-muted transition-colors"
                      aria-label="Previous reviews"
                      type="button"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  )}

                  <div
                    ref={sliderRef}
                    className="flex gap-3 overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                  >
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="min-w-[calc(100%)] max-w-[calc(100%)] sm:min-w-[300px] sm:max-w-[300px] snap-start rounded-2xl border border-border bg-background p-4 shadow-sm flex flex-col gap-3"
                      >
                        {/* User info */}
                        <div
                          className="flex items-center gap-3 cursor-pointer group/user"
                          onClick={() => { onClose(); router.push(`/profile/${review.userId}`); }}
                        >
                          {review.profilePictureUrl ? (
                            <Image
                              src={review.profilePictureUrl}
                              alt={review.username}
                              width={44}
                              height={44}
                              className="h-11 w-11 rounded-full object-cover border border-border flex-shrink-0"
                              unoptimized
                            />
                          ) : (
                            <div
                              className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold flex-shrink-0 border border-border ${getAvatarColor(
                                review.username
                              )}`}
                            >
                              {getInitial(review.username)}
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-foreground text-sm truncate group-hover/user:text-[#6C63FF] transition-colors">
                              {review.username}
                            </p>
                            {review.createdAt && (
                              <p className="text-xs text-muted-foreground mt-0.5">
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
                        </div>

                        {/* Star rating */}
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-0.5">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-xs font-bold text-foreground">
                            {review.rating}/5
                          </span>
                        </div>

                        {/* Feedback */}
                        <div className="rounded-xl border border-border bg-card p-3 flex-1 min-h-[90px]">
                          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words">
                            {review.feedback?.trim() || (
                              <span className="italic text-muted-foreground">
                                No feedback provided.
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {canScrollRight && (
                    <button
                      onClick={() => scrollByCard("right")}
                      className="hidden sm:flex absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-3 h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-md hover:bg-muted transition-colors"
                      aria-label="Next reviews"
                      type="button"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Mobile controls */}
                {(canScrollLeft || canScrollRight) && (
                  <div className="flex sm:hidden items-center justify-between mt-1">
                    <button
                      onClick={() => scrollByCard("left")}
                      disabled={!canScrollLeft}
                      className="h-9 w-9 flex items-center justify-center rounded-full border border-border bg-card shadow-sm disabled:opacity-30 hover:bg-muted transition-colors"
                      aria-label="Previous review"
                      type="button"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      {reviews.map((_, i) => (
                        <span
                          key={i}
                          className={`block rounded-full transition-all duration-300 ${
                            i === currentIndex
                              ? "w-4 h-2 bg-primary"
                              : "w-2 h-2 bg-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => scrollByCard("right")}
                      disabled={!canScrollRight}
                      className="h-9 w-9 flex items-center justify-center rounded-full border border-border bg-card shadow-sm disabled:opacity-30 hover:bg-muted transition-colors"
                      aria-label="Next review"
                      type="button"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}