import { api } from "./client";
import type { InitiativeSummary, InitiativeGoal } from "@/types";

function mapInitiative<T extends { _id?: string; [key: string]: unknown }>(
  raw: T
): T & { id: string } {
  const id =
    typeof raw._id === "string"
      ? raw._id
      : (raw._id as { toString?: () => string })?.toString?.() ?? "";
  const { _id, ...rest } = raw;
  return { ...rest, id } as T & { id: string };
}

export interface InitiativeListItem extends InitiativeSummary {
  id: string;
  _id?: string;
}

export interface CreateInitiativePayload {
  title: string;
  description?: string;
  status?: "ACTIVE" | "DRAFT" | "PLANNING";
  leadName: string;
  dateRange?: string;
  departments?: string[];
  progress?: number;
  readiness?: string;
  goals?: InitiativeGoal[];
}

export function listInitiatives(): Promise<InitiativeListItem[]> {
  return api.get<unknown[]>("/initiatives").then((list) =>
    list.map((item) => mapInitiative(item as { _id: string }) as InitiativeListItem)
  );
}

export function getInitiative(id: string): Promise<InitiativeListItem & { description?: string }> {
  return api
    .get<unknown>(`/initiatives/${id}`)
    .then((raw) => mapInitiative(raw as { _id: string }) as InitiativeListItem & { description?: string });
}

export function createInitiative(
  payload: CreateInitiativePayload
): Promise<InitiativeListItem> {
  return api
    .post<unknown>("/initiatives", payload)
    .then((raw) => mapInitiative(raw as { _id: string }) as InitiativeListItem);
}

export function updateInitiative(
  id: string,
  payload: Partial<CreateInitiativePayload>
): Promise<InitiativeListItem> {
  return api
    .patch<unknown>(`/initiatives/${id}`, payload)
    .then((raw) => mapInitiative(raw as { _id: string }) as InitiativeListItem);
}
