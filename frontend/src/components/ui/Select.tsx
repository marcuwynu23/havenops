import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/cn";

export type SelectOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

/** Matches the native change event shape so existing handlers stay simple. */
export type SelectChangeEvent = {
  target: { value: string };
  currentTarget: { value: string };
};

export type SelectProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue" | "children"
> & {
  options: SelectOption[];
  value: string;
  onChange?: (e: SelectChangeEvent) => void;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  required?: boolean;
  /** Visually emphasize error state (e.g. failed validation). */
  invalid?: boolean;
};

function Chevron({ open, className }: { open: boolean; className?: string }) {
  return (
    <svg
      className={cn(
        "h-4 w-4 shrink-0 text-muted transition-transform duration-200",
        open && "rotate-180",
        className,
      )}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function emitChange(
  value: string,
  onChange?: (e: SelectChangeEvent) => void,
  onValueChange?: (v: string) => void,
) {
  const e = { target: { value }, currentTarget: { value } };
  onChange?.(e);
  onValueChange?.(value);
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  function Select(
    {
      options,
      value,
      onChange,
      onValueChange,
      placeholder = "Select…",
      disabled = false,
      id: idProp,
      name,
      required,
      invalid,
      className,
      "aria-label": ariaLabel,
      ...rest
    },
    ref,
  ) {
    const autoId = useId();
    const listboxId = `${autoId}-listbox`;
    const buttonId = idProp ?? `${autoId}-trigger`;

    const [open, setOpen] = useState(false);
    const [menuPos, setMenuPos] = useState<{
      top: number;
      left: number;
      width: number;
    } | null>(null);
    /** Index into `enabledIndices` (not option index). */
    const [highlightFlat, setHighlightFlat] = useState(0);

    const triggerRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const optionRefs = useRef<(HTMLLIElement | null)[]>([]);

    const setRefs = useCallback(
      (node: HTMLButtonElement | null) => {
        triggerRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref != null) {
          (ref as MutableRefObject<HTMLButtonElement | null>).current = node;
        }
      },
      [ref],
    );

    const enabledIndices = useMemo(() => {
      const idx: number[] = [];
      options.forEach((o, i) => {
        if (!o.disabled) idx.push(i);
      });
      return idx;
    }, [options]);

    const selected = options.find((o) => o.value === value);
    const display = selected ? (
      selected.label
    ) : (
      <span className="text-muted">{placeholder}</span>
    );

    const updateMenuPosition = useCallback(() => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setMenuPos({
        top: r.bottom + 4,
        left: r.left,
        width: r.width,
      });
    }, []);

    useLayoutEffect(() => {
      if (!open) {
        setMenuPos(null);
        return;
      }
      updateMenuPosition();
      const onScrollOrResize = () => updateMenuPosition();
      window.addEventListener("scroll", onScrollOrResize, true);
      window.addEventListener("resize", onScrollOrResize);
      return () => {
        window.removeEventListener("scroll", onScrollOrResize, true);
        window.removeEventListener("resize", onScrollOrResize);
      };
    }, [open, updateMenuPosition]);

    useEffect(() => {
      if (!open) return;
      const selectedOptionIndex = options.findIndex((o) => o.value === value);
      const posInEnabled = enabledIndices.indexOf(selectedOptionIndex);
      setHighlightFlat(posInEnabled >= 0 ? posInEnabled : 0);
    }, [open, enabledIndices, options, value]);

    useEffect(() => {
      if (!open || enabledIndices.length === 0) return;
      const optIdx = enabledIndices[highlightFlat];
      if (optIdx === undefined) return;
      optionRefs.current[optIdx]?.scrollIntoView({ block: "nearest" });
    }, [highlightFlat, open, enabledIndices]);

    const close = useCallback(() => {
      setOpen(false);
      triggerRef.current?.focus();
    }, []);

    const pick = useCallback(
      (optionIndex: number) => {
        const opt = options[optionIndex];
        if (!opt || opt.disabled) return;
        emitChange(opt.value, onChange, onValueChange);
        close();
      },
      [options, onChange, onValueChange, close],
    );

    useEffect(() => {
      if (!open) return;
      const onDocPointer = (e: MouseEvent | PointerEvent) => {
        const t = e.target as Node;
        if (triggerRef.current?.contains(t)) return;
        if (listRef.current?.contains(t)) return;
        close();
      };
      document.addEventListener("pointerdown", onDocPointer);
      return () => document.removeEventListener("pointerdown", onDocPointer);
    }, [open, close]);

    const moveHighlight = useCallback(
      (delta: number) => {
        if (enabledIndices.length === 0) return;
        setHighlightFlat((h) => {
          let n = (h + delta) % enabledIndices.length;
          if (n < 0) n += enabledIndices.length;
          return n;
        });
      },
      [enabledIndices.length],
    );

    const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (!open) {
            setOpen(true);
            return;
          }
          moveHighlight(1);
          break;
        case "ArrowUp":
          e.preventDefault();
          if (!open) {
            setOpen(true);
            return;
          }
          moveHighlight(-1);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (open) {
            const optIdx = enabledIndices[highlightFlat];
            if (optIdx !== undefined) pick(optIdx);
          } else {
            setOpen(true);
          }
          break;
        case "Escape":
          if (open) {
            e.preventDefault();
            close();
          }
          break;
        case "Home":
          if (open && enabledIndices.length) {
            e.preventDefault();
            setHighlightFlat(0);
          }
          break;
        case "End":
          if (open && enabledIndices.length) {
            e.preventDefault();
            setHighlightFlat(enabledIndices.length - 1);
          }
          break;
        default:
          break;
      }
    };

    const maxMenuHeight = menuPos
      ? `min(16rem, calc(100vh - ${menuPos.top}px - 8px))`
      : "16rem";

    const highlightedOptionIndex = enabledIndices[highlightFlat];

    const listbox =
      open && menuPos && typeof document !== "undefined"
        ? createPortal(
            <ul
              ref={listRef}
              id={listboxId}
              role="listbox"
              aria-labelledby={buttonId}
              className="fixed z-[300] overflow-y-auto rounded-md border border-border bg-surface py-1 shadow-lg"
              style={{
                top: menuPos.top,
                left: menuPos.left,
                width: menuPos.width,
                maxHeight: maxMenuHeight,
              }}
              onMouseDown={(e) => e.preventDefault()}
            >
              {options.map((opt, i) => {
                const isSelected = opt.value === value;
                const isHighlighted =
                  highlightedOptionIndex !== undefined &&
                  i === highlightedOptionIndex;
                return (
                  <li
                    key={`${opt.value}-${i}`}
                    ref={(el) => {
                      optionRefs.current[i] = el;
                    }}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={opt.disabled || undefined}
                    className={cn(
                      "cursor-pointer px-3 py-2 text-left text-sm text-foreground",
                      "outline-none transition-colors",
                      opt.disabled && "cursor-not-allowed opacity-50",
                      !opt.disabled &&
                        isHighlighted &&
                        "bg-nav-active-bg text-accent",
                      !opt.disabled &&
                        !isHighlighted &&
                        "hover:bg-nav-hover-bg",
                      isSelected && !isHighlighted && "font-medium",
                    )}
                    onMouseEnter={() => {
                      if (opt.disabled) return;
                      const pos = enabledIndices.indexOf(i);
                      if (pos >= 0) setHighlightFlat(pos);
                    }}
                    onClick={() => pick(i)}
                  >
                    {opt.label}
                  </li>
                );
              })}
            </ul>,
            document.body,
          )
        : null;

    return (
      <div className="relative w-full" {...rest}>
        {name ? (
          <input type="hidden" name={name} value={value} required={required} />
        ) : null}
        <button
          ref={setRefs}
          type="button"
          id={buttonId}
          disabled={disabled}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-label={ariaLabel}
          aria-invalid={invalid || undefined}
          aria-required={required || undefined}
          className={cn(
            "flex w-full min-h-[2.75rem] items-center justify-between gap-2 rounded-md border border-border bg-field px-3 py-2.5 text-left text-base text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-accent-muted",
            "disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-0 sm:px-2.5 sm:py-2 sm:text-sm",
            invalid && "border-danger ring-1 ring-danger/30",
            className,
          )}
          onClick={() => !disabled && setOpen((o) => !o)}
          onKeyDown={onTriggerKeyDown}
        >
          <span className="min-w-0 flex-1 truncate">{display}</span>
          <Chevron open={open} />
        </button>
        {listbox}
      </div>
    );
  },
);
