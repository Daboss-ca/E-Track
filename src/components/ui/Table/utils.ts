/** Treats null, undefined, and empty string as "missing" — never `0` or `false`. */
export function isEmptyValue(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

/**
 * Truncates a string from the middle, preserving a meaningful tail such as a
 * file extension (`.pdf`), an email domain (`@gmail.com`), or the final
 * segment of a code (`BATCH-2026-XYZ0009A` -> `BATCH-2026-XY…09A`). Falls
 * back to keeping the last few characters when no such tail is detected.
 */
export function middleTruncate(input: string, maxLength = 20): string {
  if (!input || input.length <= maxLength) return input;

  const atIndex = input.lastIndexOf('@');
  const dotIndex = input.lastIndexOf('.');

  let tailStart: number;
  if (atIndex > 0) {
    // Email-like: keep the whole domain if it reasonably fits, else just "@domain-ish" end.
    tailStart = atIndex;
  } else if (dotIndex > 0 && input.length - dotIndex <= 6) {
    // File-like: keep the extension, e.g. ".pdf", ".png".
    tailStart = dotIndex;
  } else {
    tailStart = input.length - Math.min(4, Math.floor(maxLength / 3));
  }

  const tail = input.slice(tailStart);
  const headLength = Math.max(maxLength - tail.length - 1, 3);
  const head = input.slice(0, headLength);

  return `${head}\u2026${tail}`;
}

/** Locale- and number-aware comparator, safe for mixed string/number sort values. */
export function compareSortValues(
  a: string | number | null | undefined,
  b: string | number | null | undefined
): number {
  if (isEmptyValue(a) && isEmptyValue(b)) return 0;
  if (isEmptyValue(a)) return 1;
  if (isEmptyValue(b)) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}
