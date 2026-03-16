
export const ROUTES = {
  HOME: "/",

  // Auth
  AUTH_LOGIN: "/login",
  AUTH_SIGNUP: "/signup",

  // Legacy employee paths (optional aliases)
  EMPLOYEE_LOGIN: "/employee/login",
  EMPLOYEE_SIGNUP: "/employee/signup",

  // Super admin
  SUPER_ADMIN_DASHBOARD: "/super-admin/dashboard",
  SUPER_ADMIN_ORGS: "/super-admin/organizations",
  SUPER_ADMIN_ORG_DETAIL: (id: string) => `/super-admin/organizations/${id}`,
  SUPER_ADMIN_SETTINGS: "/super-admin/settings",

  // Org admin
  ADMIN: "/admin",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_INITIATIVES: "/admin/initiatives",
  ADMIN_INITIATIVE_DETAIL: (id: string) => `/admin/initiatives/${id}`,
  ADMIN_ASSESSMENTS: "/admin/assessments",
  ADMIN_ASSESSMENTS_FORM: "/admin/assessments/form",
  ADMIN_ROADMAP: "/admin/roadmap",
  ADMIN_ORGANIZATION: "/admin/organization",
  ADMIN_SETTINGS: "/admin/settings",
  ADMIN_STAKEHOLDERS: "/admin/stakeholders",
  ADMIN_COMMUNICATIONS: "/admin/communications",
  ADMIN_ADOPTION: "/admin/adoption",
  ADMIN_RISKS: "/admin/risks",
} as const;
