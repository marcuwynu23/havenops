import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
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
    return (
      <div className="flex min-h-screen items-center justify-center bg-background font-sans text-muted">
        Loading…
      </div>
    );
  }
  if (!token) {
    const to = loginPathForProtectedRoute(location.pathname);
    return <Navigate to={to} replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
