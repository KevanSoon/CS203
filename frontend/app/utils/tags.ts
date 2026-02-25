/**
 * Parses a raw tags value (array, comma-separated string, or null/undefined)
 * into a clean string array.
 */
export function parseTags(raw: string[] | string | null | undefined): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.filter(Boolean)
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

/**
 * Returns the visible tags and a remaining count, capped by both a max
 * character total (so long tags don't overflow) and an absolute max count.
 *
 * Rules:
 *  - Always shows at least 1 tag even if it exceeds maxChars.
 *  - Stops adding tags once the cumulative character length would exceed maxChars.
 *  - Never shows more than maxCount tags regardless of length.
 */
export function getVisibleTags(
  tags: string[],
  maxChars = 60,
  maxCount = 5
): { visible: string[]; remaining: number } {
  let total = 0
  let cutIndex = 0

  for (let i = 0; i < Math.min(tags.length, maxCount); i++) {
    total += tags[i].length
    // Always include at least the first tag
    if (total > maxChars && i > 0) break
    cutIndex = i + 1
  }

  return {
    visible: tags.slice(0, cutIndex),
    remaining: tags.length - cutIndex,
  }
}
