import { api } from "./client";

export type ActivityItemType = "task_created" | "task_updated" | "comment" | "adoption_milestone";

export interface ActivityItem {
  type: ActivityItemType;
  date: string;
  taskId?: string;
  taskTitle?: string;
  userId?: string;
  content?: string;
  milestone?: string;
  percentAdopted?: number;
  progress?: number;
}

export function getInitiativeActivity(initiativeId: string): Promise<ActivityItem[]> {
  return api.get<ActivityItem[]>(`/activity?initiativeId=${encodeURIComponent(initiativeId)}`);
}
