import { Link } from "react-router-dom";
import { ThemePreferenceControl } from "../../../components/ThemePreferenceControl";
import {
  buttonClassName,
  Card,
  CardTitle,
  Muted,
  PageHeader,
} from "../../../components/ui";

/**
 * Chooser: client vs staff sign-in entry points.
 */
export default function LoginPage() {
  return (
    <>
      <ThemePreferenceControl
        showLabel={false}
        className="fixed right-3 top-3 z-[90] w-[9rem] sm:right-5 sm:top-4"
      />
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8">
        <PageHeader
          title="Sign in"
          description="Choose how you use HavenOps."
        />
        <div className="grid gap-4">
          <Link to="/login/client" className="block rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            <Card className="mb-0 h-full border-border/80 bg-surface/80 transition-colors hover:border-accent/40">
              <CardTitle className="text-base">Client portal</CardTitle>
              <Muted className="mt-2 text-sm leading-relaxed">
                Book cleanings and track jobs for your home.
              </Muted>
              <span
                className={buttonClassName({
                  variant: "highlight",
                  className: "mt-4 w-full min-h-11",
                })}
              >
                Continue as client
              </span>
            </Card>
          </Link>
          <Link
            to="/login/employee"
            className="block rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Card className="mb-0 h-full border-border/80 bg-surface/80 transition-colors hover:border-accent/40">
              <CardTitle className="text-base">Staff account</CardTitle>
              <Muted className="mt-2 text-sm leading-relaxed">
                Crew and managers: view assignments and update job status.
              </Muted>
              <span
                className={buttonClassName({
                  variant: "ghost",
                  className:
                    "mt-4 w-full min-h-11 border border-border bg-transparent",
                })}
              >
                Continue as staff
              </span>
            </Card>
          </Link>
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          New homeowner?{" "}
          <Link to="/register" className="text-accent">
            Create a client account
          </Link>
        </p>
      </div>
    </>
  );
}
