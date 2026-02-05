import { CartoonButton } from "@/components/CartoonButton";
import { StatsGrid } from "./StatsGrid";
import { MyLessonsCard } from "./MyLessonsCard";
import { FeedbacksCard } from "./FeedbacksCard";

export interface LessonContentProps {
  selected: string;
}

export const LessonContent = ({ selected }: LessonContentProps) => {
  return (
    <div className="flex-1 bg-background p-6 overflow-auto">
      {/* Header */}
      <div className="flex flex-col items-start gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Lesson Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize your lessons
          </p>
        </div>
        <CartoonButton label="+ Create Lesson" />
      </div>

      <StatsGrid />

      {/* Content Grid */}
      <div>
        {selected === "My Lessons" ? (
          <MyLessonsCard />
        ) : selected === "Feedbacks and Alerts" ? (
          <FeedbacksCard />
        ) : null}
      </div>
    </div>
  );
};
