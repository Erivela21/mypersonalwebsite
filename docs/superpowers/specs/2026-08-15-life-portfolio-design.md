# Enrique Rivela — personal site

**Design spec.** 2026-08-15.

A digital life portfolio. Not a portfolio, not a CV, not a freelancer profile.

---

## Creative direction

> A beautifully crafted, lighthearted digital notebook of a young technologist's
> life — where security, technology, music, sport, travel and curiosity naturally
> coexist.

**Human first, impressive second.** Design + honesty + personality, never bragging.

### The organizing idea: one line

A single continuous line runs the length of the site and changes meaning per chapter:

| Chapter  | The line is… |
| -------- | ------------ |
| Hero     | a river      |
| Places   | a flight path |
| Moving   | a ridge / elevation profile |
| Sound    | a waveform   |
| Building | a pipeline between systems |
| Cyber    | edges in a network graph |
| Now      | unfinished — it runs off the bottom of the page |

Cheap to render (SVG `pathLength` driven by scroll), so the site stays *light*.
Demonstrates craft without a word of self-promotion.

### Influences

Ghibli warmth · Monument Valley soft geometry · Nintendo/DS nostalgia ·
*The Midnight Library* (structure: a life with chapters, ending open) ·
NotebookLM (motion quality only).

Never: literal Ghibli assets, Matrix green, hacker skulls, SaaS cards,
glassmorphism, neon cyberpunk, stock imagery.

---

## Visual identity

### Palette — "Green World"

Derived from the user's own Galicia photographs.

**Light — day**

```
paper   #F6F4ED    ink     #1E2A22    moss   #46654C
river   #5F8794    sand    #E2D8C4    stone  #9A9C90    clay #B96C4C
```

**Dark — midnight.** A deliberate second design, not an inversion. Anchored on the
dusk alpenglow of `snow.png`.

```
ground  #0F1512    raised  #18211B    ink    #E9E7DB
moss    #86A98B    river   #7FA9B8    clay   #D68C68
```

Per-chapter **tint** from the shared set, so chapters read as rooms in one house:
Hero moss/river · Places river/sand · **Moving clay** · **Sound moss/gold** ·
Building stone/river · Cyber ink/teal · Now gold.

A paper grain overlays the whole site at ~3%.

### Typography

- **Fraunces** — display. Variable `SOFT`/`WONK` axes = handcrafted warmth.
- **Instrument Sans** — body. Humanist, warm, not Inter.
- **JetBrains Mono** — technical. Distances, dates, node labels, coordinates.
  Makes measured facts read as *recorded* rather than *claimed*.

### Illustration & photography

Soft geometry: flat two-tone shaded SVG, isometric-leaning, no outlines. Tiny
ambient motion (2–4px). Photographs are the user's own, ungraded — honest phone
photos are the point. Video muted, looped, poster-framed, plays on scroll-into-view.

---

## Structure

1. **Hero** — isometric valley, name, honest lede. The line begins.
2. **Places** — Madrid → Menlo Park → Madrid → São Paulo, told in ages not years.
3. **Elsewhere** (interlude) — landscape photo strip, captioned without invention.
4. **Moving** *(priority 1)* — Estrelaçor 103 km. Scroll-drawn ridge + km markers.
5. **Sound** *(priority 2)* — Web Audio player + playable waveform toy. Never autoplays.
6. **Building** *(priority 3)* — IE, Deanna, Kabel. The least decorated chapter.
7. **Cyber** — self-assembling force-directed network, red/blue team.
8. **Now** — São Paulo. The line runs off the page.

Navigation is the line: a hairline left rail with a dot per chapter. Real keyboard
menu and skip link behind it.

---

## Motion

Level 2 — *alive, never loud*. Springs (`stiffness 120 · damping 20`), 14px rise +
fade entrances, 50ms stagger, line-by-line masked heading reveals.

**Rule: if a motion doesn't explain something about the content, it doesn't ship.**

Cursor: soft moss blob on a spring that *does meaningful things* — disturbs photos,
ripples water, plucks the waveform, pushes network nodes. Off on touch and under
reduced motion.

`prefers-reduced-motion` is a second design, not a kill switch: line renders
complete, ambient loops stop, everything sits in final state, site stays beautiful.

---

## Tech

`Next.js 16.3.1 · React 19 · TypeScript · Tailwind v4 · Motion 13 · SVG · Canvas 2D · Web Audio`

Rejected: Three.js (SVG is sharper and ~400KB lighter here), Mapbox (heavy, and its
default look is the corporate feel we're avoiding), GSAP (Motion covers it).

Canvas pauses off-screen via `IntersectionObserver`. `AudioContext` constructed only
on user gesture. No `Math.random()` at render — deterministic paths, no hydration
mismatch.

**v16 specifics observed:** Turbopack default · `opengraph-image` params are Promises ·
`data-scroll-behavior="smooth"` needed on `<html>` · `images.qualities` defaults `[75]`.

---

## Content rules

All facts live in `src/content/profile.ts`. **Nothing is invented.** Optional fields
render nothing when empty, so the site is complete today and improves as the user
drops in files.

Sourced from: the user's answers, and `Enrique_Rivela_CV_FINAL.pdf`.

**Deliberately excluded** pending confirmation:
- Ultra finish time / location — unknown, so no time is displayed.
- No marathon is mentioned anywhere (user explicitly removed it).
- Ironman — listed under CV "interests"; ambiguous, so omitted.
- eJPT — CV says "expected Dec 2025", now past; stated without a date.

**Awaiting user drop-in:** `public/audio/` tracks · `public/media/covers/` art ·
Strava GPX for the real route · portrait · São Paulo photos.
