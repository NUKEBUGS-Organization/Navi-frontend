import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "@/constants";
import Login from "@/roles/employee/pages/Employee_login";
import SignupLead from "@/roles/employee/pages/Signup";
import AdminDashboard from "@/roles/admin/pages/AdminDashboard";
import AdminInitiatives from "@/roles/admin/pages/AdminInitiatives";
import AssessmentResults from "@/roles/admin/pages/AssessmentResults";
import AdminOrganization from "@/roles/admin/pages/AdminOrganization";
import AdminSettings from "@/roles/admin/pages/AdminSettings";
import InitiativeDetail from "@/roles/admin/pages/InitiativeDetail";
import AdminRoadmap from "@/roles/admin/pages/AdminRoadmap";
import AssessmentForm from "@/roles/admin/pages/AssessmentForm";
import SuperAdminDashboard from "@/roles/super-admin/pages/SuperAdminDashboard";
import Organizations from "@/roles/super-admin/pages/Organizations";
import SuperAdminSettings from "@/roles/super-admin/pages/SuperAdminSettings";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.AUTH_LOGIN} replace />} />

        {/* Auth (single login/signup) */}
        <Route path={ROUTES.AUTH_LOGIN} element={<Login />} />
        <Route path={ROUTES.AUTH_SIGNUP} element={<SignupLead />} />
        {/* Legacy employee paths redirect to new ones */}
        <Route path={ROUTES.EMPLOYEE_LOGIN} element={<Navigate to={ROUTES.AUTH_LOGIN} replace />} />
        <Route path={ROUTES.EMPLOYEE_SIGNUP} element={<Navigate to={ROUTES.AUTH_SIGNUP} replace />} />

        {/* Super admin */}
        <Route path={ROUTES.SUPER_ADMIN_DASHBOARD} element={<SuperAdminDashboard />} />
        <Route path={ROUTES.SUPER_ADMIN_ORGS} element={<Organizations />} />
        <Route path={ROUTES.SUPER_ADMIN_SETTINGS} element={<SuperAdminSettings />} />
        {/* Org admin */}
        <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
        <Route path={ROUTES.ADMIN_INITIATIVES} element={<AdminInitiatives />} />
        <Route path="/admin/initiatives/:id" element={<InitiativeDetail />} />
        <Route path={ROUTES.ADMIN_ASSESSMENTS} element={<AssessmentResults />} />
        <Route path={ROUTES.ADMIN_ASSESSMENTS_FORM} element={<AssessmentForm />} />
        <Route path={ROUTES.ADMIN_ROADMAP} element={<AdminRoadmap />} />
        <Route path={ROUTES.ADMIN_ORGANIZATION} element={<AdminOrganization />} />
        <Route path={ROUTES.ADMIN_SETTINGS} element={<AdminSettings />} />
        <Route path={ROUTES.ADMIN} element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
