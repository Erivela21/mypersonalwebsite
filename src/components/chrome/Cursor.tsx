"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { springCursor } from "@/lib/motion";
import { useFinePointer, useReducedMotionSafe } from "@/lib/hooks";

/**
 * A two-part cursor: a dot that tracks the pointer exactly, and a ring that
 * trails behind it on a spring.
 *
 * The ring is the part that carries meaning — it swells over anything
 * interactive, so the cursor reports what the interface will do rather than
 * simply decorating it. Never renders on touch or under reduced motion, and
 * the native cursor is only hidden once this one is actually on screen.
 */
export function Cursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotionSafe();
  const enabled = fine && !reduced;

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, springCursor);
  const ringY = useSpring(y, springCursor);

  const [hot, setHot] = useState(false);
  const [down, setDown] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    document.documentElement.classList.add("custom-cursor");

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!visible) setVisible(true);

      const el = e.target as Element | null;
      setHot(
        Boolean(
          el?.closest?.(
            'a, button, [role="button"], input, label, summary, [data-cursor="hot"]',
          ),
        ),
      );
    };

    const leave = () => setVisible(false);
    const enter = () => setVisible(true);
    const pointerDown = () => setDown(true);
    const pointerUp = () => setDown(false);

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    document.addEventListener("pointerenter", enter);
    window.addEventListener("pointerdown", pointerDown);
    window.addEventListener("pointerup", pointerUp);

    return () => {
      document.documentElement.classList.remove("custom-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("pointerenter", enter);
      window.removeEventListener("pointerdown", pointerDown);
      window.removeEventListener("pointerup", pointerUp);
    };
  }, [enabled, x, y, visible]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[70]">
      <motion.div
        className="absolute rounded-full border"
        style={{
          x: ringX,
          y: ringY,
          borderColor: "var(--accent)",
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: hot ? 42 : 26,
          height: hot ? 42 : 26,
          opacity: visible ? (hot ? 0.85 : 0.45) : 0,
          scale: down ? 0.82 : 1,
        }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          x,
          y,
          width: 5,
          height: 5,
          background: "var(--accent)",
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{ opacity: visible ? (hot ? 0 : 0.9) : 0, scale: hot ? 0.4 : 1 }}
        transition={{ duration: 0.18 }}
      />
    </div>
  );
}
