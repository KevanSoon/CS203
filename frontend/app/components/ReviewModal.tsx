"use client";

import { useState } from "react";
import { api } from "@/app/api/api";
import { Star } from "lucide-react";
import { toast } from "react-hot-toast";
import Lottie from "lottie-react";
import confettiAnimation from "@/public/Confetti.json";

interface Props {
    lessonId: number;
    onClose: () => void;
    onSubmitted: () => void;
}

export default function ReviewModal({ lessonId, onClose, onSubmitted }: Props) {
    const [rating, setRating] = useState<number>(0);
    const [hover, setHover] = useState<number>(0);
    const [feedback, setFeedback] = useState("");
    const [loading, setLoading] = useState(false);

    const submitReview = async () => {
        if (!rating) return;
        if (loading) return;
        try {
            setLoading(true);
            await api.post(`/api/lesson/${lessonId}/review`, {
                rating, feedback
            });
            onSubmitted();
            onClose();
            toast.success("Your review has been submitted!")
        } catch (err: any) {
            toast.error("Failed to submit review");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
            {/* Confetti overlay — plays once, non-interactive */}
            <Lottie
                animationData={confettiAnimation}
                loop={false}
                className="pointer-events-none absolute inset-0 w-full h-full"
                rendererSettings={{ preserveAspectRatio: "xMidYMid slice" }}
            />
            <div className="relative bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
                <h2 className="text-xl font-bold mb-4 text-center">🎉 Lesson completed !!! 🎉</h2>
                <p className="text-sm text-muted-foreground text-center mb-6">How was this lesson?</p>

                <div className="flex justify-center gap-2 mb-6">
                    {[1,2,3,4,5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                        >
                            <Star 
                                className={`h-8 w-8 transition ${
                                    (hover || rating) >= star
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                }`}
                            />
                        </button>
                    ))}
                </div>

                <textarea 
                    placeholder="optional only" 
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full border rounded-md p-3 text-sm resize-none mb-6"
                    rows={4}
                ></textarea>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="text-sm px-4 py-2 rounded-md border">Skip</button>
                    <button 
                        disabled={!rating || loading}
                        onClick={submitReview}
                        className="text-sm px-4 py-2 rounded-md bg-primary text-white disabled:opacity-50"
                    >
                        {loading ? "Submitting..." : "Submit"}
                    </button>
                </div>
            </div>
        </div>
    )
}