type LessonStatus = "pending" | "approved" | "rejected"

interface StatusBadgeProps {
  status: LessonStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants = {
    pending: {
      bg: "bg-warning-light",
      text: "text-warning-dark",
      dot: "bg-warning",
      label: "Pending",
    },
    approved: {
      bg: "bg-success-light",
      text: "text-success-dark",
      dot: "bg-success",
      label: "Approved",
    },
    rejected: {
      bg: "bg-destructive-light",
      text: "text-destructive-dark",
      dot: "bg-destructive",
      label: "Rejected",
    },
  }

  const variant = variants[status.toLowerCase() as LessonStatus] ?? variants.pending

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${variant.bg} ${variant.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${variant.dot}`} />
      {variant.label}
    </span>
  )
}
