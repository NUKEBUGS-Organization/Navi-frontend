const DEFAULT_DEV_API = "http://localhost:3000";
const DEFAULT_PROD_API = "https://navi-backend.changewithnavi.com";

function stripTrailingSlashes(s: string): string {
  return s.replace(/\/+$/, "");
}

/**
 * API host is normally set at build time via VITE_API_URL / .env.production.
 * If the live site is opened on our CapRover hostname but the bundle still has no prod URL
 * (old deploy, bad Docker ignore, empty env), use the real backend so login still works.
 */
function resolveApiBase(): string {
  const env =
    typeof import.meta !== "undefined"
      ? (import.meta as { env?: { VITE_API_URL?: string; PROD?: boolean; MODE?: string } })
          .env
      : undefined;
  const raw = (env?.VITE_API_URL ?? "").trim();
  if (raw) return stripTrailingSlashes(raw);

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "app.changewithnavi.com") {
      return DEFAULT_PROD_API;
    }
  }

  const isProd = Boolean(env?.PROD || env?.MODE === "production");
  return isProd ? DEFAULT_PROD_API : DEFAULT_DEV_API;
}

export const API_BASE = resolveApiBase();

export function getAuthToken(): string | null {
  return localStorage.getItem("navi_token");
}

export function setAuthToken(token: string): void {
  localStorage.setItem("navi_token", token);
}

export function clearAuthToken(): void {
  localStorage.removeItem("navi_token");
}

export const USER_STORAGE_KEY = "navi_user";

export function getStoredUser(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: Record<string, unknown>): void {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
  localStorage.removeItem(USER_STORAGE_KEY);
}
