export type AppRole = "admin" | "manager" | "employee";

/** Route set for org app (admin/manager/employee). Use getAppRoutes(role) for current user. */
export interface AppRoutes {
  BASE: string;
  DASHBOARD: string;
  INITIATIVES: string;
  INITIATIVE_DETAIL: (id: string) => string;
  ASSESSMENTS: string;
  ASSESSMENTS_FORM: string;
  ROADMAP: string;
  ORGANIZATION: string;
  SETTINGS: string;
  STAKEHOLDERS: string;
  COMMUNICATIONS: string;
  ADOPTION: string;
  RISKS: string;
  KUDOS: string;
  KNOWLEDGE_HUB: string;
}

export const ROUTES = {
  HOME: "/",

  // Auth
  AUTH_LOGIN: "/login",
  AUTH_SIGNUP: "/signup",
  AUTH_FORGOT_PASSWORD: "/forgot-password",

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
  ADMIN_KUDOS: "/admin/kudos",
  ADMIN_KNOWLEDGE_HUB: "/admin/knowledge-hub",

  // Manager (same app, different URL prefix)
  MANAGER: "/manager",
  MANAGER_DASHBOARD: "/manager/dashboard",
  MANAGER_INITIATIVES: "/manager/initiatives",
  MANAGER_INITIATIVE_DETAIL: (id: string) => `/manager/initiatives/${id}`,
  MANAGER_ASSESSMENTS: "/manager/assessments",
  MANAGER_ASSESSMENTS_FORM: "/manager/assessments/form",
  MANAGER_ROADMAP: "/manager/roadmap",
  MANAGER_ORGANIZATION: "/manager/organization",
  MANAGER_SETTINGS: "/manager/settings",
  MANAGER_STAKEHOLDERS: "/manager/stakeholders",
  MANAGER_COMMUNICATIONS: "/manager/communications",
  MANAGER_ADOPTION: "/manager/adoption",
  MANAGER_RISKS: "/manager/risks",
  MANAGER_KUDOS: "/manager/kudos",
  MANAGER_KNOWLEDGE_HUB: "/manager/knowledge-hub",

  // Employee (same app, different URL prefix)
  EMPLOYEE_APP: "/employee",
  EMPLOYEE_DASHBOARD: "/employee/dashboard",
  EMPLOYEE_INITIATIVES: "/employee/initiatives",
  EMPLOYEE_INITIATIVE_DETAIL: (id: string) => `/employee/initiatives/${id}`,
  EMPLOYEE_ASSESSMENTS: "/employee/assessments",
  EMPLOYEE_ASSESSMENTS_FORM: "/employee/assessments/form",
  EMPLOYEE_ROADMAP: "/employee/roadmap",
  EMPLOYEE_ORGANIZATION: "/employee/organization",
  EMPLOYEE_SETTINGS: "/employee/settings",
  EMPLOYEE_STAKEHOLDERS: "/employee/stakeholders",
  EMPLOYEE_COMMUNICATIONS: "/employee/communications",
  EMPLOYEE_ADOPTION: "/employee/adoption",
  EMPLOYEE_RISKS: "/employee/risks",
  EMPLOYEE_KUDOS: "/employee/kudos",
  EMPLOYEE_KNOWLEDGE_HUB: "/employee/knowledge-hub",
} as const;

const ADMIN_APP_ROUTES: AppRoutes = {
  BASE: ROUTES.ADMIN,
  DASHBOARD: ROUTES.ADMIN_DASHBOARD,
  INITIATIVES: ROUTES.ADMIN_INITIATIVES,
  INITIATIVE_DETAIL: ROUTES.ADMIN_INITIATIVE_DETAIL,
  ASSESSMENTS: ROUTES.ADMIN_ASSESSMENTS,
  ASSESSMENTS_FORM: ROUTES.ADMIN_ASSESSMENTS_FORM,
  ROADMAP: ROUTES.ADMIN_ROADMAP,
  ORGANIZATION: ROUTES.ADMIN_ORGANIZATION,
  SETTINGS: ROUTES.ADMIN_SETTINGS,
  STAKEHOLDERS: ROUTES.ADMIN_STAKEHOLDERS,
  COMMUNICATIONS: ROUTES.ADMIN_COMMUNICATIONS,
  ADOPTION: ROUTES.ADMIN_ADOPTION,
  RISKS: ROUTES.ADMIN_RISKS,
  KUDOS: ROUTES.ADMIN_KUDOS,
  KNOWLEDGE_HUB: ROUTES.ADMIN_KNOWLEDGE_HUB,
};

