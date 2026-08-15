"use client";

import { useEffect, useRef, useState } from "react";

/**
 * True when the device has no fine pointer. Drives every hover-only feature —
 * the custom cursor, magnetic buttons, photo disturbance — so touch users get
 * a clean site rather than a broken imitation of a desktop one.
 */
export function useFinePointer(): boolean {
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return fine;
}

/**
 * Pauses expensive canvas work when it scrolls out of view. Every canvas on
 * this site is gated on this — an offscreen requestAnimationFrame loop is
 * just a battery leak.
 */
export function useInViewport<T extends Element>(
  margin = "160px",
): [React.RefObject<T | null>, boolean, boolean] {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  // Sticky: stays true once the element has been seen. Used to attach heavy
  // sources exactly once, so scrolling away doesn't throw the download out and
  // scrolling back doesn't fetch it again.
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setSeen(true);
      },
      { rootMargin: margin },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [margin]);

  return [ref, visible, seen];
}

/** Tracks which chapter is currently occupying the middle of the viewport. */
export function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => Boolean(n));
    if (!nodes.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.01, 0.5, 1] },
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [ids]);

  return active;
}

/**
 * Reduced-motion preference that is safe to branch render output on.
 *
 * Motion's own `useReducedMotion` can already report `true` during the first
 * client render while the server rendered `false`, so branching on it produces
 * a hydration mismatch. This always reports `false` for the server render and
 * the first client render, then settles — the markup React hydrates is
 * guaranteed to match, and the correction lands before anything animates.
 *
 * Use this for anything that changes what gets rendered. Ordinary entrance and
 * hover animations don't need it at all: `MotionConfig reducedMotion="user"`
 * in the root layout already suppresses those.
 */
export function useReducedMotionSafe(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}

/**
 * Resolves CSS custom properties to real colour strings for canvas drawing,
 * and re-resolves them when the theme attribute flips. Canvas can't read
 * `var(--accent)`, so without this the drawings would stay stuck in day
 * colours after switching to midnight.
 */
export function useCssVars(names: readonly string[], scope?: Element | null) {
  const [vars, setVars] = useState<Record<string, string>>({});

  useEffect(() => {
    const read = () => {
      const target = scope ?? document.documentElement;
      const cs = getComputedStyle(target);
      const next: Record<string, string> = {};
      for (const n of names) next[n] = cs.getPropertyValue(n).trim();
      setVars(next);
    };

    read();

    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => mo.disconnect();
    // `names` is a module-level constant at every call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  return vars;
}

/** Media query as state, SSR-safe (always false on the server). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);

  return matches;
}
