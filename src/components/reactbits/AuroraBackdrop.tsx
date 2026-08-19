"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useCssVars, useInViewport, useReducedMotionSafe } from "@/lib/hooks";

/**
 * The gate in front of the WebGL background.
 *
 * This is what keeps a shader from being a bad trade. `Aurora` and the whole of
 * `ogl` load in a separate chunk that is only fetched once this scrolls into
 * view, so the initial page weight is unchanged for everyone, and is never paid
 * at all by someone who has reduced motion on or who never reaches the hero
 * bottom.
 *
 * Colours are pulled from the live CSS tokens, so day and midnight get
 * different auroras from the same code.
 */

const Aurora = dynamic(() => import("./Aurora"), { ssr: false });

const VARS = ["--moss", "--river", "--gold"] as const;

export function AuroraBackdrop({
  className = "",
  opacity = 0.5,
  fade = "0%, black 22%, black 68%, transparent 100%",
}: {
  className?: string;
  opacity?: number;
  /** Gradient stops for the alpha mask, after the leading `transparent`. */
  fade?: string;
}) {
  const [ref, visible] = useInViewport<HTMLDivElement>("200px");
  const reduced = useReducedMotionSafe();
  const vars = useCssVars(VARS);

  const moss = vars["--moss"];
  const river = vars["--river"];
  const gold = vars["--gold"];

  // Kept stable by value, not by array identity. A fresh array every render
  // would make Aurora rebuild its colour uniforms on every single one.
  const stops = useMemo(
    () => [moss, river, gold].filter(Boolean) as string[],
    [moss, river, gold],
  );

  const ready = visible && !reduced && stops.length === 3;

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{
        opacity,
        // The shader fills its whole box with non-zero alpha, so the edge of
        // this container reads as a hard horizontal seam across the page,
        // which is very obvious against a dark background. Masking the top and
        // bottom to transparent lets it dissolve into the section instead of
        // stopping at a line.
        maskImage: `linear-gradient(to bottom, transparent ${fade})`,
        WebkitMaskImage: `linear-gradient(to bottom, transparent ${fade})`,
      }}
    >
      {ready && <Aurora colorStops={stops} paused={!visible} />}
    </div>
  );
}
