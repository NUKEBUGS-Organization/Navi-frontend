import { api } from "./client";

export interface AssessmentStep {
  title: string;
  questions: string[];
}

export interface Assessment {
  _id: string;
  name: string;
  initiativeId: string;
  organizationId: string;
  ownerId?: string;
  dueDate?: string;
  audience?: string;
  description?: string;
  steps: AssessmentStep[];
  completed?: boolean;
  overallScore?: number;
  riskLevel?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAssessmentPayload {
  name: string;
  initiativeId: string;
  ownerId?: string;
  dueDate?: string;
  audience?: string;
  description?: string;
  steps?: AssessmentStep[];
}

/** List all assessments for an initiative (for initiative detail page). */
export function listAssessmentsByInitiative(
  initiativeId: string
): Promise<Assessment[]> {
  return api.get<Assessment[]>(
    `/assessments?initiativeId=${encodeURIComponent(initiativeId)}`
  );
}

/** Get a single assessment by id (for loading form steps). */
export function getAssessment(id: string): Promise<Assessment> {
  return api.get<Assessment>(`/assessments/${id}`);
}

/** @deprecated Use listAssessmentsByInitiative and take first, or getAssessment(id). */
export function getAssessmentByInitiative(
  initiativeId: string
): Promise<Assessment | null> {
  return listAssessmentsByInitiative(initiativeId).then(
    (list) => (list.length > 0 ? list[0] : null)
  );
}

export function listAssessments(): Promise<Assessment[]> {
  return api.get<Assessment[]>("/assessments");
}

export function createAssessment(
  payload: CreateAssessmentPayload
): Promise<Assessment> {
  return api.post<Assessment>("/assessments", payload);
}

export function updateAssessment(
  id: string,
  payload: { completed?: boolean; overallScore?: number; riskLevel?: string }
): Promise<Assessment> {
  return api.patch<Assessment>(`/assessments/${id}`, payload);
}

/** One submission per staff member per assessment; used for scores and dashboard. */
export interface AssessmentSubmission {
  _id: string;
  assessmentId: string;
  /** Assessment name (set when creating the assessment); included in list responses. */
  assessmentName?: string;
  initiativeId: string;
  organizationId: string;
  userId: string;
  overallScore: number;
  riskLevel?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function createSubmission(payload: {
  assessmentId: string;
  overallScore: number;
  riskLevel?: string;
}): Promise<AssessmentSubmission> {
  return api.post<AssessmentSubmission>("/assessment-submissions", payload);
}

export function listSubmissions(options?: {
  mine?: boolean;
  initiativeId?: string;
}): Promise<AssessmentSubmission[]> {
  const params = new URLSearchParams();
  if (options?.mine) params.set("mine", "true");
  if (options?.initiativeId) params.set("initiativeId", options.initiativeId);
  const q = params.toString();
  return api.get<AssessmentSubmission[]>(
    q ? `/assessment-submissions?${q}` : "/assessment-submissions"
  );
}
