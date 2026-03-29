import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full resize-y rounded-md border border-border bg-field px-3 py-2.5 text-base text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent-muted sm:px-2.5 sm:py-2 sm:text-sm",
          className,
        )}
        {...props}
      />
    );
  },
);
