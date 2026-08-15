"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { rise, riseSoft, stagger, viewportOnce } from "@/lib/motion";

/**
 * The site's one entrance: a 14px rise plus a fade, on a spring.
 *
 * Note there is no reduced-motion branch here. `MotionConfig reducedMotion="user"`
 * in the root layout makes Motion snap transform values straight to their
 * targets for anyone who asked for reduced motion, so the rise disappears and
 * only the fade remains. Branching on the preference instead would change the
 * rendered markup between server and client and break hydration.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  soft = false,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  soft?: boolean;
  as?: "div" | "li" | "figure" | "span";
}) {
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      variants={soft ? riseSoft : rise}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}

/** Parent that staggers direct `RevealItem` children by 50ms each. */
export function RevealGroup({
  children,
  className = "",
  delayChildren = 0,
  step = 0.05,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delayChildren?: number;
  step?: number;
  as?: "div" | "ul" | "ol";
}) {
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      variants={stagger(delayChildren, step)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
    >
      {children}
    </MotionTag>
  );
}

export function RevealItem({
  children,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "figure";
}) {
  const MotionTag = motion[as];

  return (
    <MotionTag className={className} variants={rise}>
      {children}
    </MotionTag>
  );
}
