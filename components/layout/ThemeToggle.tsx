"use client";

import { useEffect, useState } from "react";
import { currentTheme, onThemeChange, setTheme, type Theme } from "@/lib/theme";

/** Light / dark switch. Defaults to the system theme; a click stores the choice. */
export function ThemeToggle() {
  // unknown until mounted: the server can't know the visitor's theme
  const [theme, setState] = useState<Theme | null>(null);

  useEffect(() => {
    const sync = () => setState(currentTheme());
    sync();
    return onThemeChange(sync);
  }, []);

  const next: Theme = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className="t-label flex items-center gap-2 py-3"
      data-cursor={next === "dark" ? "Dark" : "Light"}
    >
      <span
        aria-hidden="true"
        className="relative block size-3 overflow-hidden rounded-full border border-current"
      >
        <span className="absolute inset-y-0 right-0 w-1/2 bg-current" />
      </span>
      <span className="sr-only">Switch to </span>
      <span className={theme ? undefined : "invisible"}>{next === "dark" ? "Dark" : "Light"}</span>
      <span className="sr-only"> theme</span>
    </button>
  );
}
