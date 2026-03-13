import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import EmployeeLogin from "../roles/employee/pages/Employee_login";
import Signup from "../roles/employee/pages/Signup";
import AdminDashboard from "../roles/admin/pages/AdminDashboard";
import AdminInitiatives from "../roles/admin/pages/AdminInitiatives";
import AssessmentResults from "../roles/admin/pages/AssessmentResults";
import AdminOrganization from "../roles/admin/pages/AdminOrganization";
import AdminSettings from "../roles/admin/pages/AdminSettings";
import InitiativeDetail from "../roles/admin/pages/InitiativeDetail";
import AdminRoadmap from "../roles/admin/pages/AdminRoadmap";
import AssessmentForm from "../roles/admin/pages/AssessmentForm";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Employee Routes */}
        <Route path="/employee/login" element={<EmployeeLogin />} />
        <Route path="/employee/signup" element={<Signup />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/initiatives" element={<AdminInitiatives />} />
        <Route path="/admin/initiatives/:id" element={<InitiativeDetail />} />

        <Route path="/admin/assessments" element={<AssessmentResults />} />

        <Route path="/admin/roadmap" element={<AdminRoadmap />} />
        <Route path="/admin/organization" element={<AdminOrganization />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/assessments/form" element={<AssessmentForm />} />

        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
