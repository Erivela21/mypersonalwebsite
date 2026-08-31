"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { chapters } from "@/content/profile";
import { useActiveSection } from "@/lib/hooks";

const IDS = chapters.map((c) => c.id);

/**
 * Chapter navigation for phones.
 *
 * The desktop rail is a hover interaction, which does not exist on touch, so
 * small screens previously had a 2px progress bar and no way to jump anywhere.
 * This is the same information in a thumb-reachable form: a pill showing where
 * you are, tapping it opens the full list.
 *
 * It hides itself while you scroll down and comes back when you scroll up,
 * which is the pattern people already expect from a mobile toolbar, and keeps
 * it out of the way of the content it sits on top of.
 */
export function MobileChapters() {
  const active = useActiveSection(IDS);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);

  const index = Math.max(0, chapters.findIndex((c) => c.id === active));
  const current = chapters[index];

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      // Always show near the top; otherwise reveal on upward scroll.
      if (y < 120) setVisible(true);
      else if (Math.abs(y - last) > 8) setVisible(y < last);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on Escape, and never leave the sheet open behind a scroll.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <AnimatePresence>
        {open && (
          <motion.button
            type="button"
            aria-label="Close chapter list"
            className="fixed inset-0 z-40 bg-paper/70 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[max(1rem,env(safe-area-inset-bottom))]"
        animate={{ y: visible || open ? 0 : 90, opacity: visible || open ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
      >
        <div className="w-[min(22rem,calc(100vw-2rem))]">
          <AnimatePresence>
            {open && (
              <motion.ul
                className="mb-2 overflow-hidden rounded-2xl border border-rule bg-raised/95 shadow-[var(--shadow-soft)] backdrop-blur"
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: 10, height: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
              >
                {chapters.map((c, i) => {
                  const on = c.id === active;
                  return (
                    <li key={c.id}>
                      <a
                        href={`#${c.id}`}
                        onClick={() => setOpen(false)}
                        aria-current={on ? "true" : undefined}
                        className={`flex items-center gap-3 px-4 py-3 ${
                          i > 0 ? "border-t border-rule/70" : ""
                        } ${on ? "text-accent-text" : "text-soft"}`}
                      >
                        <span className="mono w-5 text-faint">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-[1.0625rem]">{c.label}</span>
                        {on && (
                          <span
                            aria-hidden
                            className="ml-auto h-[7px] w-[7px] rounded-full bg-accent"
                          />
                        )}
                      </a>
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex w-full items-center gap-3 rounded-full border border-rule bg-raised/95 px-4 py-3 shadow-[var(--shadow-soft)] backdrop-blur"
          >
            {/* No aria-label here. Overriding the name with one that did not
                contain the visible text failed WCAG 2.5.3 (Label in Name),
                which breaks voice control: saying "Me" would not activate a
                button announced as "Chapter 1 of 7". The visible label is now
                part of the accessible name, with the rest added for screen
                readers and the decorative numerals hidden from them. */}
            <span aria-hidden className="mono text-faint">
              {String(index + 1).padStart(2, "0")}/{chapters.length}
            </span>
            <span className="text-[1.0625rem] text-ink">{current.label}</span>
            <span className="sr-only">
              . Chapter {index + 1} of {chapters.length}. Open chapter list.
            </span>

            {/* Progress across the whole page, drawn under the pill. */}
            <span
              aria-hidden
              className="ml-auto flex h-6 w-6 items-center justify-center rounded-full border border-rule"
            >
              <motion.svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
              >
                <path
                  d="M1 6.5L5 2.5L9 6.5"
                  stroke="var(--accent)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
