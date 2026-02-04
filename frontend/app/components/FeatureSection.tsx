"use client";

import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

import TranslateAnimation from "../../public/Translate.json";
import CommunityAnimation from "../../public/Community.json";
import TrophyAnimation from "../../public/Trophy.json";
import RobotAnimation from "../../public/Robot.json";

interface Feature {
  title: string;
  description: string;
  animation: object;
  reverse?: boolean;
}

const features: Feature[] = [
  {
    title: 'The "Singlish Bridge" Translator',
    description:
      'Confused by "Skibidi"? We don\'t just give you the English definition; we translate it into Singlish terms you actually understand. It\'s the fastest way to go from blur sotong to steady pom pi pi.',
    animation: TranslateAnimation,
  },
  {
    title: "Community-Verified Lessons",
    description:
      'No fake news here. Our lessons are created and voted on by the community. The "Lesson Admin" system ensures that the definitions of "Gyatt" or "Fanum Tax" are accurate and agreed upon by the masses, not just hallucinated by a bot.',
    animation: CommunityAnimation,
    reverse: true,
  },
  {
    title: "Gamified Progress Tracker",
    description:
      'Treat learning like a game. Track your "Slang Proficiency" level, unlock badges, and challenge your friends to see who is the most "woke" uncle or auntie. Climb the leaderboard and prove you\'ve got the lobang on the latest trends.',
    animation: TrophyAnimation,
  },
  {
    title: "AI Learning Assistant",
    description:
      "Too shy to ask a real person? Our built-in AI assistant is here 24/7 to clarify lesson content and answer your burning questions without judgment. It's like having a private tutor in your pocket.",
    animation: RobotAnimation,
    reverse: true,
  },
];

const FeatureCard = ({ title, description, animation, reverse }: Feature) => {
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
          className="w-64 h-64 md:w-80 md:h-80"
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
