type LessonStatus = "pending" | "approved" | "rejected"

interface StatusBadgeProps {
  status: LessonStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants = {
    pending: {
      bg: "bg-warning-background",
      text: "text-warning-foreground",
      dot: "bg-warning",
      label: "Pending",
    },
    approved: {
      bg: "bg-success-background",
      text: "text-success-foreground",
      dot: "bg-success",
      label: "Approved",
    },
    rejected: {
      bg: "bg-destructive-background",
      text: "text-destructive-foreground",
      dot: "bg-destructive",
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
