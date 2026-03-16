import { api } from "./client";

export interface StakeholderDto {
  _id: string;
  initiativeId: string;
  organizationId: string;
  name: string;
  role?: string;
  influence?: "High" | "Medium" | "Low";
  support?: "Champion" | "Supporter" | "Neutral" | "Resistant";
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStakeholderPayload {
  initiativeId: string;
  name: string;
  role?: string;
  influence?: string;
  support?: string;
  notes?: string;
}

export interface UpdateStakeholderPayload {
  name?: string;
  role?: string;
  influence?: string;
  support?: string;
  notes?: string;
  initiativeId?: string;
}

export function listStakeholders(initiativeId?: string): Promise<StakeholderDto[]> {
  const q = initiativeId ? `?initiativeId=${encodeURIComponent(initiativeId)}` : "";
  return api.get<StakeholderDto[]>(`/stakeholders${q}`);
}

export function createStakeholder(payload: CreateStakeholderPayload): Promise<StakeholderDto> {
  return api.post<StakeholderDto>("/stakeholders", payload);
}

export function updateStakeholder(id: string, payload: UpdateStakeholderPayload): Promise<StakeholderDto> {
  return api.patch<StakeholderDto>(`/stakeholders/${id}`, payload);
}

export function deleteStakeholder(id: string): Promise<{ message: string }> {
  return api.delete<{ message: string }>(`/stakeholders/${id}`);
}
