# Content still needed from Santheesh

Everything here is hidden on the site until supplied. Nothing is invented in its place.
Unknowns live in `content/*.ts` and `content/work/*.mdx` as `TODO(santheesh): …` values or
`<Todo>` blocks. `grep -rn "TODO(santheesh)\|<Todo>" content` lists them all.

## Assets

- [ ] Portrait photo (for `/about`)
- [ ] Resume PDF (the resume button stays hidden until it exists)
- [ ] Clash Display + General Sans font files. Fontshare was unreachable from the build
      environment, so Bricolage Grotesque + Geist ship as the documented fallbacks. Drop the
      `.woff2` files into `app/fonts/` and update `app/fonts.ts` (subset them to Latin like the
      current files to keep page weight down).
- [ ] HeartTune media: the live site was unreachable from the build machine and the repo is
      private. Run `pnpm media hearttune` from a machine that can reach it (it shows a spec
      plate until then).
- [ ] MINCHAL media was captured from a local build of `Minchal-deploy` (home page only, no
      mock data). Re-run `pnpm media minchal` against the live site if you prefer.

## Roles and team

- [ ] PRYSM role: the repo's team table says "Backend lead: FastAPI, OCR pipeline, database,
      compliance engine" (Team Ragnarok). Shown on the site; confirm or correct.
- [ ] AHAL AI V2 role: the repo's team table says "AI engineer". Shown; confirm or correct.
- [ ] NISF role
- [ ] BHOOMI role
- [ ] Confirm these were solo builds: Pulse, MINCHAL, Orion, Frontend Craft, HeartTune,
      Orchestrate skill (the role line stays hidden until confirmed)

## Facts

- [ ] Hackathon results: GDG "Build with AI: Tech for Good 2026" (MINCHAL), Smart India Hackathon (BHOOMI)
- [ ] Education timeline
- [ ] Experience timeline
- [ ] Project years: Pulse, Orion, Frontend Craft, PRYSM, AHAL, HeartTune, NISF, BHOOMI,
      Orchestrate skill (MINCHAL is shown as 2026, from the event name)
- [ ] HeartTune details (repo has no README and is private)
- [ ] NISF details
- [ ] BHOOMI details
- [ ] "What I learned" for each case study, in your own words
- [ ] Repo links that are not publicly reachable, so they are not linked on the site:
      HeartTune (private), NISF_V2, Bhoomi-SIH-Agri. Make them public or send the right URLs.
- [ ] Production domain (for `SITE_URL`, sitemap, OG)
