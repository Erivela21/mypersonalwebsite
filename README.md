# enrique-rivela

A personal site. Not a portfolio, not a CV — a life told in chapters.

```bash
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

`Next.js 16 · React 19 · TypeScript · Tailwind v4 · Motion 13 · SVG · Canvas 2D · Web Audio`

---

## The route data

`src/content/route.ts` is generated, not written. It comes from Enrique's Strava
GPX export via:

```bash
node --stack-size=8000 scripts/parse-gpx.mjs <input.gpx> route.json
```

The raw export is 14.5 MB and 52,291 trackpoints. **Do not commit it.** The
script reduces it to 547 points with Ramer-Douglas-Peucker at a 20 m tolerance,
which is ~19 KB of TypeScript and holds every real bend in the course.

Two things in there are deliberate:

- **Elevation gain is computed from a smoothed trace**, not from raw deltas.
  Summing every positive GPS delta over 52k points inflates gain by a large
  factor, because barometric noise reads as thousands of tiny climbs. The script
  takes a rolling mean over a 15-point window, then only counts rises above
  1.5 m.
- **Coordinates are centred in a 0..1 box with true aspect preserved**, so the
  component can use a fixed viewBox and never recompute a bounding box.

Every number in the Moving chapter is measured from this file.

**The two distance figures are the point of that chapter.** He entered the 103 km
race and covered 89.2 km of it before stopping. Do not collapse them into one
number, do not round 89.2 up, and do not describe the run as a finish. The trace
ends where he stopped, which is why the end marker on the map reads `STOPPED`.

## React Bits

`src/components/reactbits/` holds four components adapted from
[React Bits](https://reactbits.dev) (MIT): `CountUp`, `Magnet`, `CoverStack`
(their `Stack`) and `Aurora`. Each file documents what changed and why. The
recurring themes:

- **They are written as demos.** Several mutate refs during render, call
  `Math.random()` during render (hydration mismatch), or allocate inside a
  `requestAnimationFrame` loop.
- **None of them handled `prefers-reduced-motion`.** All four do now.
- **None were keyboard reachable.** `CoverStack` needed a real button, or the
  cards underneath were unreachable.

`Aurora` is the only one with a dependency (`ogl`). It is loaded through
`AuroraBackdrop`, which `next/dynamic`s it into a separate ~49 KB chunk and
mounts it only when visible and only when reduced motion is off. Measured: a
reduced-motion visitor fetches 663 KB of JS, everyone else 712 KB, so the shader
is genuinely opt-in rather than a tax on the whole site.

Its colours are read from the live CSS tokens, so day and midnight get different
auroras from one shader.

## Voice

The copy rules are not stylistic preferences, they are the brief:

- **No em dashes.** Anywhere in user-facing text. They are the clearest tell.
- **Casual and first person**, the way he actually talks. Contractions wanted.
- Section labels are first person too. "Languages I speak", not "Speaks".
- No clever inversions, no rule-of-three, no aphorisms. If a line sounds like it
  was written to be quoted, it is wrong for this site.

## Change the words, not the code

**Everything the site says lives in [`src/content/profile.ts`](src/content/profile.ts).**
No copy is hardcoded in a component. If a fact is wrong, fix it there and it
updates everywhere — headings, alt text, share card, page metadata.

Optional fields render nothing when empty, so the site is complete as it stands
and quietly improves as you add to it.

## Things to drop in

Each of these lights up on its own the moment the file exists.

### Music → `public/audio/`

Add mp3s, then list them in `sound.tracks`:

```ts
tracks: [
  { title: "Track name", src: "/audio/track.mp3", cover: "/media/covers/art.png" },
],
```

Until then the Sound chapter shows the playable strip only — which is a real
instrument, not a decorative waveform, so the section is honest either way.

### Cover art → `public/media/covers/`

Any square image. Reference it from a track's `cover`.

### The ultra route → `moving.race`

```ts
race: {
  finishTime: "18:42",        // appears as a stat
  elevationGainM: 4200,       // appears as a stat
  date: "June 2025",
  location: "Portugal",
  gpx: "/data/estrelacor.gpx",
}
```

The chart currently draws generic terrain and says so underneath. Supplying
`gpx` replaces it with the real profile and removes that note. Any stat left
`null` is simply not shown — nothing is ever estimated.

### Photographs → `public/media/`

Add the file, then add an entry to `elsewhere.shots` with real `w`/`h` (the
intrinsic pixel size — it reserves the space and prevents layout shift) and a
truthful caption.

---

## How it's put together

```
src/
  content/profile.ts     every fact, one file
  app/                   layout, page, metadata, OG image, robots, sitemap
  components/
    chapters/            one file per chapter of the site
    art/                 Facets, Journey, Ridge, SoundStrip, Network, BookCover
    primitives/          Chapter, Reveal, SplitHeading, Photo, Film, Thread
    chrome/              rail, cursor, theme toggle, footer, motion provider
  lib/                   motion vocabulary, hooks, the small synth
```

Chapters are server components; only the interactive art ships JavaScript.

### Chapters

`Hero · Things I do · Moving · Sound · Building · Cyber · Now`

There is no Places chapter. It was cut, so the only place the Madrid → Menlo
Park → Madrid → São Paulo journey is now stated is the first paragraph of
`now.body`. Don't delete that line without putting it somewhere else.

### The line

One line runs the length of the page and changes meaning per chapter: a ridge
over 103km, a waveform, an edge in a network. `Thread` carries it between
chapters, drawing against scroll position rather than on a timer. It never
terminates.

### The hero

Real photographs, not illustration. An earlier version used a drawn landscape
and it read as generic no matter how it was drawn. `Facets` arranges five of
Enrique's own photos, one per thing the site is about, each drifting at its own
rate against the pointer. Card placement in `LAYOUT` is hand-set on purpose:
evenly spaced reads as a gallery, random reads as a mistake.

Each facet carries a `focus` value in the content file, because a 3:4 crop of a
portrait photo will otherwise cut the subject out.

### Motion

Springs, not easing curves. One entrance: a 14px rise plus a fade.

**If a motion doesn't explain something about the content, it doesn't ship.**

`MotionConfig reducedMotion="user"` in the root layout means components should
**not** branch on the motion preference for ordinary animations — Motion snaps
transforms to their targets automatically. Branch only for perpetual loops,
scroll-linked drawing, and canvas loops, and when you do, use
`useReducedMotionSafe` from `lib/hooks` rather than Motion's own hook: the
latter can report a different value on the first client render than the server
assumed, which breaks hydration.

### Theme

`data-theme` on `<html>` is the single source of truth. An inline script in the
layout sets it before first paint; the toggle writes to it; the toggle reads it
back with `useSyncExternalStore`. Dark isn't an inverted light theme — it has
its own palette.

### Canvas

`Network` and `SoundStrip` pause when scrolled out of view and read their
colours through `useCssVars`, which re-resolves on theme change. Canvas can't
read `var(--accent)` on its own.

Audio is never constructed until a real gesture, and nothing ever autoplays.
