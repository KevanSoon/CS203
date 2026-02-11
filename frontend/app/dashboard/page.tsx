"use client";

import LessonCard from "@/components/dashboard/LessonCard";

const lessons = [
  {
    image: "https://images.unsplash.com/photo-1526378722484-bd91ca387e72",
    title: "Brainrot Origins 🧠💥",
    description: "How skibidi happened. Deep lore. No survivors.",
    progress: 100,
  },
  {
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    title: "Sigma Mode Activated 🐺",
    description: "Nonchalant. Unbothered. Mysterious arc loading.",
    progress: 60,
  },
  {
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    title: "Rizz Engineering 💬✨",
    description: "Dialogue tree expanded. NPCs now blush.",
    progress: 25,
  },
];

export default function DashboardPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-black mb-2">
        Your Daily Grind 🔥
      </h1>
      <p className="text-sm md:text-base text-muted-foreground mb-8">
        Lock in. Level up. Touch grass later.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson, i) => (
          <LessonCard key={i} {...lesson} />
        ))}
      </div>
    </main>
  );
}
