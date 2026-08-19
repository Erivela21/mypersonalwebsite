"use client";

/**
 * Adapted from React Bits (MIT) — reactbits.dev, Components/Stack.
 *
 * Changes, in order of how much they mattered:
 *
 * 1. The original calls `Math.random()` during render for its card rotation,
 *    which produces different markup on the server and the client and trips a
 *    hydration mismatch. Rotations are now a fixed table.
 * 2. It was drag-only, so the cards underneath were unreachable by keyboard.
 *    There is now a real button, and the frame responds to Enter and the arrow
 *    keys.
 * 3. Its tilt goes to 60 degrees, which is far louder than anything else on
 *    this site. Pulled back to 14, and disabled entirely under reduced motion.
 * 4. Artwork is letterboxed against a mat rather than cropped: these two pieces
 *    are 1:1 and 2.37:1, and cropping either to fill would destroy the
 *    composition. The 3:2 frame is close to the geometric mean of the two, so
 *    neither gets much dead space.
 */

import Image from "next/image";
import { motion, useMotionValue, useTransform, type PanInfo } from "motion/react";
import { useState } from "react";
import { useReducedMotionSafe } from "@/lib/hooks";

export type Cover = {
  src: string;
  alt: string;
  label: string;
  w: number;
  h: number;
};

/** Deterministic, so server and client agree. */
const TILT = [-2.5, 1.8, -1.2, 2.2, -1.9];

export function CoverStack({
  covers,
  hint,
}: {
  covers: readonly Cover[];
  hint?: string;
}) {
  // Last entry is the top card.
  const [order, setOrder] = useState(() => covers.map((_, i) => i));
  const reduced = useReducedMotionSafe();

  const advance = () =>
    setOrder((prev) => {
      if (prev.length < 2) return prev;
      const next = [...prev];
      next.unshift(next.pop()!);
      return next;
    });

  const topIndex = order[order.length - 1];
  const top = covers[topIndex];

  return (
    <div>
      <div
        className="relative aspect-[3/2] w-full select-none"
        style={{ perspective: 900 }}
      >
        {order.map((cardIndex, position) => {
          const cover = covers[cardIndex];
          const fromTop = order.length - position - 1;
          return (
            <Card
              key={cover.src}
              cover={cover}
              fromTop={fromTop}
              tilt={TILT[cardIndex % TILT.length]}
              reduced={reduced}
              onAdvance={advance}
              interactive={order.length > 1}
            />
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <p className="mono text-faint">{top.label}</p>

        {covers.length > 1 && (
          <button
            type="button"
            onClick={advance}
            className="mono rounded-full border border-rule px-3 py-1.5 text-accent-text transition-colors hover:border-accent"
          >
            Next cover
            <span aria-hidden> →</span>
          </button>
        )}
      </div>

      {hint && <p className="mono mt-2 text-faint/80">{hint}</p>}
    </div>
  );
}

function Card({
  cover,
  fromTop,
  tilt,
  reduced,
  onAdvance,
  interactive,
}: {
  cover: Cover;
  fromTop: number;
  tilt: number;
  reduced: boolean;
  onAdvance: () => void;
  interactive: boolean;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-120, 120], [14, -14]);
  const rotateY = useTransform(x, [-120, 120], [-14, 14]);

  const isTop = fromTop === 0;

  function onDragEnd(_e: unknown, info: PanInfo) {
    if (Math.abs(info.offset.x) > 110 || Math.abs(info.offset.y) > 110) {
      onAdvance();
    }
    x.set(0);
    y.set(0);
  }

  const draggable = interactive && isTop && !reduced;

  return (
    <motion.div
      className={`absolute inset-0 ${draggable ? "cursor-grab active:cursor-grabbing" : ""}`}
      style={reduced ? undefined : { x, y, rotateX, rotateY }}
      drag={draggable}
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.5}
      onDragEnd={draggable ? onDragEnd : undefined}
      animate={{
        rotateZ: reduced ? 0 : tilt + fromTop * 3.2,
        scale: 1 - fromTop * 0.045,
        y: fromTop * 10,
      }}
      initial={false}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <div
        // The mat. Letterboxing reads as framing rather than as a mistake.
        className="h-full w-full overflow-hidden rounded-[3px] border border-rule bg-sunk shadow-[0_2px_8px_rgb(0_0_0_/_0.10),0_18px_44px_-22px_rgb(0_0_0_/_0.38)]"
        onClick={interactive && isTop ? onAdvance : undefined}
        role={interactive && isTop ? "button" : undefined}
        tabIndex={interactive && isTop ? 0 : undefined}
        onKeyDown={
          interactive && isTop
            ? (e) => {
                if (["Enter", " ", "ArrowRight", "ArrowLeft"].includes(e.key)) {
                  e.preventDefault();
                  onAdvance();
                }
              }
            : undefined
        }
        aria-label={interactive && isTop ? `${cover.label}. Show the next cover.` : undefined}
      >
        <Image
          src={cover.src}
          alt={cover.alt}
          width={cover.w}
          height={cover.h}
          sizes="(max-width: 640px) 92vw, 42vw"
          className="pointer-events-none h-full w-full object-contain"
        />
      </div>
    </motion.div>
  );
}
