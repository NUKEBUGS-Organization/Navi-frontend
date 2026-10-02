export * from "./slugify";

/** Format a Date to YYYY-MM-DD using local timezone (avoids UTC day-shift bug) */
export function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parse a YYYY-MM-DD string as local midnight (avoids UTC day-shift when displaying). */
export function parseLocalDateString(dateString: string): Date {
  const [y, m, d] = dateString.split("-").map(Number);
  return new Date(y, m - 1, d);
}
export * from "./dates";
