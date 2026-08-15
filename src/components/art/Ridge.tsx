"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { moving } from "@/content/profile";
import { useReducedMotionSafe } from "@/lib/hooks";

/**
 * The long way, drawn as terrain.
 *
 * The line advances against scroll with a marker riding its head, so the
 * reader covers the distance at their own pace rather than watching a canned
 * animation of someone else covering it.
 *
 * The terrain shape is deliberately generic — see the note rendered below the
 * chart. The moment a real GPX lands in the content file, this becomes the
 * actual profile and the note disappears.
 */

const W = 1200;
const H = 320;
const PAD_X = 56;
const TOP = 44;
const FLOOR = 268;

// Deterministic. A rolling mountain course, no random at render time.
const ELEV = [
  0.06, 0.11, 0.2, 0.33, 0.29, 0.42, 0.56, 0.5, 0.63, 0.76, 0.71, 0.58, 0.46,
  0.38, 0.5, 0.62, 0.78, 0.9, 0.85, 0.72, 0.6, 0.49, 0.41, 0.53, 0.66, 0.59,
  0.47, 0.35, 0.27, 0.39, 0.53, 0.68, 0.8, 0.74, 0.61, 0.49, 0.37, 0.29, 0.21,
  0.33, 0.25, 0.17, 0.11, 0.05,
];

const PTS = ELEV.map((e, i) => ({
  x: PAD_X + (i / (ELEV.length - 1)) * (W - PAD_X * 2),
  y: FLOOR - e * (FLOOR - TOP),
}));

const LINE = PTS.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
const AREA = `${LINE} L ${PTS[PTS.length - 1].x} ${FLOOR} L ${PTS[0].x} ${FLOOR} Z`;

const TICKS = [0, 20, 40, 60, 80, 103];

/** Walks the polyline to find the point at a given fraction of total length. */
function sample(t: number) {
  const clamped = Math.min(Math.max(t, 0), 1);
  const target = clamped * (PTS.length - 1);
  const i = Math.min(Math.floor(target), PTS.length - 2);
  const f = target - i;
  return {
    x: PTS[i].x + (PTS[i + 1].x - PTS[i].x) * f,
    y: PTS[i].y + (PTS[i + 1].y - PTS[i].y) * f,
  };
}

export function Ridge() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionSafe();
  const { race } = moving;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 92%", "end 78%"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 70, damping: 26, restDelta: 0.001 });

  const cx = useTransform(p, (t) => sample(t).x);
  const cy = useTransform(p, (t) => sample(t).y);
  const revealW = useTransform(p, (t) => t * W);
  const km = useTransform(p, (t) => Math.round(t * race.distanceKm));

  return (
    <div ref={ref} className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Elevation profile across ${race.distanceKm} kilometres`}
      >
        <defs>
          <linearGradient id="ridge-fill" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="color-mix(in oklab, var(--accent) 30%, transparent)"
            />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <clipPath id="ridge-reveal">
            <motion.rect
              x="0"
              y="0"
              height={H}
              style={reduced ? { width: W } : { width: revealW }}
            />
          </clipPath>
        </defs>

        {/* baseline and distance ticks */}
        <line
          x1={PAD_X}
          y1={FLOOR}
          x2={W - PAD_X}
          y2={FLOOR}
          stroke="var(--rule)"
          strokeWidth="1"
        />
        {TICKS.map((t) => {
          const x = PAD_X + (t / race.distanceKm) * (W - PAD_X * 2);
          return (
            <g key={t}>
              <line
                x1={x}
                y1={FLOOR}
                x2={x}
                y2={FLOOR + 7}
                stroke="var(--rule)"
                strokeWidth="1"
              />
              <text
                x={x}
                y={FLOOR + 26}
                textAnchor="middle"
                fill="var(--ink-faint)"
                fontSize="12"
                fontFamily="var(--font-mono)"
                letterSpacing="0.08em"
              >
                {t === race.distanceKm ? `${t} KM` : t}
              </text>
            </g>
          );
        })}

        <g clipPath="url(#ridge-reveal)">
          <path d={AREA} fill="url(#ridge-fill)" />
        </g>

        <motion.path
          d={LINE}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={reduced ? { pathLength: 1 } : { pathLength: p }}
        />

        {/* the marker riding the head of the line */}
        {!reduced && (
          <motion.g style={{ x: cx, y: cy }}>
            <circle r="13" fill="var(--accent)" opacity="0.16" />
            <circle r="5" fill="var(--accent)" />
            <circle r="2" fill="var(--paper)" />
          </motion.g>
        )}
      </svg>

      <div className="mt-3 flex items-baseline justify-between gap-4">
        <p className="mono text-faint">
          {reduced ? (
            <span>
              {race.distanceKm} km · {race.name}
            </span>
          ) : (
            <>
              <motion.span className="numeral text-accent-text">{km}</motion.span>
              <span> / {race.distanceKm} km · {race.name}</span>
            </>
          )}
        </p>
        {!race.gpx && (
          <p className="mono text-right text-faint/70">
            Shape of the terrain is drawn, not recorded
          </p>
        )}
      </div>
    </div>
  );
}
