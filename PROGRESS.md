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

## P2 — Shell & global motion (2026-10-20)

**Built**

- `Header` (wordmark, live IST clock, magnetic Menu toggle; flips to paper over `data-tone="ink"` sections).
- `Menu`: full-screen ink overlay, clip-path open, items rise from 110% with 0.06s stagger, per-item
  preview (MINCHAL capture for Work, text plates for the rest), focus trap, Escape, focus return,
  closes on navigation, Lenis paused while open.
- `Cursor`: dot + lagging ring, pointer:fine only, labels via `data-cursor`, cobalt via
  `data-cursor-tone="signal"`, paper over ink sections. Native cursor hidden only while active.
- `Magnetic` (≤12px), `ScrollProgress` (1px cobalt), `BlueprintGrid` (12 hairline columns draw in;
  `G` toggles blueprint mode with column coordinates), `Grain` (SVG turbulence, 2.8% opacity).
- `TransitionProvider`: capture-phase link interception, cobalt-then-ink curtain, destination name
  scrambles in, `router.push`, lift after a 220 ms hold. 0.36 + 0.22 + 0.32 ≈ 0.9 s. Back/forward
  skip the curtain and restore scroll; new routes start at top (or at `#hash`). Entrance animations
  wait on `lib/pageReveal` so they play as the curtain lifts. `app/template.tsx` animates `[data-enter]`.
- `Preloader`: server-rendered, first visit per session, boot log from the README with scramble,
  000→100 counter with jittering digits that snap into a ruled grid, ink split reveal. ≤ 2.2 s,
  finishes early with the load event. Hidden pre-paint for return visits / reduced motion.
- Placeholder `/work`, `/about`, `/lab` shells for transition testing.

**Verified**

- lint, typecheck, build OK. Playwright `e2e/shell.spec.ts` (desktop + mobile): 7 passed —
  preloader runs once per session; curtain fully covers (panel top reaches 0), navigates, lifts in
  < 1.6 s wall-clock including test overhead; back restores scroll; menu focus trap + Escape +
  focus return; `G` toggles blueprint. No console errors.
- Screenshots `.review/p2/`: preloader count + split, menu, curtain frames, blueprint, desktop + mobile.

**Bugs found by the tests and fixed**

- Inline boot script imported a constant from a client module (rendered as a function stub).
- Tailwind v4 `translate` utilities stacked with GSAP transforms on the curtain panels.
- Header read the menu overlay as an ink section and went white on the home page.

## P3 — Hero WebGL signal field (2026-10-20)

**Built**
- `components/webgl/SignalField.tsx` (R3F, orthographic pixel-space camera, `THREE.Points` + custom
  `ShaderMaterial`), shaders in `components/webgl/shaders/*.glsl` (loaded as `asset/source`):
  - targets: "SANTHEESH S" rendered to an offscreen canvas in the display face and sampled on a
    dot-matrix grid (`lib/sampleText.ts`; never more cells than the particle budget);
  - signal: 3D simplex → 2D curl-noise drift around each target, amplitude ∝ entropy;
  - arrival: points fly in from across the viewport when the page is revealed;
  - cursor: smoothed pointer repulsion that eases back when the pointer idles; weaker at low entropy;
  - colour: share of cobalt points falls from ~42% (signal) to 8% (structure).
- `Hero`: entropy scrubbed 0.84 → 0.00 by ScrollTrigger (pinned, +100% desktop / +70% mobile),
  live caption `signal · entropy 0.84 → 0.00` that flips to `structure · locked`. HTML overlay:
  headline (masked line reveal, real `<h1>` text with the name as sr-only), roles (scramble),
  Tiruppur + live IST clock, "Open to roles & collaborations" chip, crosshairs, FIG.01 annotation.
- Guards: DPR capped at 1.75; frameloop switched to `never` off-screen / hidden tab; particle budget
  12k desktop, 7k low-power, 5.5k mobile, 3.5k low-power mobile; `next/dynamic({ ssr:false })` chunk.
- Fallback `SignalStatic`: 2D canvas of the structured state for reduced motion or no WebGL.

**Verified**
- lint, typecheck, build; `pnpm test` 10 passed; Playwright 11 passed (adds: hero headline is text,
  caption reaches 0.00 after one viewport of scroll, reduced motion renders the static field at 0.00).
- Screenshots `.review/p3/`: arrival, rest, cursor repulsion, mid-scrub, structure, reduced motion.

**Measured (to fix in P7)**
- Initial JS on `/` (modern browsers, gzip, excluding the nomodule polyfill): ≈ 197 KB — over the
  180 KB budget. React/Next runtime ≈ 101 KB; GSAP + plugins chunk ≈ 45 KB. The WebGL chunks
  (three + R3F, ≈ 241 KB gzip) load lazily and are excluded.

## P4 — Home narrative

