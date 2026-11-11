export type ErrorSource = "server" | "client";
export type ErrorSeverity = "error" | "warning";
export type ErrorGroupStatus = "open" | "resolved";

export interface ErrorGroup {
  _id: string;
  fingerprint: string;
  source: ErrorSource;
  severity: ErrorSeverity;
  kind: string;
  name: string;
  message: string;
  statusCode?: number;
  route?: string;
  count: number;
  roles: string[];
  firstSeen: string;
  lastSeen: string;
  status: ErrorGroupStatus;
  resolvedAt?: string;
  resolvedBy?: string;
  usersAffected: number;
  orgsAffected: number;
  createdAt: string;
  updatedAt: string;
}

export interface ErrorEvent {
  _id: string;
  groupId: string;
  createdAt: string;
  message: string;
  name: string;
  stack?: string;
  componentStack?: string;
  statusCode?: number;
  method?: string;
  path?: string;
  pageUrl?: string;
  userId?: string;
  userRole?: string;
  organizationId?: string;
  userEmail?: string;
  userAgent?: string;
  ip?: string;
  appVersion?: string;
}

export interface DiagnosticsSummary {
  errorsLast24h: number;
  warningsLast24h: number;
  openGroups: number;
  usersAffectedLast24h: number;
}

export interface ListGroupsParams {
  severity?: "error" | "all";
  source?: ErrorSource;
  status?: "open" | "resolved" | "all";
  q?: string;
  page?: number;
  limit?: number;
}

export interface ErrorGroupPage {
  items: ErrorGroup[];
  total: number;
  page: number;
  limit: number;
}

export interface ErrorGroupDetail {
  group: ErrorGroup;
  events: ErrorEvent[];
}
