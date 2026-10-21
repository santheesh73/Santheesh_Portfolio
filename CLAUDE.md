# Santheesh S — portfolio ("Signal → Structure")

Award-level, heavily animated, light-themed portfolio. Concept: **signal** (model,
probabilistic, cobalt, drifting) becomes **structure** (engine, deterministic, ink,
snapping to grid). Every motion decision follows: loose → precise, noise → order,
read → decide. Not a 3D house / room walkthrough.

## Stack

- Next.js 15 App Router, React 19, TypeScript strict, pnpm
- Tailwind v4, tokens in `styles/globals.css` (`:root` vars mapped via `@theme inline`)
- GSAP 3 (ScrollTrigger, SplitText; Flip and DrawSVG loaded lazily via `loadFlip()` / `loadDrawSVG()`) + `@gsap/react`.
  CustomEase and ScrambleText are replaced by a hand-written `signal` cubic-bezier (`lib/motion.ts`)
  and `lib/scrambleLite.ts` to keep initial JS under budget.
- Lenis (one instance, `components/providers/LenisProvider.tsx`, ticked by `gsap.ticker`, created after load + idle; `getLenis()` can be null)
- three + R3F + drei for the hero only, lazy via `next/dynamic({ ssr: false })`, mounted after load + idle.
  Software GL (SwiftShader/llvmpipe) gets the static canvas field; `?webgl` forces WebGL for QA.
- MDX for case studies, zod-validated content in `content/`
- Playwright (screenshots, e2e), Vitest (utils), ESLint + Prettier

## Commands

`pnpm dev` · `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build`
`pnpm start -p 3100` then `pnpm shots <phase> / /route …` → `.review/<phase>/`
Playwright uses the preinstalled Chromium at `/opt/pw-browsers/chromium` (pinned @playwright/test 1.56.1).

## Conventions

- Import GSAP only from `@/lib/gsap` (registers plugins once). Eases/durations only from `@/lib/motion`.
- All GSAP code inside `useGSAP` with a `scope`; no leaked ScrollTriggers between routes.
- Every animated component checks `prefersReducedMotion()` and renders the final state instantly.
- No hard-coded colours in components: use `bg-paper`, `text-ink`, `text-signal`, `border-rule`, …
  `--ink-3` is decorative only; small annotation text uses `text-ink-3-text` (AA contrast).
- Light and dark themes come from the same tokens (`styles/globals.css`): system preference by default,
  `html[data-theme]` when the header toggle stored a choice (`lib/theme.ts`). Large ink surfaces add
  `tone-ink` (or `data-tone="ink"`) so they stay near-black in dark mode. Canvas code re-reads tokens via `onThemeChange`.
- Cobalt (`signal`) = model/AI/probabilistic things only. `live` / `amber` are semantic only.
- Pages are server components; animated pieces are small `'use client'` islands.
- Radius 0–6px; pills only for status chips and buttons.
- Mono labels: `.t-label` (uppercase, 0.12em). Scramble is for mono labels only.

## Banned (AI-slop tells)

Purple→blue gradient heroes, glassmorphism, blurry blobs, aurora backgrounds; bento grids of
identical icon cards; emoji section markers, ✨ 🚀; Inter/Space Grotesk/Poppins as display;
everything centred; uniform `rounded-2xl shadow-lg`; lorem ipsum, fake testimonials/logos/metrics,
skill % bars, years-of-experience counters; stock 3D blobs, Spline, floating laptops; typewriter
headings; fade-up on every element.

## Content rules

- Real data only. Never invent awards, placements, metrics, testimonials, employers, dates, links, quotes.
- Unknowns are `TODO(santheesh): …` values in `content/`, hidden in the UI until filled, listed in `TODO_CONTENT.md`.
- Team builds credited honestly ("Built with a team; my role: …").
- Voice: plain, confident, specific, short sentences. No "passionate", "cutting-edge", "seamless", "leverage", "revolutionary".

## Performance rules

- Initial JS ≤ 180 KB gzip per route (`pnpm budget`). Don't import `next/image` anywhere (even
  `getImageProps` pulls the Image client chunk): use `imgProps()` from `lib/img.ts` in server components.
- Client components get server-rendered media/glyphs as `ReactNode` props instead of importing them.
- Client code imports content helpers from `content/helpers.ts` (zod-free), never `content/schema.ts`.
- Entrance text must stay painted under the preloader/curtain (LCP): mount-trigger animations apply
  their from-state at `whenRevealed`, not at hydration.
- Home sections sit in their own `<Suspense>` so hydration yields between them.

## Phase gates

Each phase: `pnpm lint && pnpm typecheck && pnpm build`, screenshots (desktop + mobile) into
`.review/<phase>/` and look at them, entry in `PROGRESS.md`, one commit.
