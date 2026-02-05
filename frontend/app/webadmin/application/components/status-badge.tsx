type LessonStatus = "pending" | "approved" | "rejected"

interface StatusBadgeProps {
  status: LessonStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants = {
    pending: {
      bg: "bg-[var(--color-warning)]/15",
      text: "text-[var(--color-warning)]",
      dot: "bg-[var(--color-warning)]",
      label: "Pending",
    },
    approved: {
      bg: "bg-[var(--color-success)]/15",
      text: "text-[var(--color-success)]",
      dot: "bg-[var(--color-success)]",
      label: "Approved",
    },
    rejected: {
      bg: "bg-[var(--color-destructive)]/15",
      text: "text-[var(--color-destructive)]",
      dot: "bg-[var(--color-destructive)]",
      label: "Rejected",
    },
  }

  const variant = variants[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${variant.bg} ${variant.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${variant.dot}`} />
      {variant.label}
    </span>
  )
}
