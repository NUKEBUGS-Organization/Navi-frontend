import { api } from "./client";

export type OrganizationStatus = "ACTIVE" | "PENDING" | "DISABLED";

export interface OrganizationListItem {
  id: string;
  name: string;
  adminName: string;
  status: OrganizationStatus;
  createdAt: string;
  departments: string[];
  departmentCount: number;
  employeeCount: number;
  /** Max employees org admins/managers may add (super admin can change). */
  maxEmployeeSeats?: number;
  pendingEmployeeCount?: number;
  email?: string;
  country?: string;
  industry?: string;
  adminId?: string;
  adminEmail?: string;
  adminLastActiveAt?: string | null;
}

export interface CreateOrganizationPayload {
  organizationName: string;
  organizationOwner: string;
  organizationEmail: string;
  phoneNumber?: string;
  adminEmail: string;
  adminPassword: string;
  city?: string;
  country?: string;
  industry?: string;
  employeeCount?: number;
  maxEmployeeSeats?: number;
  departments?: string[];
  /** Marks a public signup lead as converted after org is created. */
  sourceLeadId?: string;
}

export interface CreateOrganizationResponse {
  organization: { _id: string; name: string; status?: string; [key: string]: unknown };
  admin: { _id: string; name: string; email: string; role: string; [key: string]: unknown };
}

export function listOrganizations(): Promise<OrganizationListItem[]> {
  return api.get<OrganizationListItem[]>("/organizations");
}

/** Super admin: PATCH /organizations/:id */
export function patchOrganizationById(
  organizationId: string,
  payload: { maxEmployeeSeats?: number; name?: string; employeeCount?: number; industry?: string }
): Promise<MyOrganization> {
  return api.patch<MyOrganization>(`/organizations/${organizationId}`, payload);
}

export interface MyOrganization {
  _id: string;
  name: string;
  description?: string;
  industry?: string;
  email?: string;
  phoneNumber?: string;
  city?: string;
  country?: string;
  employeeCount?: number;
  pendingEmployeeCount?: number;
  /** Max active employees for this org (enforced on create). */
  maxEmployeeSeats?: number;
  logo?: string;
  departments?: string[];
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function getMyOrganization(): Promise<MyOrganization> {
  return api.get<MyOrganization>("/organizations/me");
}

export interface UpdateOrganizationPayload {
  name?: string;
  description?: string;
  industry?: string;
  email?: string;
  phoneNumber?: string;
  city?: string;
  country?: string;
  employeeCount?: number;
  logo?: string;
  departments?: string[];
}

export function updateMyOrganization(
  payload: UpdateOrganizationPayload
): Promise<MyOrganization> {
  return api.patch<MyOrganization>("/organizations/me", payload);
}

export function createOrganization(
  payload: CreateOrganizationPayload
): Promise<CreateOrganizationResponse> {
  return api.post<CreateOrganizationResponse>("/organizations", payload);
}

export interface OrganizationSignupRequestPayload {
  organizationName: string;
  organizationContact: string;
  email: string;
  phoneNumber?: string;
  city?: string;
  country?: string;
  industry?: string;
  employeeCount?: string;
  hearAboutUs?: string;
}

export function submitOrganizationSignupRequest(
  payload: OrganizationSignupRequestPayload
): Promise<{ notified: boolean; message: string }> {
  return api.post("/organizations/signup-request", payload);
}

export interface OrganizationSignupLead {
  id: string;
  organizationName: string;
  organizationContact: string;
  email: string;
  phoneNumber?: string;
  city?: string;
  country?: string;
  industry?: string;
  employeeCount?: string;
  hearAboutUs?: string;
  status: string;
  createdAt: string;
}

export function listSignupLeads(): Promise<OrganizationSignupLead[]> {
  return api.get<OrganizationSignupLead[]>("/organizations/signup-leads");
}

export function getSignupLead(leadId: string): Promise<OrganizationSignupLead> {
  return api.get<OrganizationSignupLead>(`/organizations/signup-leads/${leadId}`);
}

export function approveOrganizationEmployeeCount(orgId: string): Promise<MyOrganization> {
  return api.post<MyOrganization>(`/organizations/${orgId}/approve-employee-count`, {});
}
