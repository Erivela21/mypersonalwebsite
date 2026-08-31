"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";
import { hero } from "@/content/profile";
import { useFinePointer, useReducedMotionSafe } from "@/lib/hooks";

/**
 * The five things this site is about, shown rather than described.
 *
 * These are Enrique's own photographs, ungraded. An illustrated landscape here
 * read as generic no matter how it was drawn; a real photograph of a real
 * river cannot. Each card drifts at its own rate against the pointer, which is
 * the only thing giving the arrangement depth.
 */

const TINT: Record<string, string> = {
  moss: "var(--moss)",
  river: "var(--river)",
  clay: "var(--clay)",
  gold: "var(--gold)",
  teal: "var(--teal)",
};

/* Hand-placed. A zigzag across the band reads as arranged; evenly spaced
   cards read as a gallery, and random placement reads as a mistake. */
const LAYOUT = [
  { left: "1%", top: "22%", w: "16.5%", rot: -5.5, depth: 0.6 },
  { left: "20.5%", top: "40%", w: "16%", rot: 3.5, depth: 1.15 },
  { left: "39%", top: "10%", w: "18.5%", rot: -2.5, depth: 0.85 },
  { left: "60.5%", top: "37%", w: "16.5%", rot: 5, depth: 1.3 },
  { left: "79%", top: "16%", w: "17.5%", rot: -4, depth: 0.7 },
];

export function Facets() {
  const fine = useFinePointer();
  const reduced = useReducedMotionSafe();
  const alive = fine && !reduced;

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 55, damping: 18, mass: 1 });
  const sy = useSpring(my, { stiffness: 55, damping: 18, mass: 1 });

  useEffect(() => {
    if (!alive) return;
    const onMove = (e: PointerEvent) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [alive, mx, my]);

  return (
    <>
      {/* Desktop: an arranged band. */}
      <div className="relative hidden aspect-[16/7] w-full sm:block">
        {hero.facets.map((f, i) => (
          <Card
            key={f.id}
            index={i}
            facet={f}
            sx={sx}
            sy={sy}
            alive={alive}
            reduced={reduced}
          />
        ))}
      </div>

      {/* Small screens: the same cards, swipeable, no cleverness. */}
      <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 sm:hidden">
        {hero.facets.map((f, i) => (
          <motion.figure
            key={f.id}
            className="w-[64vw] shrink-0 snap-center"
            initial={reduced ? undefined : { opacity: 0, y: 26 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{
              delay: 0.16 + i * 0.07,
              type: "spring",
              stiffness: 95,
              damping: 18,
            }}
            // Same alternating tilt as the desktop arrangement, so the two
            // layouts read as the same object rather than two designs.
            style={{ rotate: i % 2 === 0 ? -1.6 : 1.6 }}
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-[3px] bg-sunk shadow-[0_2px_6px_rgb(0_0_0_/_0.08),0_16px_34px_-18px_rgb(0_0_0_/_0.34)]">
              <Image
                src={f.src}
                alt={f.alt}
                fill
                sizes="(max-width: 400px) 66vw, 64vw"
                className="object-cover"
                style={{ objectPosition: f.focus }}
                // Only the first card is on screen in the strip. Fetching all
                // five eagerly was loading roughly 375 KB of photographs to
                // show one, and it was the largest contentful paint.
                priority={i === 0}
                loading={i === 0 ? undefined : "lazy"}
              />
            </div>
            <figcaption
              className="mono mt-2.5 text-center"
              style={{ color: TINT[f.tint] }}
            >
              {f.label}
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </>
  );
}

function Card({
  index,
  facet,
  sx,
  sy,
  alive,
  reduced,
}: {
  index: number;
  facet: (typeof hero.facets)[number];
  sx: ReturnType<typeof useSpring>;
  sy: ReturnType<typeof useSpring>;
  alive: boolean;
  reduced: boolean;
}) {
  const l = LAYOUT[index];
  const x = useTransform(sx, [-1, 1], [22 * l.depth, -22 * l.depth]);
  const y = useTransform(sy, [-1, 1], [14 * l.depth, -14 * l.depth]);

  return (
    <motion.figure
      className="group absolute"
      style={{
        left: l.left,
        top: l.top,
        width: l.w,
        ...(alive ? { x, y } : {}),
      }}
      initial={{ opacity: 0, y: 44, rotate: 0 }}
      animate={{ opacity: 1, y: 0, rotate: l.rot }}
      transition={{
        delay: 0.18 + index * 0.08,
        type: "spring",
        stiffness: 90,
        damping: 18,
      }}
      whileHover={reduced ? undefined : { scale: 1.04, rotate: 0, zIndex: 10 }}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-[3px] bg-sunk shadow-[0_2px_6px_rgb(0_0_0_/_0.08),0_18px_40px_-18px_rgb(0_0_0_/_0.35)]">
        <Image
          src={facet.src}
          alt={facet.alt}
          fill
          sizes="(max-width: 1280px) 22vw, 18vw"
          className="object-cover"
          style={{ objectPosition: facet.focus }}
          // The middle card is the visual anchor and the usual LCP element.
          // The rest are in view but can arrive a beat later.
          priority={index === 2}
        />
        {/* The card's own colour, only on hover, so the arrangement reads as
            photographs first and as a colour system second. */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: TINT[facet.tint] }}
        />
      </div>

      <figcaption
        className="mono mt-2.5 text-center"
        style={{ color: TINT[facet.tint] }}
      >
        {facet.label}
      </figcaption>
    </motion.figure>
  );
}
