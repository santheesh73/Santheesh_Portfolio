"use client";

import { useState } from "react";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Scramble } from "@/components/motion/Scramble";

/** Remounts a primitive so it can be replayed in the styleguide. */
export function ReplayDemo({ kind }: { kind: "split" | "scramble" }) {
  const [key, setKey] = useState(0);
  return (
    <div className="space-y-6">
      {kind === "split" ? (
        <SplitReveal key={key} as="p" className="t-display-sm">
          AI should be a component of a reliable software system.
        </SplitReveal>
      ) : (
        <div className="space-y-2">
          <Scramble key={`a${key}`} as="p" text="FIG.02 — Deterministic core" trigger="mount" />
          <Scramble
            key={`b${key}`}
            as="p"
            text="entropy 0.84 → 0.00"
            trigger="mount"
            delay={0.15}
            className="text-signal"
          />
        </div>
      )}
      <button
        type="button"
        onClick={() => setKey((k) => k + 1)}
        className="hit font-mono text-xs tracking-[0.12em] text-ink-2 uppercase underline underline-offset-4 hover:text-signal"
      >
        Replay ↺
      </button>
    </div>
  );
}
