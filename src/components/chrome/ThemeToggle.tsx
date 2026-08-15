"use client";

import { useSyncExternalStore } from "react";
import { motion } from "motion/react";

type Theme = "light" | "dark";

/* The `data-theme` attribute on <html> is the single source of truth — the
   inline script in the layout sets it before paint, and this button writes to
   it. Subscribing to the attribute rather than mirroring it into React state
   keeps the two from ever disagreeing, and avoids a setState-in-effect. */
function subscribe(onChange: () => void) {
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => mo.disconnect();
}

const getSnapshot = (): Theme =>
  (document.documentElement.getAttribute("data-theme") as Theme) ?? "light";

const getServerSnapshot = (): Theme => "light";

/**
 * Day and midnight.
 *
 * Dark here isn't an inverted light theme — it's the same valley at night, with
 * its own palette. The toggle writes an explicit choice so it can override the
 * system preference in both directions; the inline script in the layout reads
 * it back before first paint.
 */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* private mode — the choice just won't persist */
    }
  }

  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to day" : "Switch to midnight"}
      className="fixed right-5 top-5 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-rule bg-raised/80 backdrop-blur-sm transition-colors hover:border-accent xl:right-8 xl:top-8"
    >
      {/* Sun and moon cross-fade on transforms only. Animating SVG geometry
          attributes (cx/cy/r) instead makes the renderer briefly receive
          `undefined` and throw — transforms are always safe. */}
      <span className="relative block h-[18px] w-[18px]">
        <motion.svg
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden
          className="absolute inset-0 h-full w-full"
          initial={false}
          animate={{ opacity: dark ? 0 : 1, rotate: dark ? -70 : 0, scale: dark ? 0.5 : 1 }}
          transition={{ type: "spring", stiffness: 190, damping: 21 }}
        >
          <circle cx="10" cy="10" r="4.1" fill="var(--accent)" />
          <g stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <line
                key={a}
                x1="10"
                y1="1.5"
                x2="10"
                y2="3.4"
                transform={`rotate(${a} 10 10)`}
              />
            ))}
          </g>
        </motion.svg>

        <motion.svg
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden
          className="absolute inset-0 h-full w-full"
          initial={false}
          animate={{ opacity: dark ? 1 : 0, rotate: dark ? 0 : 70, scale: dark ? 1 : 0.5 }}
          transition={{ type: "spring", stiffness: 190, damping: 21 }}
        >
          <path
            d="M11.6 2.3a7.7 7.7 0 1 0 6.1 9.9 6.1 6.1 0 0 1-6.1-9.9Z"
            fill="var(--accent)"
          />
        </motion.svg>
      </span>
    </button>
  );
}