**Built**
- `Manifesto` (02/07): pinned; the philosophy sentence reads word by word from ink-3 to ink on scroll,
  cobalt underlines draw under "component" and "reliable".
- `Pipeline` (03/07): pinned horizontal sequence Read → Validate → Decide → Explain, each stage tied
  to real project facts (`content/pipeline.ts`). One document glyph sits on the wire and swaps form
  per stage (bill → fields → rules → tree) with a signal→structure transition; stages scroll in a
  clipped window to its right so text never passes under it. Mobile: a plain ordered list.
- `WorkReel` (04/07): pinned horizontal gallery of the five featured plates. `ProjectPlate`: 16:10
  media (looping video only in view / screenshot / blueprint spec plate with the real architecture),
  RGB-split pulse and zoom on hover, rolling title letters, mono metadata with honest status chips
  and team roles. Click → GSAP `Flip` shared-element transition onto `[data-flip-target]` in the
  case study (chosen over the View Transitions API, which is experimental in Next 15).
- `Stack` (05/07): one marquee per layer driven by `gsap.ticker`, speed follows scroll velocity and
  slows on hover; choosing a tool highlights the projects that use it (`content/crossref.ts`,
  `aria-live`). No skill bars.
- `Signals` (06/07): GitHub public record with its date (20 repos, 93 stars, achievements).
- `Contact` (07/07, global footer on every route): masked headline, selectable email + copy button
  with a "Copied" state, magnetic GitHub/LinkedIn, © 2026, motto, Tiruppur + live IST, G hint,
  Back to top through Lenis. Header turns paper over it.
- `scripts/frames.ts` (`pnpm frames <phase> <route> [n]`): viewport frames through the scroll, since
  pinned sections don't read in a full-page capture.

**Fixed during review**
- Spec plates printed the project title a second time under the plate title → removed from the plate.
- Plate titles overlapping busy video were unreadable → titles now sit under the media.
- Header stayed ink over the footer → its triggers refresh after the page pins (`refreshPriority`).

**Verified**
- lint, typecheck, build; Playwright 16 passed, 2 skipped (adds: home section order, copy email
  writes to the clipboard, a plate flips into `/work/orion`).
- Screenshots `.review/p4/` (full page + `frames/` every third scroll stop, desktop and mobile).

**Measured (to fix in P7)**
- `/` First Load JS reported by Next: 217 KB (was 197 KB est.). Still over the 180 KB budget.

## P5 — Inner pages

**Built**
- `/work` (`WorkIndex`): list rows with a media preview that trails the pointer, or a grid of
  plates; switching view and filter (All / AI products / Developer tools / Platforms, with counts)
  re-flows the same elements with GSAP Flip. Grid plates use the shared-element transition; list
  rows use the curtain. Sticky filter bar; buttons expose `aria-pressed`.
- `/work/[slug]`: case hero (label, title, pitch, media as the Flip target, media credit), metadata
  grid (status chip, category, year if known, team/role only when sourced, stack, context, links;
  hidden repos are not linked), MDX body with a sticky section rail (reading progress line, active
  section, Lenis jump links), architecture diagrams that draw on scroll (DrawSVG scrub: node
  outlines column by column, then edges; dashed model strokes fade instead), and `NextProject`:
  a 200svh section where the next title compiles from loose to tight and a rule fills; reaching the
  end fires the curtain into the next case (infinite loop through `/work`). Reduced motion: a link.
- `/about`: bio, contact facts with live IST, "How I work" (three principles, a real 01–03 sequence),
  current focus, what I build. Portrait, timeline and resume stay hidden until supplied (TODO).
- `/lab`: dense snap grid (tiles arrive loose and lock onto the grid): the Orchestrate skill plate,
  Frontend Craft's four parts, and the 20 Slop Lint rules copied from the craftlyst repo
  (`content/lab.ts`, ids + descriptions, source noted on the page; ids scramble on hover).
- `not-found`: the particle field spells "404" as loose signal; scroll, swipe, click or Enter compiles
  it to "→ HOME" (entropy → 0.00), then the field links home. Static fallback; text link always there.
- `lib/webgl.ts` (`hasWebGL`), `offset` prop on `SignalField` / `SignalStatic`.

**Fixed during review**
- Arriving on a case study could fire its next-project transition at once (stale scroll position
  during the route change). It now needs real user scroll input and a pass through the section.
- Lab tiles are hidden until they snap in, so tests scroll them into view first.
- Playwright limited to 2 workers: WebGL runs in SwiftShader here and starved the timing tests.

**Verified**
- lint, typecheck, build; Playwright 24 passed (adds: /work filter + grid toggle, case study rail
  and next-project loop, about/lab content, 404 compile + link home).
- Screenshots `.review/p5/` (every route, desktop + mobile; `frames/` through the Pulse case study).

**Left**
- `/lab` has one lab project, so the grid leans on Frontend Craft internals; more lab entries need
  real projects from Santheesh.
