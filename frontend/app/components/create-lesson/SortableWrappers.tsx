"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function translateOnly(
  transform: Parameters<typeof CSS.Transform.toString>[0],
) {
  if (!transform) return undefined;
  return CSS.Transform.toString({ ...transform, scaleX: 1, scaleY: 1 });
}

export function SortableCard({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: (
    dragHandleProps: React.HTMLAttributes<HTMLElement>,
    isDragging: boolean,
  ) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, animateLayoutChanges: () => false });
  const style: React.CSSProperties = {
    transform: translateOnly(transform),
    transition: isDragging ? "none" : (transition ?? undefined),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
    position: "relative",
  };
  return (
    <div ref={setNodeRef} style={style} className={className}>
      {children({ ...attributes, ...listeners }, isDragging)}
    </div>
  );
}

export function SortableQuiz({
  id,
  children,
}: {
  id: string;
  children: (
    dragHandleProps: React.HTMLAttributes<HTMLElement>,
    isDragging: boolean,
  ) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({ id, animateLayoutChanges: () => false });
  const style: React.CSSProperties = {
    transform: translateOnly(transform),
    transition: "none",
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
    position: "relative",
  };
  return (
    <div ref={setNodeRef} style={style}>
      {children({ ...attributes, ...listeners }, isDragging)}
    </div>
  );
}

export function SortableChapter({
  id,
  children,
}: {
  id: string;
  children: (
    dragHandleProps: React.HTMLAttributes<HTMLElement>,
    isDragging: boolean,
  ) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({ id, animateLayoutChanges: () => false });
  const style: React.CSSProperties = {
    transform: translateOnly(transform),
    transition: "none",
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
    position: "relative",
  };
  return (
    <div ref={setNodeRef} style={style}>
      {children({ ...attributes, ...listeners }, isDragging)}
    </div>
  );
}
