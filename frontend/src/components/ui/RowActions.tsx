import { type HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function RowActions({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      {...props}
    />
  );
}
