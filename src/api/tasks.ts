import { api } from "./client";

export type TaskStatus = "Not Started" | "In Progress" | "Completed" | "Blocked";
export type TaskPhase = "Discovery" | "Awareness" | "Alignment" | "Implementation" | "Adoption" | "Reinforcement";

export interface TaskDto {
  _id: string;
  initiativeId: string;
  organizationId: string;
  title: string;
  description?: string;
  phase?: TaskPhase;
  dueDate?: string;
  assigneeId: string;
  /** Populated by backend when listing tasks */
  assigneeName?: string;
  status: TaskStatus;
  progress: number;
  isBlocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskPayload {
  initiativeId: string;
  title: string;
  description?: string;
  phase?: TaskPhase;
  dueDate?: string;
  assigneeId: string;
  status?: TaskStatus;
  progress?: number;
  isBlocked?: boolean;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  phase?: TaskPhase;
  dueDate?: string;
  assigneeId?: string;
  status?: TaskStatus;
  progress?: number;
  isBlocked?: boolean;
}

export function listTasks(initiativeId?: string): Promise<TaskDto[]> {
  const q = initiativeId ? `?initiativeId=${encodeURIComponent(initiativeId)}` : "";
  return api.get<TaskDto[]>(`/tasks${q}`);
}

export function getTask(id: string): Promise<TaskDto> {
  return api.get<TaskDto>(`/tasks/${id}`);
}

export function createTask(payload: CreateTaskPayload): Promise<TaskDto> {
  return api.post<TaskDto>("/tasks", payload);
}

export function updateTask(id: string, payload: UpdateTaskPayload): Promise<TaskDto> {
  return api.patch<TaskDto>(`/tasks/${id}`, payload);
}

export function deleteTask(id: string): Promise<{ message: string }> {
  return api.delete<{ message: string }>(`/tasks/${id}`);
}

export interface TaskCommentDto {
  _id: string;
  taskId: string;
  organizationId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export function listTaskComments(taskId: string): Promise<TaskCommentDto[]> {
  return api.get<TaskCommentDto[]>(`/tasks/${taskId}/comments`);
}

export function createTaskComment(taskId: string, content: string): Promise<TaskCommentDto> {
  return api.post<TaskCommentDto>(`/tasks/${taskId}/comments`, { content });
}
