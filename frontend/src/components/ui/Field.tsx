import { type LabelHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/cn";

export type FieldProps = Omit<LabelHTMLAttributes<HTMLLabelElement>, "children"> & {
  label: string;
  htmlFor?: string;
  children: ReactNode;
};

export function Field({
  label,
  htmlFor,
  children,
  className,
  ...props
}: FieldProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "flex flex-col gap-1.5 text-xs text-muted sm:text-sm",
        className,
      )}
      {...props}
    >
      {label}
      {children}
    </label>
  );
}
