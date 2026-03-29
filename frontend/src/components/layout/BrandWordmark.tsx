import { cn } from "../../lib/cn";

type Props = {
  className?: string;
};

/** Text logotype: bold, no box — “Haven” vs “Ops” use distinct colors. */
export function BrandWordmark({ className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline whitespace-nowrap font-display leading-none",
        className,
      )}
      aria-label="HavenOps"
    >
      <span className="font-bold tracking-tight text-foreground">Haven</span>
      <span className="font-bold tracking-tight text-accent">Ops</span>
    </span>
  );
}
