import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTES, getAppDashboardRoute } from "@/constants";
import { ProtectedRoute } from "@/components/auth";
import { useAuth } from "@/contexts/AuthContext";
import Login from "@/roles/employee/pages/Employee_login";
import SignupLead from "@/roles/employee/pages/Signup";
import ForgotPassword from "@/roles/employee/pages/ForgotPassword";
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
import Kudos from "@/roles/admin/pages/Kudos";
import KnowledgeHub from "@/roles/admin/pages/KnowledgeHub";
import SuperAdminDashboard from "@/roles/super-admin/pages/SuperAdminDashboard";
import Organizations from "@/roles/super-admin/pages/Organizations";
import SuperAdminSettings from "@/roles/super-admin/pages/SuperAdminSettings";

function DashboardRedirect() {
  const { user } = useAuth();
  const to = getAppDashboardRoute(user?.role);
  return <Navigate to={to} replace />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.AUTH_LOGIN} replace />} />
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* Auth (public) */}
        <Route path={ROUTES.AUTH_LOGIN} element={<Login />} />
        <Route path={ROUTES.AUTH_SIGNUP} element={<SignupLead />} />
        <Route path={ROUTES.AUTH_FORGOT_PASSWORD} element={<ForgotPassword />} />
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
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
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
        <Route
          path={ROUTES.ADMIN_KUDOS}
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Kudos />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_KNOWLEDGE_HUB}
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "employee"]}>
              <KnowledgeHub />
            </ProtectedRoute>
          }
        />
        <Route path={ROUTES.ADMIN} element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />} />

        {/* Manager (same components, /manager/* paths) */}
        <Route path={ROUTES.MANAGER_DASHBOARD} element={<ProtectedRoute allowedRoles={["admin", "manager", "employee"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path={ROUTES.MANAGER_INITIATIVES} element={<ProtectedRoute allowedRoles={["admin", "manager", "employee"]}><AdminInitiatives /></ProtectedRoute>} />
        <Route path="/manager/initiatives/:id" element={<ProtectedRoute allowedRoles={["admin", "manager", "employee"]}><InitiativeDetail /></ProtectedRoute>} />
        <Route path={ROUTES.MANAGER_ASSESSMENTS} element={<ProtectedRoute allowedRoles={["admin", "manager", "employee"]}><AssessmentResults /></ProtectedRoute>} />
        <Route path={ROUTES.MANAGER_ASSESSMENTS_FORM} element={<ProtectedRoute allowedRoles={["admin", "manager", "employee"]}><AssessmentForm /></ProtectedRoute>} />
        <Route path={ROUTES.MANAGER_ROADMAP} element={<ProtectedRoute allowedRoles={["admin", "manager", "employee"]}><AdminRoadmap /></ProtectedRoute>} />
        <Route path={ROUTES.MANAGER_STAKEHOLDERS} element={<ProtectedRoute allowedRoles={["admin", "manager"]}><StakeholderMapping /></ProtectedRoute>} />
        <Route path={ROUTES.MANAGER_COMMUNICATIONS} element={<ProtectedRoute allowedRoles={["admin", "manager"]}><CommunicationPlanning /></ProtectedRoute>} />
        <Route path={ROUTES.MANAGER_ADOPTION} element={<ProtectedRoute allowedRoles={["admin", "manager"]}><AdoptionTracking /></ProtectedRoute>} />
        <Route path={ROUTES.MANAGER_RISKS} element={<ProtectedRoute allowedRoles={["admin", "manager"]}><RiskMonitoring /></ProtectedRoute>} />
        <Route path={ROUTES.MANAGER_ORGANIZATION} element={<ProtectedRoute allowedRoles={["admin"]}><AdminOrganization /></ProtectedRoute>} />
        <Route path={ROUTES.MANAGER_SETTINGS} element={<ProtectedRoute allowedRoles={["admin", "manager", "employee"]}><AdminSettings /></ProtectedRoute>} />
        <Route
          path={ROUTES.MANAGER_KUDOS}
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <Kudos />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MANAGER_KNOWLEDGE_HUB}
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "employee"]}>
              <KnowledgeHub />
            </ProtectedRoute>
          }
        />
        <Route path={ROUTES.MANAGER} element={<Navigate to={ROUTES.MANAGER_DASHBOARD} replace />} />

        {/* Employee (same components, /employee/* paths) */}
        <Route path={ROUTES.EMPLOYEE_DASHBOARD} element={<ProtectedRoute allowedRoles={["admin", "manager", "employee"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path={ROUTES.EMPLOYEE_INITIATIVES} element={<ProtectedRoute allowedRoles={["admin", "manager", "employee"]}><AdminInitiatives /></ProtectedRoute>} />
        <Route path="/employee/initiatives/:id" element={<ProtectedRoute allowedRoles={["admin", "manager", "employee"]}><InitiativeDetail /></ProtectedRoute>} />
        <Route path={ROUTES.EMPLOYEE_ASSESSMENTS} element={<ProtectedRoute allowedRoles={["admin", "manager", "employee"]}><AssessmentResults /></ProtectedRoute>} />
        <Route path={ROUTES.EMPLOYEE_ASSESSMENTS_FORM} element={<ProtectedRoute allowedRoles={["admin", "manager", "employee"]}><AssessmentForm /></ProtectedRoute>} />
        <Route path={ROUTES.EMPLOYEE_ROADMAP} element={<ProtectedRoute allowedRoles={["admin", "manager", "employee"]}><AdminRoadmap /></ProtectedRoute>} />
        <Route path={ROUTES.EMPLOYEE_STAKEHOLDERS} element={<ProtectedRoute allowedRoles={["admin", "manager"]}><StakeholderMapping /></ProtectedRoute>} />
        <Route path={ROUTES.EMPLOYEE_COMMUNICATIONS} element={<ProtectedRoute allowedRoles={["admin", "manager"]}><CommunicationPlanning /></ProtectedRoute>} />
        <Route path={ROUTES.EMPLOYEE_ADOPTION} element={<ProtectedRoute allowedRoles={["admin", "manager"]}><AdoptionTracking /></ProtectedRoute>} />
        <Route path={ROUTES.EMPLOYEE_RISKS} element={<ProtectedRoute allowedRoles={["admin", "manager"]}><RiskMonitoring /></ProtectedRoute>} />
        <Route path={ROUTES.EMPLOYEE_ORGANIZATION} element={<ProtectedRoute allowedRoles={["admin"]}><AdminOrganization /></ProtectedRoute>} />
        <Route path={ROUTES.EMPLOYEE_SETTINGS} element={<ProtectedRoute allowedRoles={["admin", "manager", "employee"]}><AdminSettings /></ProtectedRoute>} />
        <Route
          path={ROUTES.EMPLOYEE_KUDOS}
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <Kudos />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.EMPLOYEE_KNOWLEDGE_HUB}
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "employee"]}>
              <KnowledgeHub />
            </ProtectedRoute>
          }
        />
        <Route path={ROUTES.EMPLOYEE_APP} element={<Navigate to={ROUTES.EMPLOYEE_DASHBOARD} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
