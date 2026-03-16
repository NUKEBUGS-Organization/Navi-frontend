import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/api/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { token, user, isReady, isLoading } = useAuth();
  const location = useLocation();

  if (!isReady || isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#F7F8FA",
        }}
      >
        <span>Loading...</span>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to={ROUTES.AUTH_LOGIN} state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const redirect =
      user.role === "super_admin"
        ? ROUTES.SUPER_ADMIN_DASHBOARD
        : ROUTES.ADMIN_DASHBOARD;
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
}
