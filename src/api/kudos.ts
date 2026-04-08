import { api } from "./client";

export type KudosContributionType =
  | "task_completed"
  | "task_comment"
  | "assessment_submitted"
  | "manager_award";

export interface KudosSummary {
  totalStars: number;
  systemStars: number;
  managerStars: number;
}

export interface KudosContribution {
  _id: string;
  initiativeId: string;
  contributionType: KudosContributionType;
  contributionTitle?: string;
  contributionSubtitle?: string;
  systemStars: number;
  managerStars: number;
  createdAt?: string;
  employeeId?: string;
  employeeName?: string;
}

export function getKudosSummary(): Promise<KudosSummary> {
  return api.get<KudosSummary>("/kudos/me/summary");
}

export function listMyKudos(): Promise<KudosContribution[]> {
  return api.get<KudosContribution[]>("/kudos/me");
}

export interface KudosInitiativeSummary {
  initiativeId: string;
  title: string;
}

export function listKudosInitiatives(): Promise<KudosInitiativeSummary[]> {
  return api.get<KudosInitiativeSummary[]>("/kudos/initiatives");
}

export function listKudosContributions(initiativeId: string): Promise<KudosContribution[]> {
  return api.get<KudosContribution[]>(`/kudos/initiatives/${encodeURIComponent(initiativeId)}/contributions`);
}

export function giveManagerStar(contributionId: string): Promise<KudosContribution> {
  return api.post<KudosContribution>(`/kudos/contributions/${encodeURIComponent(contributionId)}/manager-star`);
}

export function createManagerKudosAward(payload: {
  initiativeId: string;
  employeeId: string;
  note?: string;
}): Promise<KudosContribution> {
  return api.post<KudosContribution>("/kudos/manager-award", payload);
}

