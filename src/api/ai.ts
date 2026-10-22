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

export function getAiStatus(): Promise<AiStatusDto> {
  return api.get<AiStatusDto>("/ai/status");
}

export function draftCommunication(payload: DraftCommunicationPayload): Promise<CommunicationDraftDto> {
  return api.post<CommunicationDraftDto>("/ai/communications/draft", payload);
}
