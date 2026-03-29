import { type FormEvent, useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BrandWordmark } from "../../../components/layout/BrandWordmark";
import { ThemePreferenceControl } from "../../../components/ThemePreferenceControl";
import {
  Alert,
  Button,
  Card,
  Field,
  FormGrid,
  Input,
  PageHeader,
} from "../../../components/ui";
import type { Role } from "../../../types/auth";
import { roleHome, useAuthStore } from "../../../store/authStore";
import { cn } from "../../../lib/cn";

export type SignInFormProps = {
  title: string;
  description: string;
  footer: ReactNode;
  /** Only these roles may finish sign-in here; others are logged out immediately with an error. */
  allowedRoles: Role[];
  /** HavenOps wordmark in the corner, linking to the marketing home page. */
  brandLinkToHome?: boolean;
};

export function SignInForm({
  title,
  description,
  footer,
  allowedRoles,
  brandLinkToHome,
}: SignInFormProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const hydrate = useAuthStore((s) => s.hydrate);
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    if (user && !allowedRoles.includes(user.role)) {
      useAuthStore.getState().logout();
      return;
    }
    if (user) {
      navigate(roleHome(user.role), { replace: true });
    }
  }, [hydrated, user, navigate, allowedRoles]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      const u = useAuthStore.getState().user;
      if (!u) return;
      if (!allowedRoles.includes(u.role)) {
        useAuthStore.getState().logout();
        if (allowedRoles.includes("client")) {
          setError(
            "This page is for client accounts. Use Staff sign in if you work for HavenOps.",
          );
        } else {
          setError(
            "This page is for staff and managers. Use Client sign in if you book cleanings as a homeowner.",
          );
        }
        return;
      }
      let target = roleHome(u.role);
      if (
        u.role === "admin" &&
        from &&
        from !== "/login" &&
        !from.startsWith("/login/")
      ) {
        target = from;
      }
      navigate(target, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {brandLinkToHome ? (
        <Link
          to="/"
          className={cn(
            "fixed left-4 z-[95] no-underline transition-opacity hover:opacity-90",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-muted",
            "top-[max(0.75rem,env(safe-area-inset-top,0px))] sm:left-6 sm:top-[max(1rem,env(safe-area-inset-top,0px))]",
          )}
        >
          <BrandWordmark className="text-lg sm:text-xl" />
        </Link>
      ) : null}
      <ThemePreferenceControl
        showLabel={false}
        className="fixed right-3 top-3 z-[90] w-[9rem] sm:right-5 sm:top-4"
      />
      <div
        className={cn(
          "mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8",
          brandLinkToHome && "pt-14 sm:pt-16",
        )}
      >
        <PageHeader title={title} description={description} />
        <Card className="mb-0">
          <FormGrid onSubmit={onSubmit}>
            {error ? <Alert className="col-span-full">{error}</Alert> : null}
            <Field label="Email" htmlFor="login-email">
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            <Field label="Password" htmlFor="login-password">
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </FormGrid>
          {footer}
        </Card>
      </div>
    </>
  );
}
