import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "../roles/admin/pages/AdminDashboard";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
