import { useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { ThemePreferenceControl } from "../components/ThemePreferenceControl";
import { buttonClassName, Card, CardTitle, Muted } from "../components/ui";
import { roleHome, useAuthStore } from "../store/authStore";

const features = [
  {
    title: "Client portal",
    body: "Homeowners register, book cleanings, and track every job in one calm workspace.",
  },
  {
    title: "Smart scheduling",
    body: "Jobs route to available crew automatically—less juggling, fewer double-bookings.",
  },
  {
    title: "Team-ready",
    body: "Staff sign in to see today’s work and update status from the field.",
  },
];

export default function LandingPage() {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background text-muted">
        Loading…
      </div>
    );
  }

  if (user) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  return (
    <div className="relative min-h-[100dvh] bg-background">
      <ThemePreferenceControl
        showLabel={false}
        className="fixed right-3 top-3 z-[90] w-[9rem] sm:right-5 sm:top-4"
      />

      <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:pt-20">
        <header className="text-center">
          <p className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            HavenOps
          </p>
          <span
            className="mx-auto mt-3 flex h-1 w-16 rounded-full bg-gradient-to-r from-accent to-highlight"
            aria-hidden
          />
          <h1 className="mx-auto mt-6 max-w-2xl font-display text-2xl font-semibold leading-snug text-foreground sm:text-3xl sm:leading-tight">
            Operations software built for residential cleaning teams
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            One place for bookings, assignments, and job status—professional for
            your crew, effortless for your clients.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              to="/register"
              className={buttonClassName({
                variant: "highlight",
                className:
                  "w-full min-h-11 shadow-sm sm:w-auto sm:min-w-[10rem]",
              })}
            >
              Book as a client
            </Link>
            <Link
              to="/login"
              className={buttonClassName({
                variant: "ghost",
                className:
                  "w-full min-h-11 border border-border sm:w-auto sm:min-w-[9rem]",
              })}
            >
              Staff sign in
            </Link>
          </div>
        </header>

        <section className="mt-16 sm:mt-20">
          <h2 className="text-center font-display text-lg font-semibold text-foreground sm:text-xl">
            What you get
          </h2>
          <p className="mx-auto mt-2 max-w-md text-center text-xs text-muted sm:text-sm">
            Designed for a single cleaning business—clear roles, no clutter.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-5">
            {features.map((f) => (
              <li key={f.title}>
                <Card className="mb-0 h-full border-border/80 bg-surface/80 shadow-sm">
                  <CardTitle className="text-base">{f.title}</CardTitle>
                  <Muted className="mt-2 text-xs leading-relaxed sm:text-sm">
                    {f.body}
                  </Muted>
                </Card>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-16 border-t border-border pt-8 text-center">
          <p className="text-xs text-muted sm:text-sm">
            New client?{" "}
            <Link to="/register" className="font-medium text-accent">
              Create an account
            </Link>
            {" · "}
            <Link to="/login" className="text-muted underline-offset-2 hover:text-foreground">
              Sign in
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
