"use client";

import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

import TranslateAnimation from "../../public/Translate.json";
import CommunityAnimation from "../../public/Community.json";
import TrophyAnimation from "../../public/Trophy.json";
import LessonAnimation from "../../public/Lesson.json";

interface Feature {
  title: string;
  description: string;
  animation: object;
  reverse?: boolean;
  animationClassName?: string;
}

const features: Feature[] = [
  {
    title: "AI Tutor That Speaks Singlish",
    description:
      'Our AI assistant doesn\'t just explain slang in textbook English — ask it about "Skibidi" and it\'ll break it down in Singlish lah. Powered by your actual lesson content, it remembers your past conversations and recommends lessons based on what you ask. No more blur blur.',
    animation: TranslateAnimation,
  },
  {
    title: "Lessons You Can Actually Trust",
    description:
      'Every lesson goes through a three-layer trust pipeline: created by vetted Lesson Admins, approved by a Root moderator, and cross-checked by AI that scans real news sources to filter out "AI slop." No hallucinated definitions, no made-up slang.',
    animation: LessonAnimation,
    reverse: true,
    animationClassName: "w-80 h-80 md:w-[28rem] md:h-[28rem]",
  },
  {
    title: "Structured Learning That Actually Sticks",
    description:
      "Each lesson is broken into chapters, flashcards, and chapter quizzes so the slang actually sinks in. Build a daily streak, track your card and chapter completions, then compete with friends on the leaderboard to see who's the most woke uncle or auntie.",
    animation: TrophyAnimation,
  },
  {
    title: "A Community With Roles, Not Just Users",
    description:
      "Start as a learner, rate lessons, and leave reviews. Prove yourself and apply to become a Lesson Admin — create your own slang lessons and contribute to Singapore's growing Gen Alpha dictionary. Got the lobang? Share it.",
    animation: CommunityAnimation,
    reverse: true,
  },
];

const FeatureCard = ({ title, description, animation, reverse, animationClassName }: Feature) => {
  return (
    <div
      className={`grid md:grid-cols-2 gap-12 items-center py-16 ${
        reverse ? "md:[direction:rtl]" : ""
      }`}
    >
      <div className="flex justify-center md:[direction:ltr]">
        <Lottie
          animationData={animation}
          loop
          className={animationClassName ?? "w-64 h-64 md:w-80 md:h-80"}
        />
      </div>
      <div className="space-y-4 md:[direction:ltr]">
        <h3 className="text-3xl font-bold text-foreground">{title}</h3>
        <p className="text-lg text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

const FeatureSection = () => {
  return (
    <section className="max-w-6xl mx-auto px-4">
      {features.map((feature, index) => (
        <FeatureCard key={index} {...feature} />
      ))}
    </section>
  );
};

export default FeatureSection;
