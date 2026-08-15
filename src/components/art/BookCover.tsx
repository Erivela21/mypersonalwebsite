"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { viewportOnce } from "@/lib/motion";
import { useReducedMotionSafe } from "@/lib/hooks";

/**
 * A book that opens.
 *
 * The artwork is original, not a reproduction of the published jacket. It
 * reads the title literally: a dark cover, a moon, and warm light escaping
 * from between the pages once it opens. The cover swings on the spine in 3D,
 * which is what makes it feel like an object rather than a picture of one.
 */
export function BookCover({
  title,
  author,
}: {
  title: string;
  author?: string;
}) {
  const [hover, setHover] = useState(false);
  const reduced = useReducedMotionSafe();

  // Ajar once it arrives, fully open when you reach for it.
  const angle = reduced ? -22 : hover ? -58 : -24;

  return (
    <motion.div
      className="relative"
      style={{ perspective: 900 }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ type: "spring", stiffness: 90, damping: 18 }}
    >
      <div
        className="relative h-[15rem] w-[10.5rem]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Warm light from inside, revealed as the cover swings away. */}
        <motion.div
          aria-hidden
          className="absolute inset-0 rounded-r-[3px] rounded-l-[2px]"
          style={{
            background:
              "linear-gradient(100deg, color-mix(in oklab, var(--gold) 62%, var(--paper)) 0%, color-mix(in oklab, var(--gold) 18%, var(--paper)) 48%, var(--paper-raised) 100%)",
          }}
          animate={{ opacity: hover ? 1 : 0.72 }}
          transition={{ duration: 0.4 }}
        />

        {/* Page block. */}
        <div
          aria-hidden
          className="absolute inset-y-[3px] left-[6px] right-[2px] rounded-r-[2px] bg-raised"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, color-mix(in oklab, var(--ink) 8%, transparent) 0 1px, transparent 1px 4px)",
            transform: "translateZ(1px)",
          }}
        />

        {/* The cover, hinged on the spine. */}
        <motion.div
          className="absolute inset-0 origin-left overflow-hidden rounded-r-[3px] rounded-l-[2px] shadow-[0_10px_30px_-12px_rgb(0_0_0_/_0.5)]"
          style={{
            transformStyle: "preserve-3d",
            background:
              "linear-gradient(150deg, #16233a 0%, #1d3350 44%, #24405f 100%)",
          }}
          // `z` lifts the cover in front of the page block. Without it the
          // pages paint over the hinge side of the cover and eat the title.
          animate={{ rotateY: angle, z: 6 }}
          transition={{ type: "spring", stiffness: 120, damping: 17 }}
        >
          <svg viewBox="0 0 168 240" className="h-full w-full">
            {/* moon */}
            <circle cx="118" cy="52" r="21" fill="#E8D9A8" opacity="0.92" />
            <circle cx="108" cy="45" r="19" fill="#1d3350" />
            {/* a few stars, placed not scattered */}
            {[
              [36, 40, 1.5],
              [58, 26, 1],
              [30, 70, 1.1],
              [140, 96, 1.2],
              [72, 58, 0.9],
              [22, 104, 1],
            ].map(([cx, cy, r], i) => (
              <circle key={i} cx={cx} cy={cy} r={r} fill="#E8D9A8" opacity="0.75" />
            ))}
            {/* shelves suggested as horizon lines */}
            <g opacity="0.3">
              <rect x="0" y="168" width="168" height="1.4" fill="#E8D9A8" />
              <rect x="0" y="196" width="168" height="1.4" fill="#E8D9A8" />
            </g>
            <g opacity="0.55" fill="#E8D9A8">
              {[10, 22, 30, 42, 54, 62, 78, 90, 102, 118, 130, 146].map((x, i) => (
                <rect
                  key={x}
                  x={x}
                  y={i % 3 === 0 ? 150 : 154}
                  width={7}
                  height={i % 3 === 0 ? 18 : 14}
                  rx="1"
                />
              ))}
            </g>
            <text
              x="20"
              y="128"
              fill="#F2E8CC"
              fontSize="19"
              fontFamily="var(--font-display)"
              letterSpacing="-0.4"
            >
              The Midnight
            </text>
            <text
              x="20"
              y="150"
              fill="#F2E8CC"
              fontSize="19"
              fontFamily="var(--font-display)"
              letterSpacing="-0.4"
            >
              Library
            </text>
            {author && (
              <text
                x="20"
                y="222"
                fill="#C9BE9C"
                fontSize="9"
                fontFamily="var(--font-mono)"
                letterSpacing="1.4"
              >
                {author.toUpperCase()}
              </text>
            )}
          </svg>
        </motion.div>

        {/* Spine, so the hinge has something to turn on. */}
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 w-[6px] rounded-l-[2px]"
          style={{ background: "#111c2e", transform: "translateZ(7px)" }}
        />
      </div>

      <span className="sr-only">{title}</span>
    </motion.div>
  );
}
