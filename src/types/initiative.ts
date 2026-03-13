export type InitiativeStatus = "ACTIVE" | "DRAFT" | "PLANNING" | "In Progress" | "Active" | "Draft" | "Planning";

export interface InitiativeGoal {
  goal?: string;
  metric?: string;
  objective?: string;
  kpi?: string;
  targetDate?: string;
  status?: "On Track" | "In Progress" | "Planned";
}

export interface InitiativeSummary {
  id?: string;
  status: InitiativeStatus;
  readiness?: string;
  title: string;
  leadName: string;
  dateRange: string;
  departments?: string[];
  tags?: string[];
  progress: number;
  goals?: InitiativeGoal[];
}
