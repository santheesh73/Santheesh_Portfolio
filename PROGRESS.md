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

## P1 — Content layer (2026-10-20)

**Built**

- zod schemas (`content/schema.ts`) with a `TODO(santheesh):` type that validates but never renders (`known()`).
- `content/profile.ts`, `content/projects.ts` (10 projects, `FEATURED` order constant, architectures as data),
  `content/stack.ts`, `content/crossref.ts` (tool → projects).
- MDX case studies for all 10 projects in `content/work/`, facts taken from each repository's
  README and docs; unknowns as `<Todo>` blocks. `@next/mdx` with `mdx-components.tsx`.
- `ArchitectureDiagram` (server SVG, cobalt model nodes / ink deterministic nodes, `data-draw` hooks).
- Draft `/work/[slug]` route (static params for all 10) to check the MDX renders; designed in P5.
- `scripts/capture-media.ts` (`pnpm media`): live-site screenshots + scroll loop → MP4/WebM ≤1.5 MB + poster;
  Pulse `demo.gif` → MP4/WebM.

**Media results**

- Pulse: demo.gif → `demo.mp4` 358 KB, `demo.webm` 485 KB, poster.
- MINCHAL: live site blocked by the build machine's network policy; captured a local build of the
  same repo instead (home page, no mock data): desktop/mobile PNG, loops 1.2 MB / 0.6 MB MP4.
- HeartTune: live site blocked and repo private → spec plate for now (see TODO_CONTENT.md).

**Verified**

- lint, typecheck, build OK; `pnpm test` 8 passed (content parses, every project has MDX, media files
  exist, next-project loop covers the shelf, cross-reference, TODO hiding).
- Screenshots `.review/p1/` for /work/pulse, /work/minchal, /work/hearttune; no console errors.

**Left**

- Case-study design (P5). Role/years/details listed in TODO_CONTENT.md.
