"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { route } from "@/content/route";
import { useReducedMotionSafe } from "@/lib/hooks";

/**
 * The actual route, from Enrique's own GPS.
 *
 * Two views of one run: the shape of the course, and its elevation. Both are
 * driven by the same scroll progress, so the marker on the map and the marker
 * on the profile are always at the same point in the race. You cover the
 * distance at your own pace rather than watching a canned animation of someone
 * else covering it.
 *
 * Nothing here is drawn by hand. Every bend is a place he actually ran.
 */

const W = 1000;
const MAP_H = W / route.aspect;
const MAP_Y0 = (W - MAP_H) / 2;

const PROF_W = 1000;
const PROF_H = 190;
const PROF_TOP = 14;
const PROF_FLOOR = 168;

const PTS = route.points.map(([x, y]) => [x * W, y * W] as const);
const PATH = PTS.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");

const ELE_SPAN = route.eleMaxM - route.eleMinM;
const PROF_PTS = route.profile.map((e, i) => [
  (i / (route.profile.length - 1)) * PROF_W,
  PROF_FLOOR - ((e - route.eleMinM) / ELE_SPAN) * (PROF_FLOOR - PROF_TOP),
] as const);
const PROF_PATH = PROF_PTS.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
const PROF_AREA = `${PROF_PATH} L ${PROF_W} ${PROF_FLOOR} L 0 ${PROF_FLOOR} Z`;

/** Position on the map at a given fraction of total distance travelled. */
function sampleRoute(t: number) {
  const target = Math.min(Math.max(t, 0), 1);
  const at = route.at;
  let lo = 0;
  let hi = at.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (at[mid] < target) lo = mid;
    else hi = mid;
  }
  const seg = at[hi] - at[lo] || 1;
  const f = (target - at[lo]) / seg;
  return {
    x: PTS[lo][0] + (PTS[hi][0] - PTS[lo][0]) * f,
    y: PTS[lo][1] + (PTS[hi][1] - PTS[lo][1]) * f,
  };
}

function sampleProfile(t: number) {
  const idx = Math.min(Math.max(t, 0), 1) * (PROF_PTS.length - 1);
  const i = Math.min(Math.floor(idx), PROF_PTS.length - 2);
  const f = idx - i;
  return {
    x: PROF_PTS[i][0] + (PROF_PTS[i + 1][0] - PROF_PTS[i][0]) * f,
    y: PROF_PTS[i][1] + (PROF_PTS[i + 1][1] - PROF_PTS[i][1]) * f,
    ele: route.profile[i] + (route.profile[i + 1] - route.profile[i]) * f,
  };
}

export function RouteMap() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionSafe();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 70%"],
  });
  const p = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 26,
    restDelta: 0.0005,
  });

  const mapX = useTransform(p, (t) => sampleRoute(t).x);
  const mapY = useTransform(p, (t) => sampleRoute(t).y);
  const profX = useTransform(p, (t) => sampleProfile(t).x);
  const profY = useTransform(p, (t) => sampleProfile(t).y);

  const km = useTransform(p, (t) => (t * route.distanceKm).toFixed(1));
  const ele = useTransform(p, (t) => Math.round(sampleProfile(t).ele).toString());
  const reveal = useTransform(p, (t) => t * PROF_W);

  const finish = PTS[PTS.length - 1];

  return (
    <div ref={ref} className="w-full">
      <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-center">
        {/* ── the course ── */}
        <svg
          viewBox={`0 ${MAP_Y0} ${W} ${MAP_H}`}
          className="h-auto w-full overflow-visible"
          role="img"
          aria-label={`The route of the ${route.name} race, ${route.distanceKm} kilometres through the Serra da Estrela`}
        >
          {/* A faint full trace underneath, so the shape reads as a whole
              course even before you have scrolled through it. */}
          <path
            d={PATH}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity="0.18"
          />
          <motion.path
            d={PATH}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.6"
            strokeLinejoin="round"
            strokeLinecap="round"
            style={reduced ? { pathLength: 1 } : { pathLength: p }}
          />

          <circle cx={PTS[0][0]} cy={PTS[0][1]} r="7" fill="var(--accent)" />
          <circle cx={PTS[0][0]} cy={PTS[0][1]} r="3" fill="var(--paper)" />
          <circle
            cx={finish[0]}
            cy={finish[1]}
            r="6"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.4"
          />

          {!reduced && (
            <motion.g style={{ x: mapX, y: mapY }}>
              <circle r="16" fill="var(--accent)" opacity="0.14" />
              <circle r="6" fill="var(--accent)" />
              <circle r="2.4" fill="var(--paper)" />
            </motion.g>
          )}
        </svg>

        {/* ── the climbing ── */}
        <div>
          <svg
            viewBox={`0 0 ${PROF_W} ${PROF_H}`}
            className="h-auto w-full"
            role="img"
            aria-label={`Elevation profile: ${route.elevationGainM} metres of climbing, between ${route.eleMinM} and ${route.eleMaxM} metres`}
          >
            <defs>
              <linearGradient id="prof-fill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="color-mix(in oklab, var(--accent) 34%, transparent)"
                />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              <clipPath id="prof-reveal">
                <motion.rect
                  x="0"
                  y="0"
                  height={PROF_H}
                  style={reduced ? { width: PROF_W } : { width: reveal }}
                />
              </clipPath>
            </defs>

            <line
              x1="0"
              y1={PROF_FLOOR}
              x2={PROF_W}
              y2={PROF_FLOOR}
              stroke="var(--rule)"
              strokeWidth="1"
            />

            <path d={PROF_PATH} fill="none" stroke="var(--accent)" strokeWidth="1.4" opacity="0.2" />
            <g clipPath="url(#prof-reveal)">
              <path d={PROF_AREA} fill="url(#prof-fill)" />
              <path
                d={PROF_PATH}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
            </g>

            {!reduced && (
              <motion.g style={{ x: profX, y: profY }}>
                <circle r="5" fill="var(--accent)" />
                <circle r="2" fill="var(--paper)" />
              </motion.g>
            )}

            <text
              x="0"
              y={PROF_H - 6}
              fill="var(--ink-faint)"
              fontSize="13"
              fontFamily="var(--font-mono)"
              letterSpacing="0.1em"
            >
              {route.eleMinM} M
            </text>
            <text
              x={PROF_W}
              y={PROF_H - 6}
              textAnchor="end"
              fill="var(--ink-faint)"
              fontSize="13"
              fontFamily="var(--font-mono)"
              letterSpacing="0.1em"
            >
              {route.eleMaxM} M AT THE TOP
            </text>
          </svg>

          {/* Live readout, so the two markers have something to report. */}
          <div className="mt-5 flex items-baseline gap-6 border-t border-rule pt-4">
            <p className="mono text-faint">
              {reduced ? (
                <span className="numeral text-accent-text">{route.distanceKm}</span>
              ) : (
                <motion.span className="numeral text-accent-text">{km}</motion.span>
              )}
              <span> / {route.distanceKm} km</span>
            </p>
            {/* This tracks altitude at the current point, not cumulative
                climb. Cumulative gain is a separate stat in the chapter. */}
            <p className="mono text-faint">
              {reduced ? (
                <span className="numeral text-accent-text">{route.eleMaxM}</span>
              ) : (
                <motion.span className="numeral text-accent-text">{ele}</motion.span>
              )}
              <span> m altitude</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
