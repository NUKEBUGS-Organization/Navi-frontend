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
  email?: string;
  country?: string;
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
  departments?: string[];
}

export interface CreateOrganizationResponse {
  organization: { _id: string; name: string; status?: string; [key: string]: unknown };
  admin: { _id: string; name: string; email: string; role: string; [key: string]: unknown };
}

export function listOrganizations(): Promise<OrganizationListItem[]> {
  return api.get<OrganizationListItem[]>("/organizations");
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
