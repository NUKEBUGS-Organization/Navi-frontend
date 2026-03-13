export type OrganizationStatus = "ACTIVE" | "PENDING" | "DISABLED";

export interface OrganizationSummary {
  id: string;
  name: string;
  adminName: string;
  status: OrganizationStatus;
  createdAt: string;
}

// Shape used when a super admin creates a new organization
export interface OrganizationCreateInput {
  organizationName: string;
  organizationOwner: string;
  organizationEmail: string;
  phoneNumber: string;
  adminEmail: string;
  adminPassword: string;
  city: string;
  country: string;
  industry: string;
  employeeCount: number;
}

