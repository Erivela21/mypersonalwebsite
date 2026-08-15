"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { chapters } from "@/content/profile";
import { useActiveSection } from "@/lib/hooks";

const IDS = chapters.map((c) => c.id);

/**
 * Navigation, and the line, and the progress indicator — all the same object.
 *
 * Every dot is a real anchor, so keyboard users tab through the chapters in
 * document order and get the labels for free. On small screens the rail
 * collapses to the hairline progress bar at the top of the page.
 */
export function ChapterRail() {
  const active = useActiveSection(IDS);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    <>
      {/* Mobile: a single hairline that fills as you read. */}
      <motion.div
        aria-hidden
        className="fixed inset-x-0 top-0 z-50 h-[2px] origin-left bg-accent lg:hidden"
        // A progress indicator reports position rather than performing motion,
        // so it stays live under reduced motion — freezing it would just be
        // withholding information.
        style={{ scaleX: progress, opacity: 0.75 }}
      />

      <nav
        aria-label="Chapters"
        className="fixed left-5 top-1/2 z-50 hidden -translate-y-1/2 lg:block xl:left-8"
      >
        {/* The labels stay collapsed so the rail's resting footprint is only
            the dots — otherwise a long chapter name sits on top of the page
            content at every viewport under about 1500px. Approaching the rail
            reveals the whole list at once. */}
        <div className="group/rail relative flex flex-col items-start gap-5 py-1 pr-8">
          {/* The rail itself — a static track with a filling stroke over it. */}
          <div
            aria-hidden
            className="absolute left-[5px] top-2 bottom-2 w-px bg-rule"
          />
          <motion.div
            aria-hidden
            className="absolute left-[5px] top-2 bottom-2 w-px origin-top bg-accent"
            style={{ scaleY: progress, opacity: 0.8 }}
          />

          {chapters.map((c) => {
            const on = active === c.id;
            return (
              <a
                key={c.id}
                href={`#${c.id}`}
                aria-current={on ? "true" : undefined}
                className="group relative flex items-center gap-3 rounded-full"
              >
                <span
                  aria-hidden
                  className={`relative z-10 block rounded-full border transition-all duration-300 ${
                    on
                      ? "h-[11px] w-[11px] border-accent bg-accent"
                      : "h-[7px] w-[7px] translate-x-[2px] border-faint bg-paper group-hover:border-accent"
                  }`}
                />
                <span
                  className={`mono translate-x-[-4px] whitespace-nowrap opacity-0 transition-all duration-300 group-hover/rail:translate-x-0 group-hover/rail:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 ${
                    on ? "text-accent-text" : "text-faint"
                  }`}
                >
                  {c.label}
                </span>
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}
