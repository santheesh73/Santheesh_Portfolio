import localFont from "next/font/local";

/*
 * Display: spec calls for Clash Display (Fontshare). Fontshare was unreachable
 * from the build environment, so the documented fallback, Bricolage Grotesque
 * (OFL), ships instead. To switch: drop ClashDisplay-Variable.woff2 into
 * app/fonts and change the src below. See TODO_CONTENT.md.
 */
export const displayFont = localFont({
  src: "./fonts/BricolageGrotesque-Variable.woff2",
  variable: "--font-display-face",
  weight: "200 800",
  display: "swap",
  preload: true,
  adjustFontFallback: "Arial",
});

/* Body: spec calls for General Sans (Fontshare); fallback Geist (OFL). */
export const bodyFont = localFont({
  src: "./fonts/Geist-Variable.woff2",
  variable: "--font-body-face",
  weight: "100 900",
  display: "swap",
  preload: true,
  adjustFontFallback: "Arial",
});

export const monoFont = localFont({
  src: "./fonts/JetBrainsMono-Variable.woff2",
  variable: "--font-mono-face",
  weight: "100 800",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});
