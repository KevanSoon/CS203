import { BookOpen, Pencil, Trash2 } from "lucide-react";
import { Lesson } from "./LessonContent";

interface MyLessonsCardProps {
  lessons: Lesson[];
}

export const MyLessonsCard = ({ lessons }: MyLessonsCardProps) => {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">My Lessons</h3>
      </div>
      <div className="space-y-4">
        {lessons.map((lesson, i) => (
          <div
            key={i}
            className="p-4 rounded-lg border border-border hover:bg-border/50 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="hidden sm:block p-3 rounded-lg bg-primary/10 shrink-0">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground mb-1">
                      {lesson.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{lesson.description}</p>
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(lesson.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
