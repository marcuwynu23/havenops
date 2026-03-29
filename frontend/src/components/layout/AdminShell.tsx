import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "../../lib/cn";
import { SheetDragHandle, sheetPanelClassName } from "../SheetChrome";

export type NavIcon = "home" | "jobs" | "clients" | "team" | "list" | "booking";

export type NavItemConfig = {
  to: string;
  label: string;
  /** Short label for mobile bottom bar (e.g. "Home", "Jobs"). */
  mobileLabel?: string;
  icon?: NavIcon;
  end?: boolean;
};

export type AdminShellProps = {
  brand: string;
  navItems: NavItemConfig[];
  sidebarFooter?: ReactNode;
  children: ReactNode;
  className?: string;
  sidebarClassName?: string;
  mainClassName?: string;
};

function iconPaths(name: NavIcon): ReactNode {
  const common = "stroke-current";
  switch (name) {
    case "home":
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
          className={common}
          fill="none"
        />
      );
    case "jobs":
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M4 7h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"
          className={common}
          fill="none"
        />
      );
    case "clients":
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M17 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
          className={common}
          fill="none"
        />
      );
    case "team":
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M16 20v-1a4 4 0 0 0-3-3.87M8 20v-1a4 4 0 0 1 3-3.87m4-4.13a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z"
          className={common}
          fill="none"
        />
      );
    case "booking":
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"
          className={common}
          fill="none"
        />
      );
    case "list":
    default:
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
          className={common}
          fill="none"
        />
      );
  }
}

function NavGlyph({
  name,
  className,
}: {
  name: NavIcon;
  className?: string;
}) {
  return (
    <svg
      className={cn("h-6 w-6 shrink-0", className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {iconPaths(name)}
    </svg>
  );
}

function MobileAccountSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] lg:hidden" role="presentation">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        className="absolute inset-0 bg-backdrop"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-sheet-title"
        className={cn(
          "absolute inset-x-0 bottom-0",
          sheetPanelClassName(undefined, "alwaysBottomSheet"),
        )}
      >
        <SheetDragHandle className="pt-2 pb-1" hideFrom="never" />
        <div className="border-b border-border px-4 pb-3 pt-1">
          <h2
            id="mobile-sheet-title"
            className="font-display text-lg font-semibold text-foreground"
          >
            {title}
          </h2>
          <p className="text-xs text-muted">Account &amp; appearance</p>
        </div>
        <div className="max-h-[55vh] overflow-y-auto px-4 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  );
}

function PersonGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-6 w-6 shrink-0", className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M20 21a8 8 0 1 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
      />
    </svg>
  );
}

export function AdminShell({
  brand,
  navItems,
  sidebarFooter,
  children,
  className,
  sidebarClassName,
  mainClassName,
}: AdminShellProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const location = useLocation();
  const bottomNavMulti = navItems.length > 1;
  const bottomNavSingle = navItems.length === 1 && Boolean(sidebarFooter);
  const showMobileBottomBar = bottomNavMulti || bottomNavSingle;

  useEffect(() => {
    setSheetOpen(false);
  }, [location.pathname]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium no-underline transition-colors duration-150 hover:no-underline active:scale-[0.98]",
      isActive
        ? "bg-nav-active-bg text-accent shadow-sm"
        : "text-muted hover:bg-nav-hover-bg hover:text-foreground",
    );

  const bottomLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 no-underline transition-colors duration-150 active:scale-95",
      isActive
        ? "text-accent"
        : "text-muted hover:text-foreground",
    );

  return (
    <div
      className={cn(
        /* Fixed viewport height + min-h-0 so <main> can shrink and scroll (mobile long lists). */
        "flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-background",
        "lg:grid lg:h-screen lg:min-h-0 lg:grid-cols-[240px_1fr] lg:overflow-hidden",
        className,
      )}
    >
      {/* —— Mobile top app bar —— */}
      <header
        className={cn(
          "sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-surface/80 lg:hidden",
        )}
        style={{ paddingTop: "max(0px, env(safe-area-inset-top, 0px))" }}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-semibold tracking-tight text-foreground">
            {brand}
          </p>
        </div>
        {sidebarFooter ? (
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-overlay-subtle text-foreground transition-colors hover:bg-overlay-muted",
            )}
            aria-label="Open account menu"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        ) : null}
      </header>

      {/* —— Desktop sidebar —— */}
      <aside
        className={cn(
          "hidden min-h-0 flex-col gap-1 overflow-y-auto border-border bg-surface p-3 lg:flex lg:border-r",
          sidebarClassName,
        )}
      >
        <div className="mb-3 px-2 pt-1">
          <p className="font-display text-xl font-semibold tracking-tight text-foreground">
            {brand}
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5" aria-label="Main">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={linkClass}
            >
              {item.icon ? (
                <NavGlyph
                  name={item.icon}
                  className="h-5 w-5 opacity-90"
                />
              ) : null}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        {sidebarFooter ? (
          <div className="mt-auto border-t border-border pt-4">
            {sidebarFooter}
          </div>
        ) : null}
      </aside>

      {/* —— Main content —— */}
      <main
        className={cn(
          "min-h-0 w-full min-w-0 flex-1 overflow-y-auto overscroll-contain",
          showMobileBottomBar
            ? "pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] lg:pb-10"
            : "pb-6 max-lg:pb-[calc(1rem+env(safe-area-inset-bottom,0px))] lg:pb-10",
          "w-full max-w-none px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6",
          mainClassName,
        )}
      >
        {children}
      </main>

      {/* —— Mobile bottom navigation (Material-style) —— */}
      {showMobileBottomBar ? (
        <nav
          className={cn(
            "fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom,0px)] pt-1 shadow-[0_-4px_24px_-10px_rgba(0,0,0,0.15)] backdrop-blur-md supports-[backdrop-filter]:bg-surface/90 lg:hidden",
          )}
          aria-label="Primary"
        >
          <div className="mx-auto flex h-[3.5rem] max-w-lg items-stretch justify-around gap-0.5 px-1">
            {navItems.map((item) => {
              const icon = item.icon ?? "list";
              const short =
                item.mobileLabel ??
                (item.label.length > 10
                  ? item.label.slice(0, 9) + "…"
                  : item.label);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={bottomLinkClass}
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={cn(
                          "flex h-8 w-14 items-center justify-center rounded-2xl transition-colors",
                          isActive
                            ? "bg-nav-active-bg text-accent"
                            : "text-muted",
                        )}
                      >
                        <NavGlyph name={icon} className="h-6 w-6" />
                      </span>
                      <span
                        className={cn(
                          "max-w-[4.5rem] truncate text-center text-[10px] font-semibold leading-tight tracking-wide",
                          isActive ? "text-accent" : "text-muted",
                        )}
                      >
                        {short}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            })}
            {bottomNavSingle ? (
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="flex min-h-[3.25rem] min-w-0 flex-1 max-w-[5.5rem] flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-muted transition-colors active:scale-95 touch-manipulation hover:text-foreground"
                aria-label="Account and settings"
              >
                <span className="flex h-8 w-14 items-center justify-center rounded-2xl text-muted">
                  <PersonGlyph />
                </span>
                <span className="max-w-[4.5rem] truncate text-center text-[10px] font-semibold leading-tight tracking-wide">
                  Account
                </span>
              </button>
            ) : null}
          </div>
        </nav>
      ) : null}

      {sidebarFooter ? (
        <MobileAccountSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title={brand}
        >
          {sidebarFooter}
        </MobileAccountSheet>
      ) : null}
    </div>
  );
}
