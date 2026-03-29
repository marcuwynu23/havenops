import { useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { BrandWordmark } from "../../components/layout/BrandWordmark";
import { ThemePreferenceControl } from "../../components/ThemePreferenceControl";
import { LandingHydrateSkeleton } from "../../components/skeletons/PageContentSkeletons";
import { buttonClassName, Card, CardTitle, Muted } from "../../components/ui";
import { cn } from "../../lib/cn";
import { roleHome, useAuthStore } from "../../store/authStore";

const homeownerBenefits = [
  {
    title: "Book in minutes",
    body: "Pick a time that fits your life. We confirm the details and show up ready to work.",
  },
  {
    title: "The same careful standards",
    body: "Every visit follows a clear checklist so your rooms feel consistently fresh and reset.",
  },
  {
    title: "Stay in the loop",
    body: "See when we’re scheduled, when we’re on the way, and when the job is complete.",
  },
];

const checklist = [
  "Kitchen & baths detailed",
  "Floors vacuumed & mopped",
  "Dusting & surfaces wiped",
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
      <LandingHydrateSkeleton className="min-h-[100dvh] font-sans text-foreground" />
    );
  }

  if (user) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-background text-foreground">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        <div className="absolute -left-40 top-0 h-[28rem] w-[28rem] rounded-full bg-accent/20 blur-[100px]" />
        <div className="absolute -right-32 top-32 h-[22rem] w-[22rem] rounded-full bg-highlight/15 blur-[90px]" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/10 blur-[80px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(97_139_121_/_0.12),transparent)]" />
      </div>

      <ThemePreferenceControl
        showLabel={false}
        className="fixed right-3 top-3 z-[90] w-[9rem] sm:right-5 sm:top-4"
      />

      <header className="relative z-10 border-b border-border/60 bg-surface/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <BrandWordmark className="text-xl sm:text-2xl" />
          <p className="hidden text-xs font-medium uppercase tracking-[0.2em] text-muted sm:block">
            House cleaning
          </p>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:pt-20 lg:pb-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent sm:text-sm">
              House cleaning service provider
            </p>
            <h1 className="mt-4 font-display text-[2rem] font-semibold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
              A cleaner home—delivered with care.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              <BrandWordmark className="relative -top-px mr-0.5 inline-flex align-middle text-[1.05em] sm:text-[1.02em]" />{" "}
              is a
              house cleaning service provider for busy households. We handle
              recurring and one-time visits so you can walk back into a space
              that feels calm, fresh, and truly clean—not another chore on your
              list.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:max-w-md">
              <Link
                to="/register"
                className={buttonClassName({
                  variant: "highlight",
                  size: "lg",
                  className:
                    "w-full min-h-12 justify-center shadow-md sm:min-h-11",
                })}
              >
                Book your first clean
              </Link>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                <Link
                  to="/login/client"
                  className={buttonClassName({
                    variant: "primary",
                    size: "lg",
                    className:
                      "w-full min-h-12 justify-center sm:min-h-11",
                  })}
                >
                  Sign in as Client
                </Link>
                <Link
                  to="/login/employee"
                  className={buttonClassName({
                    variant: "ghost",
                    size: "lg",
                    className:
                      "w-full min-h-12 justify-center border-2 border-border bg-surface/50 sm:min-h-11",
                  })}
                >
                  Sign in as Employee
                </Link>
              </div>
            </div>

            <p className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted sm:text-sm">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-accent"
                  aria-hidden
                />
                Insured & background-checked team
              </span>
              <span className="hidden h-3 w-px bg-border sm:inline" aria-hidden />
              <span className="inline-flex items-center gap-1.5 sm:inline-flex">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-highlight"
                  aria-hidden
                />
                Supplies we bring, standards you’ll notice
              </span>
            </p>
          </div>

          <div className="relative mt-14 lg:mt-0">
            <div
              className={cn(
                "relative overflow-hidden rounded-2xl border border-border/80 bg-surface/90 p-6 shadow-[0_24px_80px_-24px_rgb(0_0_0_/_0.35)]",
                "backdrop-blur-sm sm:p-8",
              )}
            >
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-highlight/10" aria-hidden />
              <p className="font-display text-lg font-semibold text-foreground">
                Typical visit includes
              </p>
              <ul className="mt-5 space-y-3">
                {checklist.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm leading-snug text-foreground sm:text-base"
                  >
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/25 text-accent"
                      aria-hidden
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        className="text-current"
                      >
                        <path
                          d="M2.5 6l2.5 2.5L9.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 rounded-xl border border-border/60 bg-background/50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Next step
                </p>
                <p className="mt-1 text-sm text-foreground">
                  Create a free client account to choose a time and add any
                  special notes for your home.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border/60 bg-surface/30 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="flex flex-wrap items-baseline justify-center gap-x-1.5 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                <span className="text-center">Why homeowners choose</span>
                <BrandWordmark className="shrink-0 text-2xl sm:text-3xl" />
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                Real service, real people—focused on respect for your home and
                your time.
              </p>
            </div>
            <ul className="mt-12 grid gap-5 sm:grid-cols-3 sm:gap-6">
              {homeownerBenefits.map((f) => (
                <li key={f.title}>
                  <Card className="mb-0 h-full border-border/70 bg-background/60 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
                    <CardTitle className="text-lg">{f.title}</CardTitle>
                    <Muted className="mt-3 text-sm leading-relaxed">
                      {f.body}
                    </Muted>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="rounded-2xl border border-border bg-gradient-to-br from-accent/12 via-surface/80 to-highlight/10 p-8 sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div className="max-w-xl">
              <h2 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
                On our cleaning team?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                Crew and leads use the same system to see today’s route, update
                job status, and keep the office aligned—no paperwork in the
                driveway.
              </p>
            </div>
            <div className="mt-6 flex shrink-0 flex-col gap-3 sm:flex-row lg:mt-0 lg:flex-col">
              <Link
                to="/login/employee"
                className={buttonClassName({
                  variant: "primary",
                  size: "lg",
                  className: "min-h-12 justify-center px-8 sm:min-h-11",
                })}
              >
                Sign in as Employee
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border bg-surface/40 py-10 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center sm:px-6 lg:px-8">
          <BrandWordmark className="text-lg sm:text-xl" />
          <p className="max-w-md text-xs leading-relaxed text-muted sm:text-sm">
            Professional house cleaning for homes that deserve more than a quick
            once-over. Questions about pricing or coverage? Book online or sign
            in and we’ll pick up from there.
          </p>
          <nav
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm"
            aria-label="Footer"
          >
            <Link
              to="/register"
              className="font-medium text-accent hover:underline"
            >
              New client: create account
            </Link>
            <span className="text-border" aria-hidden>
              ·
            </span>
            <Link
              to="/login/client"
              className="text-muted hover:text-foreground"
            >
              Sign in as Client
            </Link>
            <span className="text-border" aria-hidden>
              ·
            </span>
            <Link
              to="/login/employee"
              className="text-muted hover:text-foreground"
            >
              Sign in as Employee
            </Link>
            <span className="text-border" aria-hidden>
              ·
            </span>
            <Link to="/login" className="text-muted hover:text-foreground">
              All sign-in options
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
