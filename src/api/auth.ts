import { API_BASE } from "@/constants";
import { api } from "./client";

export type UserRole = "super_admin" | "admin" | "manager" | "employee";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  departments?: string[];
  isActive?: boolean;
  lastActiveAt?: string;
  photoDataUrl?: string;
  phoneNumber?: string;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  /** Required for admin/manager; omitted for employees (server assigns OrganizationName@{n}). */
  password?: string;
  role: UserRole;
  departments?: string[];
  phoneNumber?: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  departments?: string[];
  isActive?: boolean;
  photoDataUrl?: string;
  phoneNumber?: string;
}

export interface BulkImportCredential {
  email: string;
  name: string;
  password: string;
  phone?: string;
  role: UserRole;
}

export interface BulkImportUsersResult {
  created: number;
  skipped: number;
  errors: string[];
  credentials: BulkImportCredential[];
}

export interface SendAccessEmailsResult {
  sent: number;
  failed: { email: string; reason: string }[];
}

export function updateMyProfile(payload: { name?: string; photoDataUrl?: string }): Promise<AuthUser> {
  return api.patch<AuthUser>("/auth/me/profile", payload);
}

export function bulkImportUsers(csvText: string): Promise<BulkImportUsersResult> {
  return api.post<BulkImportUsersResult>("/auth/users/bulk-import", {
    csvText,
  });
}

export function sendAccessEmails(entries: { email: string; password: string }[]): Promise<SendAccessEmailsResult> {
  return api.post<SendAccessEmailsResult>("/auth/users/send-access-emails", { entries });
}

/**
 * Login without sending any stored token (avoids stale/invalid Bearer breaking the request).
 * Uses a direct fetch so the shared api client's Authorization header is never attached.
 */
export function login(email: string, password: string): Promise<LoginResponse> {
  const url = `${API_BASE}/auth/login`;
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    credentials: "omit",
  })
    .then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          (data as { message?: string }).message ||
          res.statusText ||
          (res.status === 401 ? "Invalid email or password." : "Request failed.");
        throw Object.assign(new Error(message), { status: res.status, data });
      }
      if (!(data && typeof (data as LoginResponse).access_token === "string" && (data as LoginResponse).user)) {
        throw new Error("Invalid login response from server.");
      }
      return data as LoginResponse;
    })
    .catch((err) => {
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        throw new Error("Cannot reach server. Is the backend running at " + API_BASE + "?");
      }
      throw err;
    });
}

function parseAuthErrorMessage(data: unknown, fallback: string): string {
  const d = data as { message?: string | string[] };
  if (Array.isArray(d.message)) return d.message.join(", ");
  if (typeof d.message === "string") return d.message;
  return fallback;
}

export function requestPasswordReset(email: string): Promise<{ message: string }> {
  const url = `${API_BASE}/auth/forgot-password`;
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
    credentials: "omit",
  }).then(async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(parseAuthErrorMessage(data, res.statusText || "Request failed."));
    }
    return data as { message: string };
  })
    .catch((err) => {
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        throw new Error("Cannot reach server. Is the backend running at " + API_BASE + "?");
      }
      throw err;
    });
}

export function resetPasswordWithOtp(
  email: string,
  otp: string,
  newPassword: string
): Promise<{ message: string }> {
  const url = `${API_BASE}/auth/reset-password`;
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      otp: otp.trim(),
      newPassword,
    }),
    credentials: "omit",
  }).then(async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(parseAuthErrorMessage(data, res.statusText || "Request failed."));
    }
    return data as { message: string };
  })
    .catch((err) => {
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        throw new Error("Cannot reach server. Is the backend running at " + API_BASE + "?");
      }
      throw err;
    });
}

export function getMe(): Promise<AuthUser> {
  return api.get<AuthUser>("/auth/me");
}

export function listOrganizationUsers(): Promise<AuthUser[]> {
  return api.get<AuthUser[]>("/auth/organization/users");
}

export function createUser(payload: CreateUserPayload): Promise<AuthUser> {
  return api.post<AuthUser>("/auth/users", payload);
}

export function updateUser(id: string, payload: UpdateUserPayload): Promise<AuthUser> {
  return api.patch<AuthUser>(`/auth/users/${id}`, payload);
}

export function deleteUser(id: string): Promise<void> {
  return api.delete(`/auth/users/${id}`);
}
