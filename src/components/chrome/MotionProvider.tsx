"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * `reducedMotion="user"` makes Motion suppress transform and layout animations
 * for anyone who has asked their system for reduced motion — values snap to
 * their targets instead of travelling. Opacity still crossfades, which is not
 * motion and is the accessible thing to keep.
 *
 * Having this at the root is what lets every entrance animation on the site
 * ignore the preference entirely rather than branching on it, which is where
 * hydration mismatches come from.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 120, damping: 20 }}>
      {children}
    </MotionConfig>
  );
}
