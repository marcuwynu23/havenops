import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export type ButtonVariant =
  | "primary"
  | "highlight"
  | "ghost"
  | "danger"
  | "subtle";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-foreground hover:brightness-110 disabled:opacity-50",
  highlight:
    "bg-highlight text-highlight-foreground shadow-sm hover:brightness-105 disabled:opacity-50",
  ghost:
    "border border-border bg-transparent text-muted hover:border-muted hover:text-foreground",
  danger:
    "border border-danger/40 bg-danger/20 text-danger-foreground hover:bg-danger/30",
  subtle:
    "bg-overlay-subtle text-foreground hover:bg-overlay-muted",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "text-xs px-2.5 py-1.5",
  md: "text-sm px-4 py-2",
  lg: "text-base px-5 py-2.5",
};

/** Use on `<Link>` (or `<a>`) to match `Button` visuals. */
export function buttonClassName(
  opts: {
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
  } = {},
) {
  const { variant = "primary", size = "md", className } = opts;
  return cn(
    "inline-flex cursor-pointer items-center justify-center rounded-md font-semibold no-underline transition-colors hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-muted",
    variantClass[variant],
    sizeClass[size],
    className,
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "md",
      type = "button",
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex cursor-pointer items-center justify-center rounded-md font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-muted disabled:pointer-events-none",
          variantClass[variant],
          sizeClass[size],
          className,
        )}
        {...props}
      />
    );
  },
);
