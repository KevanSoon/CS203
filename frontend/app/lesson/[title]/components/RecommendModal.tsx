"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

interface Recommendation {
    lesson_id: number;
    lesson_title: string;
    tags: string[];
    content: string;
    completed?: boolean;
}

interface Props {
    recommendations: Recommendation[];
    onClose: () => void;
}

export default function RecommendModal({ recommendations, onClose }: Props) {
    const router = useRouter();

    const handleNavigate = (title: string) => {
        onClose();
        router.push(`/lesson/${encodeURIComponent(title)}`);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-2 justify-center">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">What to learn next</h2>
                </div>
                <p className="text-sm text-muted-foreground text-center mb-6">
                    Based on what you just completed
                </p>

                <div className="space-y-3 mb-6">
                    {recommendations.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No recommendations available right now.
                        </p>
                    ) : (
                        recommendations.map((rec) => (
                            <button
                                key={rec.lesson_id}
                                onClick={() => handleNavigate(rec.lesson_title)}
                                className="w-full text-left rounded-lg border p-4 hover:border-primary hover:bg-primary/5 transition-colors"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <p className="font-semibold text-sm">{rec.lesson_title}</p>
                                    {rec.completed && (
                                        <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                                            Completed
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="w-full text-sm px-4 py-2 rounded-md border hover:bg-muted/50 transition-colors"
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
