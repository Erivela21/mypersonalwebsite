import type { Transition, Variants } from "motion/react";

/**
 * One motion vocabulary for the whole site.
 *
 * Springs, not easing curves — physical settling reads as alive, timed easing
 * reads as animated. Nothing here overshoots enough to be cartoonish.
 */

export const spring: Transition = {
  type: "spring",
  stiffness: 120,
  damping: 20,
  mass: 0.9,
};

/** Slower and heavier, for large elements where a quick spring looks flighty. */
export const springSoft: Transition = {
  type: "spring",
  stiffness: 70,
  damping: 22,
  mass: 1.1,
};

/** Snappier, for hover and press feedback that must feel immediate. */
export const springTight: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 26,
  mass: 0.6,
};

/** Cursor follow — critically damped so it trails without ever wobbling. */
export const springCursor = { stiffness: 420, damping: 34, mass: 0.5 };

/** The single entrance used everywhere: 14px rise plus fade. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: spring },
};

export const riseSoft: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: springSoft },
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

/** Parent that staggers its children by 50ms. */
export const stagger = (delayChildren = 0, staggerChildren = 0.05): Variants => ({
  hidden: {},
  show: { transition: { delayChildren, staggerChildren } },
});

/** How far into the viewport an element must be before it animates in. */
export const viewportOnce = { once: true, amount: 0.25 } as const;
export const viewportEarly = { once: true, amount: 0.1 } as const;
