import { API_BASE, getAuthToken } from "@/constants";
import { reportError } from "@/diagnostics/reporter";

export type ApiError = { message: string; status?: number };

/** fetch that reports thrown (network) failures, then rethrows the same error. */
async function fetchOrReport(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (err) {
    reportError(err, { kind: "network" });
    throw err;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetchOrReport(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const raw = (data as { message?: string | string[] }).message;
    const message = Array.isArray(raw)
      ? raw.join(", ")
      : raw || res.statusText || "Request failed";
    const err: ApiError = { message, status: res.status };
    throw err;
  }
  return data as T;
}

/** POST multipart/form-data (do not set Content-Type; browser sets boundary). */
export async function postFormData<T>(path: string, formData: FormData): Promise<T> {
  const token = getAuthToken();
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const headers: HeadersInit = {};
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetchOrReport(url, { method: "POST", body: formData, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: ApiError = {
      message: (data as { message?: string }).message || res.statusText || "Request failed",
      status: res.status,
    };
    throw err;
  }
  return data as T;
}

/** GET binary response (e.g. file download). */
export async function getBlob(path: string): Promise<Blob> {
  const token = getAuthToken();
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const headers: HeadersInit = {};
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetchOrReport(url, { method: "GET", headers });
  if (!res.ok) {
    const err: ApiError = { message: res.statusText || "Request failed", status: res.status };
    throw err;
  }
  return res.blob();
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
