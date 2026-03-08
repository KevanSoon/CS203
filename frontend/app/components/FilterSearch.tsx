"use client";

import { useRef, useState } from "react";
import { Search, Tag, X, ChevronDown } from "lucide-react";

type Mode = "search" | "tag";

type TagFilterSearchProps = {
  query: string;
  setQuery: (v: string) => void;
  mode: Mode;
  setMode: (m: Mode) => void;
  selectedTags: string[];
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  clearAll: () => void;
};

const options: { value: Mode; label: string; icon: React.ReactNode }[] = [
  { value: "search", label: "Search", icon: <Search size={13} /> },
  { value: "tag",    label: "Tags",   icon: <Tag size={13} /> },
];

export default function TagFilterSearch({
  query,
  setQuery,
  mode,
  setMode,
  selectedTags,
  addTag,
  removeTag,
  clearAll,
}: TagFilterSearchProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.trim();
  const hasSelected = selectedTags.length > 0;
  const current = options.find((o) => o.value === mode)!;

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setQuery("");
    setDropdownOpen(false);
    inputRef.current?.focus();
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "tag" && trimmed) {
      addTag(trimmed);
      setQuery("");
    }
  };

  const placeholder =
    mode === "search"
      ? "Search lessons…"
      : "Add a tag…";

  return (
    <div className="w-full max-w-2xl">
      {/* Search bar */}
      <form
        onSubmit={onSubmit}
        className="relative flex items-center rounded-2xl border bg-card"
        style={{
          borderColor: "var(--color-border)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        {/* Mode dropdown */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setDropdownOpen((p) => !p)}
            className="flex items-center gap-1.5 pl-3 pr-2 py-2.5 text-xs font-bold border-r transition-colors"
            style={{
              color: "var(--color-foreground)",
              borderColor: "var(--color-border)",
            }}
          >
            <span style={{ color: "var(--color-primary)" }}>{current.icon}</span>
            {current.label}
            <ChevronDown
              size={12}
              className="transition-transform duration-200"
              style={{
                color: "var(--color-muted-foreground)",
                transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div
                className="absolute left-0 top-full mt-1.5 z-20 rounded-xl border overflow-hidden"
                style={{
                  backgroundColor: "var(--color-card)",
                  borderColor: "var(--color-border)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                  minWidth: "110px",
                }}
              >
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => switchMode(opt.value)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold transition-colors text-left"
                    style={{
                      backgroundColor: mode === opt.value ? "var(--color-primary)" : "transparent",
                      color: mode === opt.value ? "#fff" : "var(--color-foreground)",
                    }}
                    onMouseEnter={(e) => {
                      if (mode !== opt.value)
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                          "var(--color-background)";
                    }}
                    onMouseLeave={(e) => {
                      if (mode !== opt.value)
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                    }}
                  >
                    <span style={{ color: mode === opt.value ? "#fff" : "var(--color-primary)" }}>
                      {opt.icon}
                    </span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Text input */}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
          style={{ color: "var(--color-foreground)" }}
        />

        {/* Clear X */}
        {trimmed.length > 0 && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="shrink-0 mr-2 p-1.5 rounded-lg transition"
            style={{ color: "var(--color-muted-foreground)" }}
            aria-label="Clear input"
          >
            <X size={15} />
          </button>
        )}
      </form>

      {/* Selected tags — only shown when tags exist */}
      {hasSelected && (
        <div className="mt-3 flex items-start gap-3">
          <div className="flex-1 flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold animate-scaleIn"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "#fff",
                  boxShadow: "0 2px 6px rgba(165,166,246,0.35)",
                }}
              >
                <span className="max-w-[200px] truncate">{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="rounded-full transition-opacity hover:opacity-70"
                  aria-label={`Remove ${tag}`}
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={clearAll}
            className="text-sm font-semibold hover:underline shrink-0 pt-1"
            style={{ color: "var(--color-primary)" }}
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}