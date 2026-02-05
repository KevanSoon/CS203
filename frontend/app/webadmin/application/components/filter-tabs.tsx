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
  const tabs: { value: FilterValue; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ]

  return (
    <div className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onFilterChange(tab.value)}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            activeFilter === tab.value
              ? "bg-[var(--color-primary)] text-[var(--color-background)]"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          {tab.label}
          <span
            className={`rounded-full px-1.5 py-0.5 text-xs ${
              activeFilter === tab.value
                ? "bg-[var(--color-background)]/20 text-[var(--color-background)]"
                : "bg-transparent text-[var(--color-text-muted)]"
            }`}
          >
            {counts[tab.value]}
          </span>
        </button>
      ))}
    </div>
  )
}
