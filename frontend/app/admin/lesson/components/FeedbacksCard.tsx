import { MessageSquare, AlertTriangle } from "lucide-react";

const feedbackItems = [
  {
    type: "feedback",
    username: "SkibidiStudent",
    avatar: "S",
    avatarBg: "bg-amber-600",
    lesson: "Gen Alpha Slangs 101",
    message: "Great lesson! But the 'Ohio' definition seems outdated.",
    time: "10m ago",
  },
  {
    type: "alert",
    username: "RizzMaster",
    avatar: "R",
    avatarBg: "bg-blue-600",
    lesson: "Gen Alpha Slangs 101",
    message:
      "AI slop detected in Chapter 2 flashcards - content seems auto-generated",
    time: "1h ago",
  },
  {
    type: "feedback",
    username: "GamerPro99",
    avatar: "G",
    avatarBg: "bg-red-500",
    lesson: "Gaming Lingo Basics",
    message: "Could you add more FPS terminology?",
    time: "3h ago",
  },
  {
    type: "alert",
    username: "OhioVibes",
    avatar: "O",
    avatarBg: "bg-gray-500",
    lesson: "Gen Alpha Slangs 101",
    message: "Quiz answers in Chapter 4 seem AI-generated and inaccurate",
    time: "5h ago",
  },
];

export const FeedbacksCard = () => {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <MessageSquare className="h-5 w-5 text-foreground" />
        <h3 className="text-lg font-semibold text-foreground">
          Recent Feedback & Alerts
        </h3>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        User feedback and AI slop alerts on your lessons
      </p>
      <div className="space-y-4">
        {feedbackItems.map((item, i) => (
          <div
            key={i}
            className={`p-4 rounded-lg border transition-colors cursor-pointer ${
              item.type === "alert"
                ? "border-orange-500/50 hover:bg-orange-500/5"
                : "border-border hover:bg-border/50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-full ${item.avatarBg} flex items-center justify-center text-white font-medium text-sm shrink-0`}
              >
                {item.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${
                      item.type === "alert"
                        ? "bg-orange-500/20 text-orange-500"
                        : "bg-primary/20 text-primary"
                    }`}
                  >
                    {item.type === "alert" ? (
                      <>
                        <AlertTriangle className="h-3 w-3" />
                        AI Slop Alert
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-3 w-3" />
                        Feedback
                      </>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    on {item.lesson}
                  </span>
                </div>
                <p className="text-sm text-foreground">
                  <span className="font-semibold">{item.username}:</span>{" "}
                  {item.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
