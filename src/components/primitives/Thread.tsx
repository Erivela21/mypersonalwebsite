"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import { useReducedMotionSafe } from "@/lib/hooks";

/**
 * The line between chapters.
 *
 * This is the connective tissue of the whole site: one stroke that leaves the
 * bottom of one chapter and arrives at the top of the next, drawing itself
 * against scroll position rather than on a timer — so it is always exactly
 * where the reader is.
 *
 * `from` and `to` are horizontal positions in percent, letting each chapter
 * hand the line off at whatever edge its layout ends on.
 */
export function Thread({
  from = 50,
  to = 50,
  height = "clamp(7rem, 14vh, 11rem)",
  className = "",
  dashed = false,
}: {
  from?: number;
  to?: number;
  height?: string;
  className?: string;
  dashed?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionSafe();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 92%", "end 55%"],
  });

  const pathLength = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });

  // A gentle S: leaves vertically, arrives vertically, bends in between.
  const d = `M ${from} 0 C ${from} 38, ${to} 62, ${to} 100`;

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none relative w-full ${className}`}
      style={{ height }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full overflow-visible"
      >
        <motion.path
          d={d}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={1.25}
          strokeLinecap="round"
          strokeDasharray={dashed ? "3 5" : undefined}
          // Keeps the stroke an even weight despite the squashed viewBox.
          vectorEffect="non-scaling-stroke"
          opacity={0.55}
          style={reduced ? { pathLength: 1 } : { pathLength }}
        />
      </svg>
    </div>
  );
}
