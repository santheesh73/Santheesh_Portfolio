import type { Metadata } from "next";
import { Chip } from "@/components/ui/Chip";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Scramble } from "@/components/motion/Scramble";
import { SnapIn } from "@/components/motion/SnapIn";
import { Magnetic } from "@/components/motion/Magnetic";
import { ReplayDemo } from "./ReplayDemo";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false },
};

const COLOURS = [
  { token: "--paper", hex: "#F4F5F7", role: "page ground", cls: "bg-paper" },
  { token: "--paper-2", hex: "#ECEEF2", role: "alternate band", cls: "bg-paper-2" },
  { token: "--sheet", hex: "#FFFFFF", role: "raised surface", cls: "bg-sheet" },
  { token: "--rule", hex: "#DCE0E8", role: "hairlines", cls: "bg-rule" },
  { token: "--ink-3", hex: "#8D93A5", role: "decorative annotation", cls: "bg-ink-3" },
  { token: "--ink-2", hex: "#474D60", role: "secondary text", cls: "bg-ink-2" },
  { token: "--ink", hex: "#0A0C14", role: "text · structure", cls: "bg-ink" },
  { token: "--signal-2", hex: "#C9D0FF", role: "signal tint", cls: "bg-signal-2" },
  { token: "--signal", hex: "#2B45F5", role: "the one accent · model", cls: "bg-signal" },
  { token: "--live", hex: "#0E9F6E", role: "semantic · live", cls: "bg-live" },
  { token: "--amber", hex: "#B7791F", role: "semantic · team / WIP", cls: "bg-amber" },
] as const;

const TYPE = [
  {
    name: "Hero",
    cls: "t-hero",
    spec: "clamp(3.5rem, 17vw, 21rem) / 0.88 / -0.04em",
    sample: "Signal",
  },
  {
    name: "Section",
    cls: "t-section",
    spec: "clamp(2.75rem, 7vw, 8.5rem) / 0.92",
    sample: "The Pipeline",
  },
  {
    name: "Display S",
    cls: "t-display-sm",
    spec: "clamp(2rem, 4vw, 4.25rem) / 0.98",
    sample: "Read → Decide",
  },
  {
    name: "Lede",
    cls: "t-lede",
    spec: "clamp(1.25rem, 1.6vw, 1.625rem) / 1.35",
    sample: "Gemini reads the bill. The deterministic engine calculates. Gemini explains.",
  },
  {
    name: "Body",
    cls: "",
    spec: "17–18px / 1.55 / max 65ch",
    sample:
      "Restart-safe escalation timers live in Postgres, so wiping Redis mid-incident still escalates. A page is never sent twice and never lost.",
  },
  {
    name: "Label",
    cls: "t-label",
    spec: "JetBrains Mono 12px / 0.12em / uppercase",
    sample: "FIG.02 — Deterministic core",
  },
] as const;

function SectionHead({ index, title }: { index: string; title: string }) {
  return (
    <header className="col-span-full mb-10 flex items-end justify-between border-b border-ink pb-3">
      <h2 className="t-display-sm">{title}</h2>
      <Label>{index}</Label>
    </header>
  );
}

