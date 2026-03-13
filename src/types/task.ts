export type TaskStatus = "Not Started" | "In Progress" | "Completed" | "Blocked";

export interface Task {
  id: number;
  status: TaskStatus;
  title: string;
  owner: string;
  date: string;
  progress: number;
  isBlocked?: boolean;
  phase?: "Discovery" | "Awareness" | "Alignment";
  description?: string;
}
