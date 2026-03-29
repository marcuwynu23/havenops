import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { authRecoveryRequest } from "../../../api";
import { ThemePreferenceControl } from "../../../components/ThemePreferenceControl";
import {
  Alert,
  Button,
  Card,
  Field,
  FormGrid,
  Input,
  Muted,
  PageHeader,
} from "../../../components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setToken(null);
    setLoading(true);
    try {
      const res = await authRecoveryRequest(email);
      setMessage(res.message);
      if (res.recovery_token) setToken(res.recovery_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
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
        <PageHeader
          title="Password recovery"
          description="We’ll send a reset token when the API is configured to expose it (dev), or use your internal process in production."
        />
        <Card className="mb-0">
          <FormGrid onSubmit={onSubmit}>
            {error ? <Alert className="col-span-full">{error}</Alert> : null}
            {message ? (
              <Alert variant="info" className="col-span-full">
                {message}
              </Alert>
            ) : null}
            {token ? (
              <Alert variant="warning" className="col-span-full">
                <strong>Dev token:</strong>{" "}
                <code className="break-all text-xs">{token}</code>
                <Muted className="mt-2">
                  Set <code>HAVENOPS_EXPOSE_RECOVERY_TOKEN=1</code> on the API
                  to receive this. Use it on the reset page.
                </Muted>
              </Alert>
            ) : null}
            <Field label="Email" htmlFor="rec-email">
              <Input
                id="rec-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Sending…" : "Request reset"}
            </Button>
          </FormGrid>
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
