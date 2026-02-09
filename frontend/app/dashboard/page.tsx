"use client";

import LessonCard from "@/components/dashboard/LessonCard";

const lessons = [
  {
    image: "https://images.unsplash.com/photo-1526378722484-bd91ca387e72",
    title: "Intro to Brainrot",
    description: "Why skibidi exists. Lore included.",
    progress: 100,
  },
  {
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    title: "Sigma Behaviour 101",
    description: "Silent confidence arc.",
    progress: 60,
  },
  {
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    title: "Rizz Mechanics",
    description: "NPC dialogue unlocked.",
    progress: 25,
  },
];

export default function DashboardPage() {
  return (
    <>
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-8">
          Your Lessons 📚
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson, i) => (
            <LessonCard key={i} {...lesson} />
          ))}
        </div>
      </main>
    </>
  );
}