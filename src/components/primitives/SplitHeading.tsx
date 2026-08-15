"use client";

import { motion } from "motion/react";
import { Fragment } from "react";
import { viewportOnce } from "@/lib/motion";

/**
 * Words rise out from behind a mask, as if the line is being set rather than
 * faded in. Word-level rather than line-level: no layout measurement, so it
 * can't disagree with itself between server and client render.
 *
 * Under reduced motion `MotionConfig` gives transform keys a `false` transition,
 * which snaps `y` from 110% to 0% with no travel — the heading simply appears,
 * fully legible. That is why there's no preference branch here; adding one
 * risks the words being left parked below their mask, invisible.
 *
 * Used sparingly — headings only. Everything else uses `Reveal`.
 */
export function SplitHeading({
  text,
  className = "",
  as: Tag = "h2",
  delay = 0,
  step = 0.045,
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
  delay?: number;
  step?: number;
}) {
  const words = text.split(" ");

  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden
        className="inline"
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={{
          hidden: {},
          show: { transition: { delayChildren: delay, staggerChildren: step } },
        }}
      >
        {words.map((word, i) => (
          <Fragment key={`${word}-${i}`}>
            <span
              // The mask. Bottom padding stops descenders being clipped.
              className="inline-block overflow-hidden pb-[0.12em] align-bottom"
            >
              <motion.span
                className="inline-block"
                variants={{
                  hidden: { y: "110%" },
                  show: {
                    y: "0%",
                    transition: { type: "spring", stiffness: 150, damping: 21 },
                  },
                }}
              >
                {word}
              </motion.span>
            </span>
            {/* The space lives outside the mask on purpose. Inside an
                inline-block with overflow:hidden a trailing space collapses at
                the edge, and every word in the heading runs together. */}
            {i < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </motion.span>
    </Tag>
  );
}
