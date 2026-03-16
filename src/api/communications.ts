import { api } from "./client";

export interface CommunicationDto {
  _id: string;
  initiativeId: string;
  organizationId: string;
  title: string;
  type?: "Email" | "Meeting" | "Newsletter" | "Workshop" | "Other";
  audience?: string;
  scheduledDate?: string;
  status?: "Planned" | "Scheduled" | "Sent" | "Completed" | "Cancelled";
  message?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCommunicationPayload {
  initiativeId: string;
  title: string;
  type?: string;
  audience?: string;
  scheduledDate?: string;
  status?: string;
  message?: string;
}

export interface UpdateCommunicationPayload {
  title?: string;
  type?: string;
  audience?: string;
  scheduledDate?: string;
  status?: string;
  message?: string;
  initiativeId?: string;
}

export function listCommunications(initiativeId?: string): Promise<CommunicationDto[]> {
  const q = initiativeId ? `?initiativeId=${encodeURIComponent(initiativeId)}` : "";
  return api.get<CommunicationDto[]>(`/communications${q}`);
}

export function createCommunication(payload: CreateCommunicationPayload): Promise<CommunicationDto> {
  return api.post<CommunicationDto>("/communications", payload);
}

export function updateCommunication(id: string, payload: UpdateCommunicationPayload): Promise<CommunicationDto> {
  return api.patch<CommunicationDto>(`/communications/${id}`, payload);
}

export function deleteCommunication(id: string): Promise<{ message: string }> {
  return api.delete<{ message: string }>(`/communications/${id}`);
}
