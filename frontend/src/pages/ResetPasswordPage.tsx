import { type FormEvent, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { authRecoveryReset } from "../api";
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

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [token, setToken] = useState(params.get("token") ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = params.get("token");
    if (t) setToken(t);
  }, [params]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authRecoveryReset(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
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
        <PageHeader title="Set new password" />
        <Card className="mb-0">
          {done ? (
            <Alert variant="info">
              Password updated.{" "}
              <Link to="/login" className="text-accent">
                Sign in
              </Link>
            </Alert>
          ) : (
            <FormGrid onSubmit={onSubmit}>
              {error ? <Alert className="col-span-full">{error}</Alert> : null}
              <Field label="Recovery token" htmlFor="rst-token">
                <Input
                  id="rst-token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
              </Field>
              <Field label="New password (min 8)" htmlFor="rst-pass">
                <Input
                  id="rst-pass"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </Field>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving…" : "Update password"}
              </Button>
            </FormGrid>
          )}
          <p className="mt-4 text-center text-sm text-muted">
            <Link to="/login" className="text-accent">
              Back to sign in
            </Link>
          </p>
        </Card>
      </div>
    </>
  );
}
