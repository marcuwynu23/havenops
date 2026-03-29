import { type HTMLAttributes } from "react";
import type { JobStatus } from "../../types/models";
import { cn } from "../../lib/cn";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "neutral" | "success" | "warning" | "danger";
};

const badgeVariant: Record<NonNullable<BadgeProps["variant"]>, string> = {
  neutral: "bg-status-pending-bg text-muted",
  success: "bg-status-assigned-bg text-status-assigned-fg",
  warning: "bg-status-progress-bg text-status-progress-fg",
  danger: "bg-status-cancelled-bg text-status-cancelled-fg",
};

export function Badge({
  variant = "neutral",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize",
        badgeVariant[variant],
        className,
      )}
      {...props}
    />
  );
}

const jobStatusStyle: Record<JobStatus, string> = {
  pending: "bg-status-pending-bg text-muted",
  assigned: "bg-status-assigned-bg text-status-assigned-fg",
  in_progress: "bg-status-progress-bg text-status-progress-fg",
  done: "bg-status-done-bg text-status-done-fg",
  cancelled: "bg-status-cancelled-bg text-status-cancelled-fg",
};

export type JobStatusBadgeProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children"
> & {
  status: JobStatus;
};

export function JobStatusBadge({
  status,
  className,
  ...props
}: JobStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize",
        jobStatusStyle[status],
        className,
      )}
      {...props}
    >
      {status.replace("_", " ")}
    </span>
  );
}
