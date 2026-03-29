import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { HydrateCenterSkeleton } from "../skeletons/PageContentSkeletons";
import { loginPathForProtectedRoute } from "../../lib/authRoutes";
import { useAuthStore } from "../../store/authStore";

export function RequireAuth() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);
  const hydrate = useAuthStore((s) => s.hydrate);
  const location = useLocation();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return <HydrateCenterSkeleton className="min-h-screen font-sans" />;
  }
  if (!token) {
    const to = loginPathForProtectedRoute(location.pathname);
    return <Navigate to={to} replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
