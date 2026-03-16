export type TaskStatus = "Not Started" | "In Progress" | "Completed" | "Blocked";

export interface Task {
  id: string | number;
  status: TaskStatus;
  title: string;
  owner: string;
  date: string;
  progress: number;
  isBlocked?: boolean;
  phase?: "Discovery" | "Awareness" | "Alignment" | "Implementation" | "Adoption" | "Reinforcement";
  description?: string;
  /** API fields when loaded from backend */
  _id?: string;
  assigneeId?: string;
  initiativeId?: string;
  dueDate?: string;
}
