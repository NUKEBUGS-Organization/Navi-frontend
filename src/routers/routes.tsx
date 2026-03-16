import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "@/constants";
import { ProtectedRoute } from "@/components/auth";
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
import StakeholderMapping from "@/roles/admin/pages/StakeholderMapping";
import CommunicationPlanning from "@/roles/admin/pages/CommunicationPlanning";
import AdoptionTracking from "@/roles/admin/pages/AdoptionTracking";
import RiskMonitoring from "@/roles/admin/pages/RiskMonitoring";
import SuperAdminDashboard from "@/roles/super-admin/pages/SuperAdminDashboard";
import Organizations from "@/roles/super-admin/pages/Organizations";
import SuperAdminSettings from "@/roles/super-admin/pages/SuperAdminSettings";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.AUTH_LOGIN} replace />} />
        <Route path="/dashboard" element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />} />

        {/* Auth (public) */}
        <Route path={ROUTES.AUTH_LOGIN} element={<Login />} />
        <Route path={ROUTES.AUTH_SIGNUP} element={<SignupLead />} />
        <Route path={ROUTES.EMPLOYEE_LOGIN} element={<Navigate to={ROUTES.AUTH_LOGIN} replace />} />
        <Route path={ROUTES.EMPLOYEE_SIGNUP} element={<Navigate to={ROUTES.AUTH_SIGNUP} replace />} />

        {/* Super admin only */}
        <Route
          path={ROUTES.SUPER_ADMIN_DASHBOARD}
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SUPER_ADMIN_ORGS}
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <Organizations />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SUPER_ADMIN_SETTINGS}
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <SuperAdminSettings />
            </ProtectedRoute>
          }
        />

        {/* Admin / Manager / Employee */}
        <Route
          path={ROUTES.ADMIN_DASHBOARD}
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "employee"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_INITIATIVES}
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "employee"]}>
              <AdminInitiatives />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/initiatives/:id"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "employee"]}>
              <InitiativeDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_ASSESSMENTS}
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "employee"]}>
              <AssessmentResults />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_ASSESSMENTS_FORM}
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "employee"]}>
              <AssessmentForm />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_ROADMAP}
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "employee"]}>
              <AdminRoadmap />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_STAKEHOLDERS}
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <StakeholderMapping />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_COMMUNICATIONS}
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <CommunicationPlanning />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_ADOPTION}
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <AdoptionTracking />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_RISKS}
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "employee"]}>
              <RiskMonitoring />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_ORGANIZATION}
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminOrganization />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_SETTINGS}
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "employee"]}>
              <AdminSettings />
            </ProtectedRoute>
          }
        />
        <Route path={ROUTES.ADMIN} element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
