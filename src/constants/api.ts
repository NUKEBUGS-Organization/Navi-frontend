export const API_BASE =
  (typeof import.meta !== "undefined" && (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL) ||
  "http://localhost:3000";

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
