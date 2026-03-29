import { type HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export type PageHeaderProps = HTMLAttributes<HTMLElement> & {
  title: string;
  description?: string;
};

export function PageHeader({
  title,
  description,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header className={cn("mb-5 sm:mb-6", className)} {...props}>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        <span
          className="h-1 w-14 shrink-0 rounded-full bg-gradient-to-r from-accent to-highlight opacity-90"
          aria-hidden
        />
      </div>
      {description ? (
        <p className="mt-3 text-xs leading-relaxed text-muted sm:text-sm sm:leading-normal">
          {description}
        </p>
      ) : null}
    </header>
  );
}
