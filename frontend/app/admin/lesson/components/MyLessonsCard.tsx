import { BookOpen, Pencil, Trash2 } from "lucide-react";

const lessons = [
  {
    title: "Gen Alpha Slangs 101",
    tag: "gen-alpha",
    status: "published",
    desc: "Learn the most bussin slang from Gen Alpha",
    chapters: 4,
    completions: 156,
    created: "2024-01-15",
  },
  {
    title: "Gaming Lingo Basics",
    tag: "gaming",
    status: "published",
    desc: "Master the essential gaming terminology",
    chapters: 3,
    completions: 89,
    created: "2024-01-20",
  },
  {
    title: "TikTok Trends Decoded",
    tag: "tiktok",
    status: "draft",
    desc: "Understand viral TikTok phrases",
    chapters: 5,
    completions: 0,
    created: "2024-01-25",
  },
];

export const MyLessonsCard = () => {
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
                    <div className="flex flex-wrap items-center gap-1 mb-2">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                        {lesson.tag}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          lesson.status === "published"
                            ? "bg-primary text-card"
                            : "bg-border text-muted-foreground"
                        }`}
                      >
                        {lesson.status}
                      </span>
                    </div>
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
                <p className="text-sm text-muted-foreground mb-1">{lesson.desc}</p>
                <p className="text-xs text-muted-foreground">
                  {lesson.chapters} chapters · {lesson.completions} completions ·
                  Created: {lesson.created}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
