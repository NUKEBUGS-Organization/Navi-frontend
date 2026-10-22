import { api } from "./client";

export interface AiStatusDto {
  enabled: boolean;
}

export interface DraftCommunicationPayload {
  initiativeId: string;
  type?: string;
  audience?: string;
  tone?: "Formal" | "Friendly" | "Urgent" | "Inspiring";
  length?: "Short" | "Medium" | "Long";
  instructions?: string;
  /** When set, the AI rewrites this draft instead of starting fresh. */
  existingMessage?: string;
}

export interface CommunicationDraftDto {
  title: string;
  message: string;
}

export interface InitiativeHealthDto {
  status: "On Track" | "At Risk" | "Off Track";
  headline: string;
  summary: string;
  highlights: string[];
  concerns: string[];
  nextActions: { action: string; priority: "High" | "Medium" | "Low"; area: string }[];
  generatedAt: string;
}

export function getAiStatus(): Promise<AiStatusDto> {
  return api.get<AiStatusDto>("/ai/status");
}

export function draftCommunication(payload: DraftCommunicationPayload): Promise<CommunicationDraftDto> {
  return api.post<CommunicationDraftDto>("/ai/communications/draft", payload);
}

export function getInitiativeHealth(initiativeId: string): Promise<InitiativeHealthDto> {
  return api.post<InitiativeHealthDto>(`/ai/initiatives/${encodeURIComponent(initiativeId)}/health`, {});
}
