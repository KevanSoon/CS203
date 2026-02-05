"use client"

type LessonStatus = "pending" | "approved" | "rejected"

type FilterValue = "all" | LessonStatus

interface FilterTabsProps {
  activeFilter: FilterValue
  onFilterChange: (filter: FilterValue) => void
  counts: {
    all: number
    pending: number
    approved: number
    rejected: number
  }
}

export function FilterTabs({
  activeFilter,
  onFilterChange,
  counts,
}: FilterTabsProps) {
  const tabs: { value: FilterValue; label: string; activeColor: string }[] = [
    { value: "all", label: "All", activeColor: "bg-accent" },
    { value: "pending", label: "Pending", activeColor: "bg-warning" },
    { value: "approved", label: "Approved", activeColor: "bg-success" },
    { value: "rejected", label: "Rejected", activeColor: "bg-destructive" },
  ]

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onFilterChange(tab.value)}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            activeFilter === tab.value
              ? `${tab.activeColor} text-white`
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab.label}
          <span
            className={`rounded-full px-1.5 py-0.5 text-xs ${
              activeFilter === tab.value
                ? "bg-white/20 text-white"
                : "bg-transparent text-muted-foreground"
            }`}
          >
            {counts[tab.value]}
          </span>
        </button>
      ))}
    </div>
  )
}
