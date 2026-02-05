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
      color: "text-[var(--color-primary)]",
    },
    {
      label: "Pending Review",
      value: stats.pending,
      icon: Clock,
      color: "text-[var(--color-warning)]",
    },
    {
      label: "Approved",
      value: stats.approved,
      icon: CheckCircle2,
      color: "text-[var(--color-success)]",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      color: "text-[var(--color-destructive)]",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-[var(--color-border)] bg-white p-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--color-text-muted)]">{card.label}</p>
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </div>
          <p className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  )
}
