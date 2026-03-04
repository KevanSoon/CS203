"use client";

type TagFilterSearchProps = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
};

export default function TagFilterSearch({
  value,
  onChange,
  onClear,
  placeholder = "Type a tag to filter…",
}: TagFilterSearchProps) {
  const showClear = value.trim().length > 0;

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="
            w-full rounded-xl border border-border bg-card
            px-4 py-2 text-sm outline-none
            focus:ring-2 focus:ring-primary/30
          "
        />
      </div>
    </div>
  );
}