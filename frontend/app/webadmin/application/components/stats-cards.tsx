import { BookOpen, Clock, CheckCircle2, XCircle } from "lucide-react"

interface LessonStats {
  total: number
  pending: number
  approved: number
  rejected: number
}

interface StatsCardsProps {
  stats: LessonStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: "Total Lessons",
      value: stats.total,
      icon: BookOpen,
      color: "text-accent",
    },
    {
      label: "Pending Review",
      value: stats.pending,
      icon: Clock,
      color: "text-warning",
    },
    {
      label: "Approved",
      value: stats.approved,
      icon: CheckCircle2,
      color: "text-success",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      color: "text-destructive",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-border bg-card p-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-md text-muted-foreground">{card.label}</p>
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </div>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  )
}
