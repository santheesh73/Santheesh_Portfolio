import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@/styles/globals.css";
import { bodyFont, displayFont, monoFont } from "./fonts";
import { LenisProvider } from "@/components/providers/LenisProvider";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — AI Software Engineer`, template: `%s — ${SITE_NAME}` },
  description:
    "AI is one part of the system. I engineer the rest. Santheesh S builds LLM applications, RAG systems, on-device AI and full-stack products.",
};

export const viewport: Viewport = {
  themeColor: "#F4F5F7",
  colorScheme: "light",
};

// Runs before paint: enables motion-only CSS (hidden pre-split text) unless reduced motion.
const motionFlag = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('js-motion')}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionFlag }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <LenisProvider>
          <main id="main">{children}</main>
        </LenisProvider>
      </body>
    </html>
  );
}
