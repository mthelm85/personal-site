# The Statistician's Garden — v1 build plan

A ground-up rebuild of matthelm.pro as an explorable, cartoonish 3D garden where
everything growing is a real statistical process. This document is the working
plan; update it as decisions change.

## Vision in one paragraph

A bright, stylized, storybook garden honoring statistics' horticultural origins
(Fisher's field trials at Rothamsted, Galton's sweet peas, Mendel's pea patch).
Visitors walk it by clicking waypoints. Every specimen is labeled like a real
botanical garden — with its true mathematical name — and every specimen's
behavior is the genuine process, never a canned animation. The garden grows over
time: new interactive objects are planted between visits, each with a
"planted YYYY" date on its placard.

## Principles (settled during design, do not relitigate casually)

1. Simple enough for anyone without recognizing any math; rigorous enough to
   reward someone who does. No comprehension gates on primary content.
2. The site must feel like **navigation** — a place with geography, agency, and
   wayfinding — never a ride, a scrubbed movie, or a passive process.
3. One unified concept. No theme mashups.
4. Deliberately cartoonish art direction: flat-shaded, low-poly, bright daylight,
   fresh palette. Never photoreal, never the muddy middle. The old site's
   "Palimpsest" identity (name, concept, dark indigo/lavender/amber palette) is
   fully retired.
5. Awwwards-tier craft bar: custom shaders, real motion design, seamless
   transitions, loader-as-experience, gentle sound. A small garden where
   everything meets the bar beats a big garden at medium polish.
6. Every specimen's math must be real and verifiable (the placard names it).
7. Recruiter fast path is sacred: name → who → contact in under 30 seconds
   without touching 3D.

## Stack

- **SvelteKit + Svelte 5 (existing) + Threlte v8** (`@threlte/core`,
  `@threlte/extras`) — declarative three.js scene graph in Svelte idiom,
  compatible with runes. Drop to raw three.js freely for custom
  shaders/materials (grass, water, sky) — Threlte doesn't get in the way.
- **Rapier or no physics engine in v1** — nothing in v1 needs real physics;
  defer until an object requires it (Galton machine, v2+).
- **GSAP** (already a dep) for camera/UI motion timelines.
- **Blender → glTF (+ meshopt compression)** for modeled props (shed, sign,
  fences). Procedural geometry in code for everything mathematical (tree,
  grass, flowers).
- **Audio**: Howler or plain WebAudio; CC0 sources (freesound); off by default
  with visible toggle.
- Same repo, long-lived branch (`garden`), old site keeps running on `main`
  until M6 swap. Keeps domain/deploy pipeline intact.

## Capability tiers (decide on first load, allow manual override)

1. Probe: WebGL2 context creation + a ~10-frame render benchmark + DPR/mobile
   heuristics.
2. **Tier full**: everything.
3. **Tier reduced**: lower grass density, no shadows, capped DPR, shorter draw
   distance. Same content.
4. **Tier none / plain**: redirect to `/plain` — the complete flat site.
   Also linked visibly from the garden ("plain-text version →", top right) as
   the recruiter path, the accessibility path, and the SEO surface.

## Architecture

- `/` — the garden. `/plain` — complete flat HTML site (all content, no 3D).
- **Specimen module system**: each garden object is a self-contained lazy-loaded
  module declaring: geometry/model, placement, placard text (name + planted
  date), interaction handlers, and an optional DOM content panel. A single
  manifest (`specimens.ts`) lists what's planted; adding a future object = one
  module + one manifest row.
- **Content is DOM, not 3D text**: overlays/panels rendered by Svelte above the
  canvas — selectable, accessible, SEO-visible. The 3D scene is navigation and
  delight; prose lives in HTML.
- **State**: quality tier, camera target/mode, active specimen, audio on/off,
  visited set — small rune-based stores.
- **Walk system**: fixed waypoint graph on the garden path (hand-placed nodes).
  Click a glowing waypoint (or a specimen) → camera travels with easing +
  arrival settle. Touch = tap. Keyboard = tab between waypoints + enter.

## v1 content mapping

| Place in garden | Content | Notes |
|---|---|---|
| Landing overlay | Name, one-liner, "walk in", plain-text link | Dismisses into the garden |
| Notice board (near entrance) | About/bio | Wooden sign, carved-ish type |
| Potting shed (door panel) | Contact + resume | The warm destination; interior deferred |
| Galton–Watson tree | Playful specimen + placard | Regrows on interaction; branching process is real |
| Fisher bed (one Latin-square plot) | First project vignette (causal inference day job) | Placard explains the design honestly |
| Placards everywhere | The rigor layer | Botanical-garden convention |

Projects beyond the first vignette stay on `/plain` for v1 (built at M6); a
"seed packet rack" in the shed is the earmarked v2 home for the full project
list.

## Milestones (each independently shippable)

- **M0 — Foundation.** Branch, Threlte setup, capability probe. Straight into
  3D — no flat site first (Matt's explicit call: motivation lives in the 3D
  work). Old site untouched on main.
- **M1 — The shell.** Terrain, hedge/fence boundary, sky, lighting, pond
  water shader. Static camera. ~~Stylized grass shader~~ (built, then cut
  2026-07-04: not worth the complexity/noise — vertex-colored terrain
  carries the meadow). Mobile perf gate waived; desktop-first for now.
- **M2 — Walking.** Waypoint graph, click/tap-to-walk, camera easing + arrival
  behavior, hover states, keyboard path. The garden *feels like navigation*
  here or we stop and fix it.
- **M3 — First inhabitants.** Shed (modeled), notice board, placard system,
  landing overlay. Site is now minimally complete: who/what/contact all in-world.
- **M4 — The tree.** Procedural Galton–Watson growth animation, placard,
  click-to-regrow (new random realization each time). First real specimen.
- **M5 — Craft pass.** Fisher bed + first project panel; seed-sprout loader;
  ambient audio + toggle; transition polish; reduced tier tuning.
- **M6 — Launch gate + swap.** Build `/plain` (complete flat content site —
  required before swap, not before building: it's the tier-none fallback, the
  SEO surface, and the recruiter fast path). Then garden replaces old site at
  `/`; palimpsest retired; announce.

## Performance budgets (v1)

- First meaningful paint of the loader < 1s on cable; total v1 payload ≤ ~6 MB.
- 60 fps on a mid-2020s laptop iGPU at tier full; 30+ fps tier reduced on a
  mid-range phone (deferred — desktop-first per Matt, revisit at M6).
- DPR capped at 2; no shadow maps below tier full.

## Backlog (v2+, in no order — each is one specimen module)

- Multi-armed-bandit bees foraging between flower patches
- Mendel's pea patch (interactive 3:1 cross)
- Galton's sweet-pea trellis (regression to the mean vignette)
- Poisson-process rain + AR/OU weather; possible real time-of-day
- Galton board as a shed shelf toy (physics)
- Kriging/Gaussian-process soil moisture easter egg
- Guitar in the shed → Fourier/DSP toy
- Seed packet rack = full projects list
- Cursor-attention KDE easter egg ("the empirical distribution of you")
- Chessboard on a garden table, mid-game

## Risks / honest unknowns

- **Blender ramp-up** for the shed/props — mitigate with CC0 low-poly packs
  (Kenney, Quaternius) restyled to palette, or keep v1 props primitive-based.
- **Scope creep at the craft bar** — the bar applies to what ships, not to how
  much ships. Cut objects, never polish.
- Audio licensing: CC0 only, keep a sources list.
