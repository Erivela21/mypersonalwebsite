"use client";

/**
 * Adapted from React Bits (MIT) — reactbits.dev, TextAnimations/CountUp.
 *
 * Three changes from the original, all of them necessary here:
 *
 * 1. The original renders an empty <span> and fills it imperatively from an
 *    effect, so the number is absent from the server HTML: invisible until JS
 *    loads, and nothing at all for a screen reader or a crawler. This version
 *    renders the final formatted value as real children and only animates on
 *    top of it, so the figure is always in the document.
 * 2. It ignored `prefers-reduced-motion`. Here the value simply appears.
 * 3. Formatting is derived once from the target rather than re-derived per
 *    frame.
 *
 * Used for the ultra statistics, where the numbers are real measurements. A
 * counter on a decorative number would just be noise.
 */

import { useInView, useMotionValue, useSpring } from "motion/react";
import { useEffect, useMemo, useRef } from "react";
import { useReducedMotionSafe } from "@/lib/hooks";

export function CountUp({
  to,
  from = 0,
  duration = 1.8,
  delay = 0,
  decimals,
  separator = "",
  className = "",
}: {
  to: number;
  from?: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  separator?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotionSafe();
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });

  const places = useMemo(() => {
    if (typeof decimals === "number") return decimals;
    const s = to.toString();
    return s.includes(".") ? s.split(".")[1].length : 0;
  }, [to, decimals]);

  const format = useMemo(() => {
    const fmt = new Intl.NumberFormat("en-US", {
      useGrouping: Boolean(separator),
      minimumFractionDigits: places,
      maximumFractionDigits: places,
    });
    return (n: number) =>
      separator ? fmt.format(n).replace(/,/g, separator) : fmt.format(n);
  }, [places, separator]);

  const value = useMotionValue(from);
  const spring = useSpring(value, {
    damping: 20 + 40 * (1 / duration),
    stiffness: 100 * (1 / duration),
  });

  // Start counting once, when it scrolls into view.
  useEffect(() => {
    if (reduced || !inView) return;
    const id = setTimeout(() => value.set(to), delay * 1000);
    return () => clearTimeout(id);
  }, [inView, reduced, value, to, delay]);

  // Write straight to the DOM node. Putting this through state would re-render
  // the surrounding stat block on every frame of every counter on the page.
  useEffect(() => {
    if (reduced) return;
    const node = ref.current;
    if (!node) return;
    node.textContent = format(from);
    return spring.on("change", (latest) => {
      node.textContent = format(latest);
    });
  }, [spring, format, reduced, from]);

  // Server and first client paint both show the real, final number.
  return (
    <span ref={ref} className={className}>
      {format(to)}
    </span>
  );
}
