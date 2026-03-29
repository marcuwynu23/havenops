import {
  useEffect,
  useId,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../lib/cn";
import { SheetDragHandle, sheetPanelClassName } from "./SheetChrome";
import { Button } from "./ui";

const sizeClass = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
} as const;

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  /** Optional; wired to `aria-describedby` when set. */
  description?: string;
  children: ReactNode;
  /** Width of the dialog panel. */
  size?: keyof typeof sizeClass;
  className?: HTMLAttributes<HTMLDivElement>["className"];
  /** Extra classes on the scrollable panel (not the backdrop). */
  panelClassName?: string;
};

/**
 * Accessible modal: portal to `document.body`, backdrop click, Escape, scroll lock.
 * Below `md`, presents as a bottom sheet (aligned with admin mobile account sheet).
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  className,
  panelClassName,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col justify-end md:items-center md:justify-center md:p-4",
        className,
      )}
      role="presentation"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        className="absolute inset-0 cursor-default border-0 bg-backdrop p-0 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          sheetPanelClassName(),
          "relative z-10 md:mx-auto",
          sizeClass[size],
          panelClassName,
        )}
      >
        <SheetDragHandle />
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-3 sm:px-5 sm:py-4">
          <h2
            id={titleId}
            className="font-display text-base font-semibold text-foreground max-md:text-lg sm:text-lg"
          >
            {title}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={onClose}
            aria-label="Close dialog"
          >
            Close
          </Button>
        </div>
        {description ? (
          <p
            id={descriptionId}
            className="shrink-0 border-b border-border px-4 py-2 text-xs leading-relaxed text-muted sm:px-5 sm:text-sm"
          >
            {description}
          </p>
        ) : null}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
