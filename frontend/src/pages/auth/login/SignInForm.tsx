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
  const [showPassword, setShowPassword] = useState(false);
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
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-muted transition-colors hover:text-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    >
                      <path
                        d="M3 3l18 18M10.58 10.58A2 2 0 0013.4 13.4M9.88 5.09A10.94 10.94 0 0112 5c5 0 9.27 3.11 11 7-1.02 2.29-2.85 4.21-5.18 5.3M6.61 6.61C4.63 7.79 3.08 9.64 2 12c.78 1.75 2.03 3.29 3.61 4.39"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    >
                      <path
                        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="1.75"
                      />
                    </svg>
                  )}
                </button>
              </div>
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
