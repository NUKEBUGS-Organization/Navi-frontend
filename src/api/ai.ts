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

export type RiskSeverity = "Low" | "Medium" | "High" | "Critical";

export interface RiskSuggestionDto {
  title: string;
  description: string;
  severity: RiskSeverity;
  mitigationNotes: string;
  rationale: string;
}

export interface RiskAssessmentDto {
  severity: RiskSeverity;
  rationale: string;
  mitigationNotes: string;
}

export function suggestRisks(initiativeId: string): Promise<{ risks: RiskSuggestionDto[] }> {
  return api.post<{ risks: RiskSuggestionDto[] }>(`/ai/initiatives/${encodeURIComponent(initiativeId)}/risks/suggest`, {});
}

export function assessRisk(payload: { initiativeId: string; title: string; description?: string }): Promise<RiskAssessmentDto> {
  return api.post<RiskAssessmentDto>("/ai/risks/assess", payload);
}

export interface AssessmentInsightsDto {
  respondents: number;
  averageScore: number | null;
  averageNaviIndex: number | null;
  overallReadiness: string;
  summary: string;
  strengths: string[];
  gaps: string[];
  departmentNotes: string[];
  recommendedActions: string[];
  generatedAt: string;
}

export function getAssessmentInsights(assessmentId: string): Promise<AssessmentInsightsDto> {
  return api.post<AssessmentInsightsDto>(`/ai/assessments/${encodeURIComponent(assessmentId)}/insights`, {});
}

export interface KnowledgeSourceDto {
  index: number;
  entryId: string;
  kind: "text" | "file";
  authorName: string;
  originalFileName?: string;
  snippet: string;
  score: number;
  createdAt?: string;
}

export interface KnowledgeAnswerDto {
  answered: boolean;
  answer: string;
  citedSources: number[];
  sources: KnowledgeSourceDto[];
}

export function askKnowledge(initiativeId: string, question: string): Promise<KnowledgeAnswerDto> {
  return api.post<KnowledgeAnswerDto>("/ai/knowledge/ask", { initiativeId, question });
}

export interface StakeholderAnalysisDto {
  overview: string;
  concerns: string[];
  stakeholders: {
    name: string;
    quadrant: "Manage closely" | "Keep satisfied" | "Keep informed" | "Monitor";
    strategy: string;
    frequency: string;
    channel: string;
    keyMessage: string;
  }[];
  generatedAt: string;
}

export function analyzeStakeholders(initiativeId: string): Promise<StakeholderAnalysisDto> {
  return api.post<StakeholderAnalysisDto>(`/ai/initiatives/${encodeURIComponent(initiativeId)}/stakeholders/analyze`, {});
}

export interface AdoptionExplanationDto {
  overview: string;
  milestones: {
    milestone: string;
    assessment: "Achieved" | "Ahead" | "On pace" | "Behind" | "Overdue" | "Not started";
    explanation: string;
    suggestion: string;
  }[];
  interventions: string[];
  generatedAt: string;
}

export function explainAdoption(initiativeId: string): Promise<AdoptionExplanationDto> {
  return api.post<AdoptionExplanationDto>(`/ai/initiatives/${encodeURIComponent(initiativeId)}/adoption/explain`, {});
}

export function getInitiativeHealth(initiativeId: string): Promise<InitiativeHealthDto> {
  return api.post<InitiativeHealthDto>(`/ai/initiatives/${encodeURIComponent(initiativeId)}/health`, {});
}
