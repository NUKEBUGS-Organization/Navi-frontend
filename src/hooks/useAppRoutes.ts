import { useAuth } from "@/contexts/AuthContext";
import { getAppRoutes, type AppRoutes, type AppRole } from "@/constants/routes";

/** Returns the app route set for the current user (admin → /admin/*, manager → /manager/*, employee → /employee/*). */
export function useAppRoutes(): AppRoutes {
  const { user } = useAuth();
  const role = user?.role as AppRole | undefined;
  return getAppRoutes(role);
}
