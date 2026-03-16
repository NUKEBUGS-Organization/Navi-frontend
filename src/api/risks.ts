import { api } from "./client";

export interface RiskDto {
  _id: string;
  initiativeId: string;
  organizationId: string;
  title: string;
  description?: string;
  severity?: "Low" | "Medium" | "High" | "Critical";
  status?: "Open" | "Mitigating" | "Resolved" | "Closed";
  mitigationNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRiskPayload {
  initiativeId: string;
  title: string;
  description?: string;
  severity?: string;
  status?: string;
  mitigationNotes?: string;
}

export interface UpdateRiskPayload {
  title?: string;
  description?: string;
  severity?: string;
  status?: string;
  mitigationNotes?: string;
  initiativeId?: string;
}

export interface RiskSummary {
  high: number;
  critical: number;
  open: number;
}

export function listRisks(initiativeId?: string, status?: string, severity?: string): Promise<RiskDto[]> {
  const params = new URLSearchParams();
  if (initiativeId) params.set("initiativeId", initiativeId);
  if (status) params.set("status", status);
  if (severity) params.set("severity", severity);
  const q = params.toString() ? `?${params.toString()}` : "";
  return api.get<RiskDto[]>(`/risks${q}`);
}

export function getRiskSummary(): Promise<RiskSummary> {
  return api.get<RiskSummary>("/risks/summary");
}

export function createRisk(payload: CreateRiskPayload): Promise<RiskDto> {
  return api.post<RiskDto>("/risks", payload);
}

export function updateRisk(id: string, payload: UpdateRiskPayload): Promise<RiskDto> {
  return api.patch<RiskDto>(`/risks/${id}`, payload);
}

export function deleteRisk(id: string): Promise<{ message: string }> {
  return api.delete<{ message: string }>(`/risks/${id}`);
}
