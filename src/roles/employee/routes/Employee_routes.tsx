import { Routes, Route, Navigate } from "react-router-dom";
import EmployeeLogin from "../pages/Employee_login";
import Signup from "../pages/Signup";

const EmployeeRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<EmployeeLogin />} />
      <Route path="signup" element={<Signup />} />

      <Route path="*" element={<Navigate to="login" replace />} />
    </Routes>
  );
};

export default EmployeeRoutes;
