import { useEffect, useLayoutEffect } from "react";
import {
  applyThemeToDocument,
  getStoredPreference,
  resolveTheme,
  systemResolvedTheme,
  useThemeStore,
} from "../store/themeStore";

/**
 * Keeps `document.documentElement[data-theme]` in sync with preference + system scheme.
 */
export function ThemeSync() {
  const preference = useThemeStore((s) => s.preference);

  useLayoutEffect(() => {
    const stored = getStoredPreference();
    useThemeStore.setState({ preference: stored });
    applyThemeToDocument(resolveTheme(stored));
  }, []);

  useEffect(() => {
    applyThemeToDocument(resolveTheme(preference));
  }, [preference]);

  useEffect(() => {
    if (preference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      applyThemeToDocument(systemResolvedTheme());
    };
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [preference]);

  return null;
}
