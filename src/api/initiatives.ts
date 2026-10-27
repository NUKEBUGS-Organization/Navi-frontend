import { api } from "./client";
import type { InitiativeSummary, InitiativeGoal, InitiativeFaq } from "@/types";

function mapInitiative<T extends { _id?: unknown; [key: string]: unknown }>(
  raw: T
): T & { id: string } {
  const id =
    typeof raw._id === "string"
      ? raw._id
      : (raw._id as unknown as { toString?: () => string })?.toString?.() ?? "";
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
  status?: "ACTIVE" | "DRAFT" | "WAITING_FOR_APPROVAL" | "COMPLETED" | "PLANNING";
  leadName: string;
  /** Change lead's user ID; the server shows the lead's current profile name from it. */
  leadUserId?: string;
  sponsorName?: string;
  dateRange?: string;
  departments?: string[];
  progress?: number;
  readiness?: string;
  goals?: InitiativeGoal[];
  faqs?: InitiativeFaq[];
  changeType?: string;
  raciAccountableIds?: string[];
  raciResponsibleIds?: string[];
  raciConsultedIds?: string[];
  raciInformedIds?: string[];
  /** When false, milestones stay in the system but no longer affect initiative progress. */
  adoptionTrackingEnabled?: boolean;
  hseImpact?: boolean;
  foodSafetyImpact?: boolean;
}

/** True when the user is the initiative's change lead (by ID; by name for initiatives not linked to a user yet). */
export function isInitiativeLead(
  initiative: { leadUserId?: string; leadName?: string },
  user: { _id?: unknown; name?: string } | null | undefined,
): boolean {
  if (!user) return false;
  if (initiative.leadUserId) return user._id != null && String(user._id) === String(initiative.leadUserId);
  const lead = String(initiative.leadName ?? "").trim().toLowerCase();
  return Boolean(lead) && lead === String(user.name ?? "").trim().toLowerCase();
}

/**
 * Picker value for an initiative's lead: their user ID, or (for older initiatives not linked yet)
 * the ID of the one person whose name matches.
 */
export function leadPickerValue(
  initiative: { leadUserId?: string; leadName?: string } | null | undefined,
  people: { id: string; name: string }[],
): string {
  if (!initiative) return "";
  if (initiative.leadUserId) return String(initiative.leadUserId);
  const name = String(initiative.leadName ?? "").trim().toLowerCase();
  const matches = people.filter((p) => p.name.trim().toLowerCase() === name);
  return matches.length === 1 ? matches[0].id : "";
}

/** Change Lead picker options: value is the user ID, label shows the name and current enrollment count. */
export function leadSelectOptions(
  people: { id: string; name: string }[],
  enrollmentCountsByName: Record<string, number>,
): { value: string; label: string }[] {
  const seen = new Set<string>();
  return people
    .filter((p) => !seen.has(p.id) && Boolean(seen.add(p.id)))
    .map((p) => ({ value: p.id, label: `${p.name} (${enrollmentCountsByName[p.name] ?? 0})` }));
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

/** Archived initiatives (admin only). Archived ones are left out of `listInitiatives`. */
export function listArchivedInitiatives(): Promise<InitiativeListItem[]> {
  return api.get<unknown[]>("/initiatives?archived=true").then((list) =>
    list.map((item) => mapInitiative(item as { _id: string }) as InitiativeListItem)
  );
}

/** Soft delete (admin only): hides the initiative from lists, dashboards and rollups until restored. */
export function archiveInitiative(id: string): Promise<InitiativeListItem> {
  return api
    .post<unknown>(`/initiatives/${id}/archive`, {})
    .then((raw) => mapInitiative(raw as { _id: string }) as InitiativeListItem);
}

export function restoreInitiative(id: string): Promise<InitiativeListItem> {
  return api
    .post<unknown>(`/initiatives/${id}/restore`, {})
    .then((raw) => mapInitiative(raw as { _id: string }) as InitiativeListItem);
}

/** Permanently delete an archived initiative and everything linked to it (admin only). */
export function deleteInitiativePermanently(id: string): Promise<{ deleted: boolean }> {
  return api.delete<{ deleted: boolean }>(`/initiatives/${id}`);
}

/** Discard an unpublished draft initiative (only DRAFTs without roadmap tasks). */
export function deleteInitiativeDraft(id: string): Promise<{ deleted: boolean }> {
  return api.delete<{ deleted: boolean }>(`/initiatives/${id}/draft`);
}

export type InitiativeParticipationRole = "lead" | "raci" | "assignee";

export interface MyInitiativeParticipation {
  id: string;
  title: string;
  status: string;
  progress: number;
  leadName: string;
  roles: InitiativeParticipationRole[];
}

/** Initiatives where the current user is lead, on RACI, or has assigned tasks. */
export function listMyInitiativeParticipations(): Promise<MyInitiativeParticipation[]> {
  return api.get<MyInitiativeParticipation[]>("/initiatives/me/participations");
}

export interface RaciRollupRow {
  userId: string;
  name: string;
  email?: string;
  asAccountable: string[];
  asResponsible: string[];
  asConsulted: string[];
  asInformed: string[];
}

export function listRaciRollup(): Promise<RaciRollupRow[]> {
  return api.get<RaciRollupRow[]>("/initiatives/raci/rollup");
}
