import { type HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Muted({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-xs leading-relaxed text-muted sm:text-sm sm:leading-normal",
        className,
      )}
      {...props}
    />
  );
}
