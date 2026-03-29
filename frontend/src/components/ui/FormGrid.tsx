import { type FormHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function FormGrid({
  className,
  ...props
}: FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form
      className={cn("grid w-full max-w-md gap-3", className)}
      {...props}
    />
  );
}
