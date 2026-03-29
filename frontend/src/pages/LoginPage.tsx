import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ThemePreferenceControl } from "../components/ThemePreferenceControl";
import {
  Alert,
  Button,
  Card,
  Field,
  FormGrid,
  Input,
  PageHeader,
} from "../components/ui";
import { roleHome, useAuthStore } from "../store/authStore";

export default function LoginPage() {
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
    if (hydrated && user) {
      navigate(roleHome(user.role), { replace: true });
    }
  }, [hydrated, user, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      const u = useAuthStore.getState().user;
      if (!u) return;
      let target = roleHome(u.role);
      if (
        u.role === "admin" &&
        from &&
        from !== "/login" &&
        from !== "/"
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
      <ThemePreferenceControl
        showLabel={false}
        className="fixed right-3 top-3 z-[90] w-[9rem] sm:right-5 sm:top-4"
      />
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8">
        <PageHeader title="Sign in" description="HavenOps account" />
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
          <p className="mt-4 text-center text-sm text-muted">
            <Link to="/register" className="text-accent">
              Create a client account
            </Link>
            {" · "}
            <Link to="/forgot-password" className="text-accent">
              Forgot password?
            </Link>
          </p>
        </Card>
      </div>
    </>
  );
}
