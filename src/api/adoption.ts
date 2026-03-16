import { api } from "./client";

export interface AdoptionDto {
  _id: string;
  initiativeId: string;
  organizationId: string;
  milestone: string;
  targetDate?: string;
  status?: "Not Started" | "In Progress" | "Achieved" | "At Risk";
  percentAdopted?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAdoptionPayload {
  initiativeId: string;
  milestone: string;
  targetDate?: string;
  status?: string;
  percentAdopted?: number;
  notes?: string;
}

export interface UpdateAdoptionPayload {
  milestone?: string;
  targetDate?: string;
  status?: string;
  percentAdopted?: number;
  notes?: string;
  initiativeId?: string;
}

export function listAdoption(initiativeId?: string): Promise<AdoptionDto[]> {
  const q = initiativeId ? `?initiativeId=${encodeURIComponent(initiativeId)}` : "";
  return api.get<AdoptionDto[]>(`/adoption${q}`);
}

export function createAdoption(payload: CreateAdoptionPayload): Promise<AdoptionDto> {
  return api.post<AdoptionDto>("/adoption", payload);
}

export function updateAdoption(id: string, payload: UpdateAdoptionPayload): Promise<AdoptionDto> {
  return api.patch<AdoptionDto>(`/adoption/${id}`, payload);
}

export function deleteAdoption(id: string): Promise<{ message: string }> {
  return api.delete<{ message: string }>(`/adoption/${id}`);
}
