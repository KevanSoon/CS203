"use client";

import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/lesson/${encodeURIComponent(title)}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-card border border-border rounded-3xl overflow-hidden shadow-sm
                 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
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

          <span className="text-xs text-primary font-semibold mt-1 inline-block">
            Click to start learning →
          </span>
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
  );
}
