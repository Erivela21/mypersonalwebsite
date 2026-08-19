"use client";

import { motion } from "motion/react";
import { Facets } from "@/components/art/Facets";
import { AuroraBackdrop } from "@/components/reactbits/AuroraBackdrop";
import { Chapter, Container } from "@/components/primitives/Chapter";
import { hero, person } from "@/content/profile";
import { useReducedMotionSafe } from "@/lib/hooks";

export function Hero() {
  // Only for the looping scroll cue. Entrances are handled by MotionConfig.
  const reduced = useReducedMotionSafe();

  return (
    <Chapter
      id="hero"
      tint="moss"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pt-28 pb-16"
    >
      {/* Loads in its own chunk, only once visible, never under reduced
          motion. Sits under the CSS wash so it reads as light in the sky
          rather than as a neon aurora. */}
      <AuroraBackdrop
        className="-z-10 h-[62%]"
        opacity={0.52}
        fade="0%, black 12%, black 48%, transparent 100%"
      />

      <Container wide>
        <div className="text-center">
          <motion.h1
            className="text-[clamp(2.4rem,6vw,4.4rem)] leading-[1.02] tracking-[-0.025em]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          >
            {hero.name}
          </motion.h1>

          <motion.p
            className="mt-3 text-[1.0625rem] text-soft"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.09, type: "spring", stiffness: 120, damping: 20 }}
          >
            {hero.sub}
          </motion.p>
        </div>

        <div className="mt-12 sm:mt-14">
          <Facets />
        </div>
      </Container>

      <motion.div
        aria-hidden
        className="mt-10 flex justify-center sm:mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.75 }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="mono text-faint">{hero.scrollCue}</span>
          <motion.span
            className="block h-8 w-px bg-accent"
            style={{ transformOrigin: "top" }}
            animate={reduced ? { scaleY: 1 } : { scaleY: [0, 1, 0] }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
            }
          />
        </div>
      </motion.div>

      <span className="sr-only">
        {person.name}. {person.role}. Based in {person.location}.
      </span>
    </Chapter>
  );
}
