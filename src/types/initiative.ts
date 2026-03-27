export type InitiativeStatus =
  | "ACTIVE"
  | "DRAFT"
  | "WAITING_FOR_APPROVAL"
  | "COMPLETED"
  // legacy
  | "PLANNING"
  // UI labels
  | "In Progress"
  | "Active"
  | "Draft"
  | "Planning";

export interface InitiativeGoal {
  goal?: string;
  metric?: string;
  objective?: string;
  kpi?: string;
  targetDate?: string;
  status?: "On Track" | "In Progress" | "Planned";
}

export interface InitiativeFaq {
  question: string;
  answer: string;
}

export interface InitiativeSummary {
  id?: string;
  status: InitiativeStatus;
  readiness?: string;
  title: string;
  description?: string;
  leadName: string;
  dateRange: string;
  departments?: string[];
  tags?: string[];
  progress: number;
  goals?: InitiativeGoal[];
  faqs?: InitiativeFaq[];
  changeType?: string;
  raciAccountableIds?: string[];
  raciResponsibleIds?: string[];
  raciConsultedIds?: string[];
  raciInformedIds?: string[];
}
