# Progress

## P0 — Setup & direction (2026-10-20)

**Built**

- Next.js 15.5 / React 19.2 / TS strict / pnpm scaffold; Tailwind v4 tokens (`styles/globals.css`).
- Fonts self-hosted via `next/font/local` in `app/fonts/`: Bricolage Grotesque (display),
  Geist (body), JetBrains Mono. Fontshare (Clash Display, General Sans) is blocked from the
  build environment, so the spec's fallbacks ship; swap is one line in `app/fonts.ts`.
- `lib/gsap.ts` (plugins registered once), `lib/motion.ts` (signal/structure eases, durations,
  staggers), `LenisProvider` (single instance on `gsap.ticker`, off under reduced motion),
  `useReducedMotion`, `useIST`.
- Motion primitives: `SplitReveal` (masked lines), `Scramble` (mono labels), `SnapIn`
  (signal → grid), `Magnetic` (≤12px). UI: `Button`, `ButtonLink`, `Chip`, `Label`.
- `/styleguide`: colour tokens, type scale, buttons, chips, replayable motion demos.
- `CLAUDE.md`, `TODO_CONTENT.md`, Playwright screenshot script, Vitest.

**Verified**

- `pnpm lint` (0 warnings), `pnpm typecheck`, `pnpm test` (2 passed), `pnpm build` OK.
- First-load JS: `/` 106 kB, `/styleguide` 173 kB (uncompressed figures from `next build`).
- Screenshots in `.review/p0/` (desktop 1440 + mobile 390), no console errors.

**Left**

- Everything from P1 onward. Initial-JS budget to be measured gzip in P7.
