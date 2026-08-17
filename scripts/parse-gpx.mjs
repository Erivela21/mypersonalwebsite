// Parse the Strava GPX into a small embeddable dataset.
// 14.5 MB of trackpoints is not something to ship; this reduces it to a few KB
// while keeping the real shape, the real profile, and the real numbers.

import { readFileSync, writeFileSync } from "node:fs";

const src = process.argv[2];
const raw = readFileSync(src, "utf8");

/* ------------------------------------------------------------------ parse -- */

const pts = [];
const re =
  /<trkpt lat="([-\d.]+)" lon="([-\d.]+)">\s*<ele>([-\d.]+)<\/ele>\s*<time>([^<]+)<\/time>/g;
let m;
while ((m = re.exec(raw))) {
  pts.push({
    lat: +m[1],
    lon: +m[2],
    ele: +m[3],
    t: Date.parse(m[4]),
  });
}
if (!pts.length) throw new Error("no trackpoints matched");

/* --------------------------------------------------------------- distance -- */

const R = 6371000;
const rad = (d) => (d * Math.PI) / 180;
function haversine(a, b) {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

let total = 0;
const cum = [0];
for (let i = 1; i < pts.length; i++) {
  total += haversine(pts[i - 1], pts[i]);
  cum.push(total);
}

/* -------------------------------------------------------------- elevation -- */

// Raw GPS elevation is noisy; summing every positive delta inflates gain badly.
// Smooth over a rolling window first, then only count rises above a threshold.
const win = 15;
const smooth = pts.map((_, i) => {
  const lo = Math.max(0, i - win);
  const hi = Math.min(pts.length - 1, i + win);
  let s = 0;
  for (let j = lo; j <= hi; j++) s += pts[j].ele;
  return s / (hi - lo + 1);
});

let gain = 0;
let loss = 0;
let anchor = smooth[0];
for (let i = 1; i < smooth.length; i++) {
  const d = smooth[i] - anchor;
  if (d > 1.5) {
    gain += d;
    anchor = smooth[i];
  } else if (d < -1.5) {
    loss += -d;
    anchor = smooth[i];
  }
}

const eleMin = Math.min(...smooth);
const eleMax = Math.max(...smooth);
const durMs = pts[pts.length - 1].t - pts[0].t;

/* ------------------------------------------------- simplify route (RDP) -- */

// Project to metres so the tolerance is in real units, not degrees.
const lat0 = pts[0].lat;
const mx = pts.map((p) => rad(p.lon) * R * Math.cos(rad(lat0)));
const my = pts.map((p) => rad(p.lat) * R);

function rdp(indices, tol) {
  if (indices.length < 3) return indices;
  const first = indices[0];
  const last = indices[indices.length - 1];
  let maxD = -1;
  let idx = -1;

  const x1 = mx[first], y1 = my[first], x2 = mx[last], y2 = my[last];
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy;

  for (let k = 1; k < indices.length - 1; k++) {
    const i = indices[k];
    let d;
    if (len2 === 0) {
      d = Math.hypot(mx[i] - x1, my[i] - y1);
    } else {
      const t = Math.max(0, Math.min(1, ((mx[i] - x1) * dx + (my[i] - y1) * dy) / len2));
      d = Math.hypot(mx[i] - (x1 + t * dx), my[i] - (y1 + t * dy));
    }
    if (d > maxD) { maxD = d; idx = k; }
  }

  if (maxD <= tol) return [first, last];
  return [
    ...rdp(indices.slice(0, idx + 1), tol),
    ...rdp(indices.slice(idx), tol).slice(1),
  ];
}

const all = pts.map((_, i) => i);
// Walk the tolerance up until the point count is small enough to embed.
let tol = 8;
let keep = rdp(all, tol);
while (keep.length > 620 && tol < 400) {
  tol *= 1.35;
  keep = rdp(all, tol);
}

const minX = Math.min(...keep.map((i) => mx[i]));
const maxX = Math.max(...keep.map((i) => mx[i]));
const minY = Math.min(...keep.map((i) => my[i]));
const maxY = Math.max(...keep.map((i) => my[i]));
const wM = maxX - minX;
const hM = maxY - minY;
const span = Math.max(wM, hM);

// Normalised into a centred 0..1 box with the true aspect preserved, y flipped
// so north points up in SVG coordinates. Centring here means the component can
// use a fixed viewBox and never has to recompute a bounding box.
const padX = (1 - wM / span) / 2;
const padY = (1 - hM / span) / 2;
const route = keep.map((i) => [
  +((mx[i] - minX) / span + padX).toFixed(4),
  +(1 - ((my[i] - minY) / span + padY)).toFixed(4),
]);

// Distance travelled at each kept point, as a fraction of the total. Lets the
// route marker and the elevation marker stay in sync with each other.
const routeAt = keep.map((i) => +(cum[i] / total).toFixed(4));

/* --------------------------------------------- elevation profile by dist -- */

const N = 240;
const profile = [];
let cursor = 0;
for (let k = 0; k < N; k++) {
  const target = (k / (N - 1)) * total;
  while (cursor < cum.length - 1 && cum[cursor] < target) cursor++;
  profile.push(+smooth[cursor].toFixed(1));
}

/* ------------------------------------------------------------------ out -- */

const hours = Math.floor(durMs / 3600000);
const mins = Math.round((durMs % 3600000) / 60000);

const out = {
  name: "Estrelaçor",
  distanceKm: +(total / 1000).toFixed(1),
  elevationGainM: Math.round(gain),
  elevationLossM: Math.round(loss),
  eleMinM: Math.round(eleMin),
  eleMaxM: Math.round(eleMax),
  movingTime: `${hours}h ${String(mins).padStart(2, "0")}m`,
  startedAt: new Date(pts[0].t).toISOString(),
  aspect: +(wM / hM).toFixed(3),
  route,
  routeAt,
  profile,
};

console.log({
  trackpoints: pts.length,
  distanceKm: out.distanceKm,
  gain: out.elevationGainM,
  loss: out.elevationLossM,
  eleMin: out.eleMinM,
  eleMax: out.eleMaxM,
  movingTime: out.movingTime,
  startedAt: out.startedAt,
  routePoints: route.length,
  rdpToleranceM: Math.round(tol),
  bboxKm: `${(wM / 1000).toFixed(1)} x ${(hM / 1000).toFixed(1)}`,
  aspect: out.aspect,
  avgSpeedKmh: +((total / 1000) / (durMs / 3600000)).toFixed(2),
});

writeFileSync(process.argv[3], JSON.stringify(out));
console.log("wrote", process.argv[3], (JSON.stringify(out).length / 1024).toFixed(1) + " KB");
