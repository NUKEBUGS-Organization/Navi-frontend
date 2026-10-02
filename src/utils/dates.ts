/**
 * Date-only helpers. Due dates, target dates and timelines are calendar days, not instants,
 * so they must never be shifted by the viewer's timezone. Values travel as `YYYY-MM-DD`
 * and are parsed as local midnight.
 */

const DATE_ONLY_PREFIX = /^(\d{4})-(\d{2})-(\d{2})/;

/**
 * Coerce a DateInput value / API value into a local-midnight Date.
 * ISO strings (`2026-04-27T00:00:00.000Z`) are read by their calendar part, so the
 * day the user picked is the day that is shown, whatever the timezone.
 */
export function parseDateOnly(value: unknown): Date | null {
  if (value == null || value === "") return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  const s = String(value).trim();
  const m = s.match(DATE_ONLY_PREFIX);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Format a date-like value as `YYYY-MM-DD` (local calendar day), or null. */
export function toDateOnlyString(value: unknown): string | null {
  const d = parseDateOnly(value);
  if (!d) return null;
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

/** Human display of a date-only value, e.g. "Apr 27, 2026". */
export function formatDateOnly(
  value: unknown,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" },
  fallback = "—",
): string {
  const d = parseDateOnly(value);
  return d ? d.toLocaleDateString("en-US", options) : fallback;
}

const RANGE_FMT: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };

/** Build the initiative `dateRange` string, e.g. "Apr 27, 2026 – Sep 30, 2026". */
export function formatDateRange(start: Date | null, end: Date | null): string {
  const s = start ? start.toLocaleDateString("en-US", RANGE_FMT) : null;
  const e = end ? end.toLocaleDateString("en-US", RANGE_FMT) : null;
  if (s && e) return `${s} – ${e}`;
  if (s) return `${s} – —`;
  if (e) return `— – ${e}`;
  return "—";
}

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

function parseRangePart(part: string, fallbackYear?: number): Date | null {
  const p = part.trim();
  if (!p || p === "—") return null;
  // ISO: 2026-04-27
  const iso = p.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  // Numeric (legacy en-US toLocaleDateString): 4/27/2026
  const num = p.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (num) return new Date(Number(num[3]), Number(num[1]) - 1, Number(num[2]));
  // Month name: Apr 27, 2026 / April 27 2026 / Apr 27 (year from the other side)
  const named = p.match(/^([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:,?\s*(\d{4}))?$/);
  if (named) {
    const mo = MONTHS[named[1].slice(0, 3).toLowerCase()];
    const year = named[3] ? Number(named[3]) : fallbackYear;
    if (mo == null || year == null) return null;
    return new Date(year, mo, Number(named[2]));
  }
  return null;
}

/**
 * Parse an initiative `dateRange` string. Supports "Q1 2026 – Q3 2026",
 * "Apr 27, 2026 – Sep 30, 2026", "Mar 1 – Sep 30, 2026", "4/27/2026 – 9/30/2026"
 * and open-ended ranges ("Apr 27, 2026 – —").
 */
export function parseDateRangeParts(range: string | undefined | null): {
  start: Date | null;
  end: Date | null;
} {
  const r = (range ?? "").replace(/\s+/g, " ").trim();
  if (!r || r === "—") return { start: null, end: null };

  const quarter = r.match(/^Q([1-4])\s*(\d{4})\s*(?:-|–|—)\s*Q([1-4])\s*(\d{4})$/i);
  if (quarter) {
    const q1 = Number(quarter[1]);
    const q2 = Number(quarter[3]);
    return {
      start: new Date(Number(quarter[2]), (q1 - 1) * 3, 1),
      end: new Date(Number(quarter[4]), q2 * 3, 0),
    };
  }

  const [rawStart = "", rawEnd = ""] = r.split(/\s+[–-]\s+/);
  const end = parseRangePart(rawEnd);
  const start = parseRangePart(rawStart, end?.getFullYear());
  return { start, end };
}

/** Closed date range or null (used for overlap checks between initiatives). */
export function parseDateRange(range: string | undefined | null): { start: Date; end: Date } | null {
  const { start, end } = parseDateRangeParts(range);
  return start && end ? { start, end } : null;
}
