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

export interface InitiativeDraftDto {
  title: string;
  description: string;
  changeType: string;
  goals: { goal: string; metric: string }[];
  faqs: { question: string; answer: string }[];
  departments: string[];
  wholeOrganization: boolean;
  hseImpact: boolean;
  foodSafetyImpact: boolean;
  durationWeeks: number;
}

export function draftInitiative(idea: string, departments: string[]): Promise<InitiativeDraftDto> {
  return api.post<InitiativeDraftDto>("/ai/initiatives/draft", { idea, departments });
}

export function draftKudos(payload: {
  initiativeId: string;
  employeeId: string;
  roughNote?: string;
  tone?: "Warm" | "Formal" | "Enthusiastic";
}): Promise<{ note: string }> {
  return api.post<{ note: string }>("/ai/kudos/draft", payload);
}

export interface GeneratedAssessmentStepDto {
  title: string;
  questions: string[];
  pillars: ("N" | "A" | "V" | "I")[];
}

export function generateAssessment(payload: {
  initiativeId?: string;
  audience: "Leadership" | "Employees";
  stage: "Pre-change" | "During change" | "Post-change";
  questionsPerPillar: number;
  focus?: string;
}): Promise<{ steps: GeneratedAssessmentStepDto[] }> {
  return api.post<{ steps: GeneratedAssessmentStepDto[] }>("/ai/assessments/generate", payload);
}

export interface ChatMessageDto {
  role: "user" | "assistant";
  content: string;
}

export function chatWithNavi(
  messages: ChatMessageDto[],
  currentInitiativeId?: string,
): Promise<{ reply: string; toolsUsed: string[] }> {
  return api.post<{ reply: string; toolsUsed: string[] }>("/ai/chat", { messages, currentInitiativeId });
}

export function getInitiativeHealth(initiativeId: string): Promise<InitiativeHealthDto> {
  return api.post<InitiativeHealthDto>(`/ai/initiatives/${encodeURIComponent(initiativeId)}/health`, {});
}