export default function StyleguidePage() {
  return (
    <div className="pb-40">
      <section className="grid-12 relative gap-y-6 pt-28 pb-20">
        <span className="crosshair top-20 left-[var(--gutter)]" aria-hidden="true" />
        <Scramble
          as="p"
          text="Styleguide — v0 — signal → structure"
          trigger="mount"
          className="col-span-full text-ink-3-text"
        />
        <SplitReveal as="h1" trigger="mount" className="t-section col-span-full md:col-span-9">
          The system that draws the system.
        </SplitReveal>
        <p className="col-span-full max-w-[44ch] text-ink-2 md:col-span-4 md:col-start-9 md:self-end">
          Tokens, type and motion primitives. Cobalt marks the model. Ink marks the engine.
          Everything else is paper.
        </p>
      </section>

      {/* Colour */}
      <section className="grid-12 gap-y-0 py-16" aria-labelledby="sg-colour">
        <SectionHead index="01 / colour" title="Colour" />
        <ul className="col-span-full grid grid-cols-2 border-t border-l border-rule sm:grid-cols-3 lg:grid-cols-6">
          {COLOURS.map((c) => (
            <li key={c.token} className="border-r border-b border-rule">
              <div className={`${c.cls} aspect-[4/3] border-b border-rule`} />
              <div className="space-y-1 p-3">
                <p className="font-mono text-xs text-ink">{c.token}</p>
                <p className="font-mono text-xs text-ink-3-text">{c.hex}</p>
                <p className="text-sm text-ink-2">{c.role}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Type */}
      <section className="grid-12 py-16" aria-labelledby="sg-type">
        <SectionHead index="02 / type" title="Type" />
        <div className="col-span-full divide-y divide-rule border-y border-rule">
          {TYPE.map((t) => (
            <div key={t.name} className="grid grid-cols-12 gap-x-4 gap-y-3 py-8">
              <div className="col-span-12 space-y-1 md:col-span-3">
                <Label className="text-ink">{t.name}</Label>
                <p className="font-mono text-xs text-ink-3-text">{t.spec}</p>
              </div>
              <p
                className={`col-span-12 md:col-span-9 ${t.cls} ${t.cls === "" ? "measure" : ""} overflow-hidden`}
              >
                {t.sample}
              </p>
            </div>
          ))}
        </div>
        <p className="col-span-full mt-6 font-mono text-xs text-ink-3-text">
          Display: Bricolage Grotesque (fallback for Clash Display) · Body: Geist (fallback for
          General Sans) · Mono: JetBrains Mono
        </p>
      </section>

      {/* Controls */}
      <section className="grid-12 py-16">
        <SectionHead index="03 / controls" title="Buttons & chips" />
        <div className="col-span-full flex flex-wrap items-center gap-4 md:col-span-6">
          <Magnetic>
            <Button arrow="→">Primary</Button>
          </Magnetic>
          <Magnetic>
            <Button variant="outline" arrow="↗">
              Outline
            </Button>
          </Magnetic>
          <Magnetic>
            <ButtonLink href="/" variant="signal">
              Model action
            </ButtonLink>
          </Magnetic>
        </div>
        <div className="col-span-full mt-8 flex flex-wrap gap-3 md:col-span-6 md:mt-0">
          <Chip status="live" />
          <Chip status="repository" />
          <Chip status="team" />
          <Chip status="progress" />
          <Chip status="open" />
        </div>
      </section>

      {/* Motion */}
      <section className="grid-12 py-16">
        <SectionHead index="04 / motion" title="Motion primitives" />
        <div className="col-span-full grid gap-px border border-rule bg-rule md:grid-cols-2">
          <div className="space-y-6 bg-paper p-6 md:p-10">
            <Label>SplitReveal · lines from 110% · 0.06s stagger · expo.out</Label>
            <ReplayDemo kind="split" />
          </div>
          <div className="space-y-6 bg-paper p-6 md:p-10">
            <Label>Scramble · mono labels only · noise → order</Label>
            <ReplayDemo kind="scramble" />
          </div>
          <div className="space-y-6 bg-paper p-6 md:p-10">
            <Label>SnapIn · offset + rotate + blur → exact grid</Label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <SnapIn key={n} seed={n} delay={n * 0.04}>
                  <div
                    className={`aspect-square border ${n % 3 === 0 ? "border-signal bg-signal-2" : "border-ink bg-sheet"}`}
                  />
                </SnapIn>
              ))}
            </div>
          </div>
          <div className="space-y-6 bg-paper p-6 md:p-10">
            <Label>Eases</Label>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 font-mono text-sm">
              <dt className="text-signal">signal</dt>
              <dd className="text-ink-2">cubic-bezier(0.65, 0, 0.35, 1) · drift, in/out</dd>
              <dt>structure</dt>
              <dd className="text-ink-2">expo.out · snaps</dd>
              <dt>reveal</dt>
              <dd className="text-ink-2">0.6 – 1.2s</dd>
              <dt>micro</dt>
              <dd className="text-ink-2">0.25 – 0.4s</dd>
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}
