"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { springTight, viewportOnce } from "@/lib/motion";
import { useFinePointer, useReducedMotionSafe } from "@/lib/hooks";

/**
 * A photograph that notices the cursor.
 *
 * The image sits slightly oversized inside a clipped frame and drifts a few
 * pixels against the pointer, with a soft light following it. It reads as the
 * surface being disturbed rather than as a card tilting — and it costs two
 * transforms, not a WebGL context.
 */
export function Photo({
  src,
  alt,
  caption,
  w,
  h,
  className = "",
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  rounded = "rounded-[2px]",
}: {
  src: string;
  alt: string;
  caption?: string;
  w: number;
  h: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  rounded?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotionSafe();
  const active = fine && !reduced;

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const dx = useSpring(useTransform(px, [0, 1], [10, -10]), springTight);
  const dy = useSpring(useTransform(py, [0, 1], [8, -8]), springTight);

  const lightX = useTransform(px, (v) => `${v * 100}%`);
  const lightY = useTransform(py, (v) => `${v * 100}%`);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!active) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  }

  function onLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <figure className={className}>
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className={`group relative overflow-hidden bg-sunk ${rounded}`}
        style={{ aspectRatio: `${w} / ${h}` }}
        initial={reduced ? undefined : { opacity: 0, scale: 0.985 }}
        whileInView={reduced ? undefined : { opacity: 1, scale: 1 }}
        viewport={viewportOnce}
        transition={{ type: "spring", stiffness: 90, damping: 20 }}
      >
        <motion.div
          className="absolute inset-0"
          style={active ? { x: dx, y: dy, scale: 1.045 } : undefined}
        >
          <Image
            src={src}
            alt={alt}
            width={w}
            height={h}
            sizes={sizes}
            priority={priority}
            className="h-full w-full object-cover"
          />
        </motion.div>

        {active && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: `radial-gradient(28rem circle at ${"var(--lx)"} ${"var(--ly)"}, color-mix(in oklab, var(--accent) 22%, transparent), transparent 60%)`,
              // Motion values feed the gradient position through custom properties.
              ["--lx" as string]: lightX,
              ["--ly" as string]: lightY,
              mixBlendMode: "soft-light",
            }}
          />
        )}
      </motion.div>

      {caption && (
        // Sentence case, not the uppercase mono label style. These captions are
        // real sentences about where he was, and uppercase makes them unreadable.
        <figcaption className="mt-3 text-[0.875rem] leading-snug text-faint">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
