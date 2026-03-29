import { cn } from "../lib/cn";

type SheetDragHandleProps = {
  className?: string;
  /** `md`: hide on tablet+ (modal becomes centered). `never`: always show when parent is visible (e.g. account sheet below `lg` only). */
  hideFrom?: "md" | "never";
};

/** Drag affordance for mobile bottom sheets. */
export function SheetDragHandle({
  className,
  hideFrom = "md",
}: SheetDragHandleProps) {
  return (
    <div
      className={cn(
        "flex justify-center pt-2 pb-1",
        hideFrom === "md" && "md:hidden",
        className,
      )}
      aria-hidden
    >
      <div className="h-1 w-10 rounded-full bg-border" />
    </div>
  );
}

export type SheetPanelMode = "modal" | "alwaysBottomSheet";

/**
 * Shared panel shell.
 * - `modal` (default): below `md` = bottom sheet; `md+` = centered dialog card.
 * - `alwaysBottomSheet`: sheet chrome at every width (use when parent is already mobile-only, e.g. `lg:hidden`).
 */
export function sheetPanelClassName(
  extra?: string,
  mode: SheetPanelMode = "modal",
) {
  if (mode === "alwaysBottomSheet") {
    return cn(
      "flex w-full flex-col overflow-hidden bg-surface",
      "max-h-[min(85vh,560px)] rounded-t-2xl border border-border border-b-0 shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.25)] pb-[max(1rem,env(safe-area-inset-bottom,0px))]",
      extra,
    );
  }
  return cn(
    "flex w-full flex-col overflow-hidden bg-surface",
    "max-h-[min(85vh,560px)] max-md:rounded-t-2xl max-md:border max-md:border-b-0 max-md:border-border max-md:shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.25)] max-md:pb-[max(1rem,env(safe-area-inset-bottom,0px))]",
    "md:max-h-[min(90vh,40rem)] md:rounded-lg md:border md:border-border md:shadow-xl",
    extra,
  );
}
