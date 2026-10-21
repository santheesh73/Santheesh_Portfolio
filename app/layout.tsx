import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@/styles/globals.css";
import { bodyFont, displayFont, monoFont } from "./fonts";
import { LenisProvider } from "@/components/providers/LenisProvider";
import { TransitionProvider } from "@/components/providers/TransitionProvider";
import { Header } from "@/components/layout/Header";
import type { MenuItem } from "@/components/layout/Menu";
import { LazyCursor, LazyScrollProgress } from "@/components/layout/Lazy";
import { Grain } from "@/components/layout/Grain";
import { BlueprintGrid } from "@/components/layout/BlueprintGrid";
import { Preloader } from "@/components/sections/Preloader";
import { Contact } from "@/components/sections/Contact";
import { THEME_KEY } from "@/lib/theme";
import { BOOT_KEY } from "@/lib/boot";
import { profile } from "@/content/profile";
import { workProjects, labProjects } from "@/content/projects";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — AI Software Engineer`, template: `%s — ${SITE_NAME}` },
  description: `${profile.thesis} ${SITE_NAME} builds LLM applications, RAG systems, on-device AI and full-stack products.`,
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_IN" },
  twitter: { card: "summary_large_image" },
};

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: "AI Software Engineer",
  description: profile.headline,
  url: SITE_URL,
  email: `mailto:${profile.email}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: profile.location.city,
    addressRegion: profile.location.region,
    addressCountry: "IN",
  },
  sameAs: [profile.links.github, profile.links.linkedin],
  knowsAbout: profile.builds,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F5F7" },
    { media: "(prefers-color-scheme: dark)", color: "#0C0E14" },
  ],
  colorScheme: "light dark",
};

// Runs before paint: stored theme choice; motion-only CSS unless reduced motion; skip the preloader on return visits.
const boot = `try{var d=document.documentElement,t=localStorage.getItem('${THEME_KEY}');if(t==='light'||t==='dark')d.dataset.theme=t;if(!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('js-motion');if(sessionStorage.getItem('${BOOT_KEY}'))d.classList.add('booted')}catch(e){}`;

const MENU: MenuItem[] = [
  {
    href: "/work",
    label: "Work",
    note: `${workProjects.length} projects`,
    preview: { kind: "image", src: "/media/minchal/desktop.png", alt: "" },
  },
  {
    href: "/about",
    label: "About",
    note: "Bio · how I work",
    preview: { kind: "text", lines: [profile.philosophy, "", profile.taglines.motto] },
  },
  {
    href: "/lab",
    label: "Lab",
    note: "Experiments & tools",
    preview: {
      kind: "text",
      lines: [...labProjects.map((p) => `→ ${p.title}`), "→ Frontend Craft internals"],
    },
  },
  {
    href: "/#contact",
    label: "Contact",
    note: profile.email,
    preview: { kind: "text", lines: [profile.taglines.contact, profile.email] },
  },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd).replace(/</g, "\\u003c") }}
        />
        <a href="#main" className="skip-link" data-transition="none">
          Skip to content
        </a>
        <LenisProvider>
          <TransitionProvider>
            <BlueprintGrid />
            <LazyScrollProgress />
            <Header name={profile.name} items={MENU} />
            <main id="main" tabIndex={-1} className="relative z-[2] outline-none">
              {children}
            </main>
            <Suspense>
              <Contact
                heading={profile.taglines.contact}
                email={profile.email}
                github={profile.links.github}
                linkedin={profile.links.linkedin}
                motto={profile.taglines.motto}
                location={`${profile.location.city}, IN`}
                homeIndex={7}
              />
            </Suspense>
            <LazyCursor />
            <Grain />
            <Preloader log={profile.bootLog} />
          </TransitionProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
