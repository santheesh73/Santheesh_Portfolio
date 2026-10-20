# Santheesh S — Signal → Structure

Personal portfolio of Santheesh S, AI Software Engineer. A model reads; deterministic code
decides. The site dramatises that: things arrive as noisy signal and lock into structure.

Next.js 15 (App Router), React 19, TypeScript, Tailwind v4, GSAP + Lenis, a React Three Fiber
hero, MDX case studies. See `CLAUDE.md` for conventions, `PROGRESS.md` for what was built and
measured in each phase, and `TODO_CONTENT.md` for content still to be supplied.

## Run it locally

Needs Node 20+ and pnpm 10 (`corepack enable` gives you the pinned pnpm).

```bash
git clone https://github.com/santheesh73/Santheesh_Portfolio.git
cd Santheesh_Portfolio
pnpm install
pnpm dev                      # http://localhost:3000
```

Production build, served locally:

```bash
pnpm build
pnpm start                    # http://localhost:3000
```

The preloader plays once per browser session; open a new tab or clear session storage to see
it again. `?webgl` forces the WebGL hero on a software GPU (headless browsers, VMs), which
otherwise get the static field.

## Checks

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
pnpm e2e                                 # Playwright (starts a server on 3100): routes, transitions, menu, axe, console errors
pnpm start -p 3100 &                     # budget, shots and audit:layout expect a server on 3100
pnpm budget / /work /about               # initial JS per route, gzip
pnpm shots <phase> / /work               # screenshots into .review/<phase>/
pnpm audit:layout                        # overflow at 360–1920 and hidden text under reduced motion
```

First time: `pnpm exec playwright install chromium`, then point the scripts at it with
`PW_CHROMIUM=/path/to/chromium` (they default to `/opt/pw-browsers/chromium`).
`SOURCEMAPS=1 pnpm build` emits browser source maps for profiling.

## Deploy (Vercel)

Nothing has been deployed. The project is ready for it with no extra config (no `vercel.json`
needed: Vercel detects Next.js and pnpm from the lockfile).

1. Set `NEXT_PUBLIC_SITE_URL` to the production origin, for example
   `https://santheesh.dev`. It feeds canonical URLs, the sitemap, robots and OG images.
   Without it the site assumes `https://santheesh.vercel.app`.
2. Either import the GitHub repo in the Vercel dashboard, or from this folder:

```bash
pnpm dlx vercel link
pnpm dlx vercel env add NEXT_PUBLIC_SITE_URL production
pnpm dlx vercel --prod
```

## Content

All copy and facts live in `content/` (zod-validated) and `content/work/*.mdx`. Anything not yet
known is a `TODO(santheesh): …` value and stays hidden on the site until filled in;
`TODO_CONTENT.md` lists them.

Fonts are subsets (Latin plus the symbols the site uses) of Bricolage Grotesque, Geist and
JetBrains Mono, all OFL. If you add copy in another script, re-subset from the full files or
swap in the originals.
