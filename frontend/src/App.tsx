import { useEffect } from "react";
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { AdminShell, type NavItemConfig } from "./components/layout/AdminShell";
import { RequireAuth } from "./components/auth/RequireAuth";
import { Button } from "./components/ui";
import Dashboard from "./pages/Dashboard";
import ClientsPage from "./pages/ClientsPage";
import JobsPage from "./pages/JobsPage";
import EmployeesPage from "./pages/EmployeesPage";
import EmployeeApp from "./pages/EmployeeApp";
import ClientPortal from "./pages/ClientPortal";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import LandingPage from "./pages/LandingPage";
import { ThemePreferenceControl } from "./components/ThemePreferenceControl";
import { roleHome, useAuthStore } from "./store/authStore";

const ADMIN_NAV: NavItemConfig[] = [
  {
    to: "/dashboard",
    label: "Dashboard",
    mobileLabel: "Home",
    icon: "home",
    end: true,
  },
  { to: "/dashboard/jobs", label: "Jobs", mobileLabel: "Jobs", icon: "jobs" },
  {
    to: "/dashboard/clients",
    label: "Clients",
    mobileLabel: "Clients",
    icon: "clients",
  },
  {
    to: "/dashboard/employees",
    label: "Employees",
    mobileLabel: "Team",
    icon: "team",
  },
];

const EMPLOYEE_NAV: NavItemConfig[] = [
  { to: "/app", label: "My jobs", mobileLabel: "Jobs", icon: "list", end: true },
];

const CLIENT_NAV: NavItemConfig[] = [
  {
    to: "/portal",
    label: "My bookings",
    mobileLabel: "Bookings",
    icon: "booking",
    end: true,
  },
];

function SidebarAccountFooter() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  return (
    <div className="w-full max-w-full space-y-4">
      <ThemePreferenceControl className="w-full" />
      <p className="truncate text-sm text-foreground" title={user?.email}>
        {user?.email}
      </p>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full min-h-11 touch-manipulation"
        onClick={() => {
          logout();
          navigate("/", { replace: true });
        }}
      >
        Log out
      </Button>
    </div>
  );
}

function AdminGate() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;
  if (user.role !== "admin") {
    return <Navigate to={roleHome(user.role)} replace />;
  }
  return (
    <AdminShell
      brand="HavenOps"
      navItems={ADMIN_NAV}
      sidebarFooter={<SidebarAccountFooter />}
    >
      <Outlet />
    </AdminShell>
  );
}

function EmployeeGate() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;
  if (user.role !== "employee") {
    return <Navigate to={roleHome(user.role)} replace />;
  }
  return (
    <AdminShell
      brand="HavenOps"
      navItems={EMPLOYEE_NAV}
      sidebarFooter={<SidebarAccountFooter />}
    >
      <Outlet />
    </AdminShell>
  );
}

function ClientGate() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;
  if (user.role !== "client") {
    return <Navigate to={roleHome(user.role)} replace />;
  }
  return (
    <AdminShell
      brand="HavenOps"
      navItems={CLIENT_NAV}
      sidebarFooter={<SidebarAccountFooter />}
    >
      <Outlet />
    </AdminShell>
  );
}

function CatchAllRedirect() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted">
        Loading…
      </div>
    );
  }
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }
  return <Navigate to={roleHome(user.role)} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<AdminGate />}>
          <Route index element={<Dashboard />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="employees" element={<EmployeesPage />} />
        </Route>
        <Route path="/app" element={<EmployeeGate />}>
          <Route index element={<EmployeeApp />} />
        </Route>
        <Route path="/portal" element={<ClientGate />}>
          <Route index element={<ClientPortal />} />
        </Route>
      </Route>

      <Route path="*" element={<CatchAllRedirect />} />
    </Routes>
  );
}