const MANAGER_APP_ROUTES: AppRoutes = {
  BASE: ROUTES.MANAGER,
  DASHBOARD: ROUTES.MANAGER_DASHBOARD,
  INITIATIVES: ROUTES.MANAGER_INITIATIVES,
  INITIATIVE_DETAIL: ROUTES.MANAGER_INITIATIVE_DETAIL,
  ASSESSMENTS: ROUTES.MANAGER_ASSESSMENTS,
  ASSESSMENTS_FORM: ROUTES.MANAGER_ASSESSMENTS_FORM,
  ROADMAP: ROUTES.MANAGER_ROADMAP,
  ORGANIZATION: ROUTES.MANAGER_ORGANIZATION,
  SETTINGS: ROUTES.MANAGER_SETTINGS,
  STAKEHOLDERS: ROUTES.MANAGER_STAKEHOLDERS,
  COMMUNICATIONS: ROUTES.MANAGER_COMMUNICATIONS,
  ADOPTION: ROUTES.MANAGER_ADOPTION,
  RISKS: ROUTES.MANAGER_RISKS,
  KUDOS: ROUTES.MANAGER_KUDOS,
  KNOWLEDGE_HUB: ROUTES.MANAGER_KNOWLEDGE_HUB,
};

const EMPLOYEE_APP_ROUTES: AppRoutes = {
  BASE: ROUTES.EMPLOYEE_APP,
  DASHBOARD: ROUTES.EMPLOYEE_DASHBOARD,
  INITIATIVES: ROUTES.EMPLOYEE_INITIATIVES,
  INITIATIVE_DETAIL: ROUTES.EMPLOYEE_INITIATIVE_DETAIL,
  ASSESSMENTS: ROUTES.EMPLOYEE_ASSESSMENTS,
  ASSESSMENTS_FORM: ROUTES.EMPLOYEE_ASSESSMENTS_FORM,
  ROADMAP: ROUTES.EMPLOYEE_ROADMAP,
  ORGANIZATION: ROUTES.EMPLOYEE_ORGANIZATION,
  SETTINGS: ROUTES.EMPLOYEE_SETTINGS,
  STAKEHOLDERS: ROUTES.EMPLOYEE_STAKEHOLDERS,
  COMMUNICATIONS: ROUTES.EMPLOYEE_COMMUNICATIONS,
  ADOPTION: ROUTES.EMPLOYEE_ADOPTION,
  RISKS: ROUTES.EMPLOYEE_RISKS,
  KUDOS: ROUTES.EMPLOYEE_KUDOS,
  KNOWLEDGE_HUB: ROUTES.EMPLOYEE_KNOWLEDGE_HUB,
};

/** Returns the app route set for the given role (admin → /admin/*, manager → /manager/*, employee → /employee/*). */
export function getAppRoutes(role: AppRole | undefined): AppRoutes {
  switch (role) {
    case "manager":
      return MANAGER_APP_ROUTES;
    case "employee":
      return EMPLOYEE_APP_ROUTES;
    case "admin":
    default:
      return ADMIN_APP_ROUTES;
  }
}

/** Redirect path after login for org roles (admin/manager/employee). */
export function getAppDashboardRoute(role: AppRole | "super_admin" | undefined): string {
  if (role === "super_admin") return ROUTES.SUPER_ADMIN_DASHBOARD;
  return getAppRoutes(role as AppRole).DASHBOARD;
}
