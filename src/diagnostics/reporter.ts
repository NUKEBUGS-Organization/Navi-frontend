import { API_BASE, getAuthToken } from "@/constants";

export type ClientErrorKind = "render" | "window_error" | "promise_rejection" | "network";

type ClientErrorReport = {
  kind: ClientErrorKind;
  name: string;
  message: string;
  stack?: string;
  componentStack?: string;
  pageUrl: string;
};

const ENDPOINT_PATH = "/diagnostics/client-errors";
const QUEUE_MAX = 50;
const BATCH_MAX = 20;
const FLUSH_INTERVAL_MS = 2000;
const DEDUPE_WINDOW_MS = 10_000;
const MAX_BODY_CHARS = 30_000;
const KEEPALIVE_BUDGET_BYTES = 60_000;
const MAX_NAME = 200;
const MAX_MESSAGE = 500;
const MAX_STACK = 8000;
const MAX_COMPONENT_STACK = 4000;
const SENSITIVE_PARAM = /token|password|secret|key|code|otp|auth/i;

let queue: ClientErrorReport[] = [];
const recent = new Map<string, number>();
let timer: ReturnType<typeof setInterval> | null = null;
let inFlight = false;

function cap(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) : text;
}

/** Normalizes any thrown value into name/message/stack. */
export function normalizeError(error: unknown): { name: string; message: string; stack?: string } {
  if (error instanceof Error) {
    return {
      name: cap(error.name || "Error", MAX_NAME),
      message: cap(String(error.message ?? ""), MAX_MESSAGE),
      stack: error.stack ? cap(error.stack, MAX_STACK) : undefined,
    };
  }
  let message: string;
  try {
    message = String(error);
  } catch {
    message = "[unprintable value]";
  }
  return { name: "NonError", message: cap(message, MAX_MESSAGE) };
}

function redactPairs(pairs: string): string {
  return pairs
    .split("&")
    .map((pair) => {
      const eq = pair.indexOf("=");
      if (eq < 0) return pair;
      const name = pair.slice(0, eq);
      let decoded = name;
      try {
        decoded = decodeURIComponent(name);
      } catch {
        // keep raw name
      }
      return SENSITIVE_PARAM.test(decoded) ? `${name}=[redacted]` : pair;
    })
    .join("&");
}

/** Redacts values of sensitive query keys (pathname + search only; no hash). */
export function redactSearch(pathname: string, search: string): string {
  const q = search.startsWith("?") ? search.slice(1) : search;
  const out = q ? `${pathname}?${redactPairs(q)}` : pathname;
  return cap(out, 2000);
}

function currentPageUrl(): string {
  if (typeof location === "undefined") return "/";
  return redactSearch(location.pathname, location.search);
}

function trimQueue() {
  if (queue.length > QUEUE_MAX) queue = queue.slice(queue.length - QUEUE_MAX);
}

function ensureTimer() {
  if (timer !== null || typeof window === "undefined") return;
  timer = setInterval(() => flushNow(), FLUSH_INTERVAL_MS);
}

function stopTimerIfIdle() {
  if (timer !== null && queue.length === 0 && !inFlight) {
    clearInterval(timer);
    timer = null;
  }
}

export function reportError(
  error: unknown,
  context: { kind: ClientErrorKind; componentStack?: string },
): void {
  try {
    if (typeof window === "undefined") return;
    const { name, message, stack } = normalizeError(error);
    const key = `${context.kind}|${name}|${message}`;
    const now = Date.now();
    const last = recent.get(key);
    if (last !== undefined && now - last < DEDUPE_WINDOW_MS) return;
    recent.set(key, now);
    if (recent.size > 200) {
      for (const [k, t] of recent) if (now - t >= DEDUPE_WINDOW_MS) recent.delete(k);
    }
    const report: ClientErrorReport = {
      kind: context.kind,
      name,
      message,
      pageUrl: currentPageUrl(),
    };
    if (stack) report.stack = stack;
    if (context.componentStack) {
      report.componentStack = cap(context.componentStack, MAX_COMPONENT_STACK);
    }
    queue.push(report);
    trimQueue();
    ensureTimer();
  } catch {
    // diagnostics must never throw into the app
  }
}

/** Takes up to BATCH_MAX reports off the queue, keeping the JSON body under MAX_BODY_CHARS. */
function takeBatch(): ClientErrorReport[] {
  const batch = queue.splice(0, BATCH_MAX);
  while (batch.length > 1 && JSON.stringify({ reports: batch }).length > MAX_BODY_CHARS) {
    queue.unshift(batch.pop()!);
  }
  return batch;
}

/**
 * Flushes queued reports. With `unloading` (pagehide) it fires keepalive fetches without
 * awaiting them: unlike sendBeacon, fetch can carry the Authorization header and avoids the
 * credentialed cross-origin preflight that is easily cut off during unload. sendBeacon is
 * used only when fetch is unavailable. keepalive bodies share a 64 KB in-flight budget, so
 * only what fits is sent; the rest stays queued.
 */
export function flushNow(unloading = false): void {
  try {
    if (queue.length === 0 || typeof window === "undefined") {
      stopTimerIfIdle();
      return;
    }
    const url = `${API_BASE}${ENDPOINT_PATH}`;

    if (unloading) {
      const canFetch = typeof fetch === "function";
      const canBeacon = typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function";
      if (!canFetch && !canBeacon) return;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const token = getAuthToken();
      if (token) headers.Authorization = `Bearer ${token}`;
      let budget = KEEPALIVE_BUDGET_BYTES;
      while (queue.length > 0) {
        const batch = takeBatch();
        const body = JSON.stringify({ reports: batch });
        const bytes = new Blob([body]).size;
        if (canFetch && bytes > budget) {
          queue = [...batch, ...queue];
          trimQueue();
          break;
        }
        if (canFetch) {
          budget -= bytes;
          // Plain fetch, rejections swallowed: never report the reporter's own failures.
          fetch(url, { method: "POST", keepalive: true, headers, body }).catch(() => {});
        } else if (!navigator.sendBeacon(url, new Blob([body], { type: "application/json" }))) {
          queue = [...batch, ...queue];
          trimQueue();
          break;
        }
      }
      return;
    }

    if (inFlight) return;
    const batch = takeBatch();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    inFlight = true;
    // Plain fetch on purpose: reporting the reporter's own failures would loop.
    fetch(url, {
      method: "POST",
      keepalive: true,
      headers,
      body: JSON.stringify({ reports: batch }),
    })
      .catch(() => {
        // Network failure: keep the batch for the next tick. HTTP errors resolve and are dropped.
        queue = [...batch, ...queue];
        trimQueue();
      })
      .finally(() => {
        inFlight = false;
        stopTimerIfIdle();
      });
  } catch {
    inFlight = false;
  }
}
