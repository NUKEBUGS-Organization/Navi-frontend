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
  /** Change lead's current display name (resolved from their profile by the server). */
  leadName: string;
  /** Change lead's user ID. Missing on older initiatives the server could not match to a user. */
  leadUserId?: string;
  /** Executive / change sponsor (display name). */
  sponsorName?: string;
  /** Set when an admin has archived the initiative (soft delete). */
  archivedAt?: string | null;
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
  adoptionTrackingEnabled?: boolean;
  /** Initiative has Health, Safety & Environment implications. */
  hseImpact?: boolean;
  /** Initiative has food safety implications. */
  foodSafetyImpact?: boolean;
}
