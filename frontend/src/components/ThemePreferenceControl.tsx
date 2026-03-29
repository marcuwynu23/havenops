import { cn } from "../lib/cn";
import type { ThemePreference } from "../store/themeStore";
import { useThemeStore } from "../store/themeStore";
import { Select } from "./ui";

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

type Props = {
  className?: string;
  /** Compact label for sidebar; hidden on auth corner variant */
  showLabel?: boolean;
};

export function ThemePreferenceControl({
  className,
  showLabel = true,
}: Props) {
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel ? (
        <span className="text-xs text-muted">Appearance</span>
      ) : null}
      <Select
        aria-label="Theme appearance"
        className="w-full py-2 text-xs sm:text-sm"
        value={preference}
        options={OPTIONS.map((o) => ({
          value: o.value,
          label: o.label,
        }))}
        onChange={(e) =>
          setPreference(e.target.value as ThemePreference)
        }
      />
    </div>
  );
}
