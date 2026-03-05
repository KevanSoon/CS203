"use client";

import { Search, X } from "lucide-react";

type TagFilterSearchProps = {
  query: string;
  setQuery: (v: string) => void;

  selectedTags: string[];
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  clearAll: () => void;
};

export default function TagFilterSearch({
  query,
  setQuery,
  selectedTags,
  addTag,
  removeTag,
  clearAll,
}: TagFilterSearchProps) {
  const trimmed = query.trim();
  const hasSelected = selectedTags.length > 0;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;
    addTag(trimmed);
    setQuery("");
  };

  return (
    <div className="w-full max-w-2xl">
      {/* Search input */}
      <form onSubmit={onSubmit} className="relative">
        {/* left icon */}
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="
            w-full rounded-2xl border border-border bg-card
            pl-10 pr-12 py-2 text-sm outline-none
            focus:ring-2 focus:ring-primary/30
          "
        />

        {/* right clear x */}
        {query.trim().length > 0 && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="
              absolute right-2 top-1/2 -translate-y-1/2
              p-2 rounded-xl hover:bg-muted transition
              text-muted-foreground
            "
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </form>

      {/* Selected tags row */}
      <div className="mt-3 flex items-start gap-3">
        <div className="text-sm text-muted-foreground pt-1 shrink-0">
          Selected Tags:
        </div>

        <div className="flex-1 flex flex-wrap gap-2">
          {selectedTags.length === 0 ? (
            <span className="text-sm text-muted-foreground pt-1">
              None
            </span>
          ) : (
            selectedTags.map((tag) => (
              <span
                key={tag}
                className="
                  inline-flex items-center gap-2
                  rounded-full px-3 py-1 text-sm font-semibold
                  bg-primary text-primary-foreground
                "
              >
                <span className="max-w-[220px] truncate">{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="p-1 rounded-full hover:bg-black/10 transition"
                  aria-label={`Remove ${tag}`}
                >
                  <X size={14} />
                </button>
              </span>
            ))
          )}
        </div>

        {hasSelected && (
          <button
            type="button"
            onClick={clearAll}
            className="text-sm text-primary font-semibold hover:underline shrink-0 pt-1"
          >
            Clear All
          </button>
        )}
      </div>

      {/* helper hint (optional) */}
      <p className="mt-2 text-xs text-muted-foreground">
        Tip: press <span className="font-semibold">Enter</span> to add the typed tag.
      </p>
    </div>
  );
}