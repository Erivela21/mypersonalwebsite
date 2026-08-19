"use client";

/**
 * Adapted from React Bits (MIT) — reactbits.dev, Animations/Magnet.
 *
 * The original stores the offset in React state and sets it on every
 * mousemove, so the wrapped subtree re-renders at pointer rate. With several of
 * these on a page that already runs a custom cursor, hero parallax and two
 * canvases, that is a lot of wasted renders. This version writes to motion
 * values instead, so nothing re-renders and the transform is handled off the
 * React tree.
 *
 * Also added: rAF coalescing so all instances read layout once per frame, a
 * spring instead of a CSS transition so it settles like everything else on the
 * site, and it disables itself under reduced motion or on a coarse pointer.
 */

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { springTight } from "@/lib/motion";
import { useFinePointer, useReducedMotionSafe } from "@/lib/hooks";

export function Magnet({
  children,
  radius = 90,
  strength = 3,
  className = "",
}: {
  children: ReactNode;
  /** How far away the pointer starts pulling, in px beyond the element. */
  radius?: number;
  /** Higher divides the offset down, so higher means a weaker pull. */
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotionSafe();
  const active = fine && !reduced;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, springTight);
  const sy = useSpring(y, springTight);

  useEffect(() => {
    if (!active) {
      x.set(0);
      y.set(0);
      return;
    }

    let frame = 0;
    let px = 0;
    let py = 0;

    const measure = () => {
      frame = 0;
      const node = ref.current;
      if (!node) return;

      const r = node.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;

      const withinX = Math.abs(cx - px) < r.width / 2 + radius;
      const withinY = Math.abs(cy - py) < r.height / 2 + radius;

      if (withinX && withinY) {
        x.set((px - cx) / strength);
        y.set((py - cy) / strength);
      } else {
        x.set(0);
        y.set(0);
      }
    };

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      // One layout read per frame, however many events arrive.
      if (!frame) frame = requestAnimationFrame(measure);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [active, radius, strength, x, y]);

  return (
    <span ref={ref} className={`inline-block ${className}`}>
      <motion.span
        className="inline-block"
        style={active ? { x: sx, y: sy } : undefined}
      >
        {children}
      </motion.span>
    </span>
  );
}
