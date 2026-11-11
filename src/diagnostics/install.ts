import { flushNow, reportError } from "./reporter";

let installed = false;

function isApiErrorLike(reason: unknown): boolean {
  return (
    typeof reason === "object" &&
    reason !== null &&
    !(reason instanceof Error) &&
    typeof (reason as { status?: unknown }).status === "number"
  );
}

/** Registers global error listeners once; safe to call repeatedly. */
export function installGlobalErrorHandlers(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (event) => {
    if (!event.error && !event.message) return;
    if (typeof event.message === "string" && event.message.startsWith("ResizeObserver loop")) return;
    reportError(event.error ?? event.message, { kind: "window_error" });
  });

  window.addEventListener("unhandledrejection", (event) => {
    // ApiError objects (HTTP failures) were already recorded by the server.
    if (isApiErrorLike(event.reason)) return;
    reportError(event.reason, { kind: "promise_rejection" });
  });

  window.addEventListener("pagehide", () => flushNow(true));
}
