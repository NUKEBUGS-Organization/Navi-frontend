import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../Pages/Auth/LoginPage";
import EmployeeRoutes from "../roles/employee/routes/Employee_routes";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/employee/*" element={<EmployeeRoutes />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
