"use client";

import { useEffect, useRef, useState } from "react";
import { useInViewport, useReducedMotionSafe } from "@/lib/hooks";

/**
 * A short silent film that plays when it's on screen and stops when it isn't.
 *
 * The `src` is withheld until the element has actually been scrolled to. With
 * the source attached up front, browsers fetch far more than `preload` implies
 * — measured at ~5MB of video pulled on first paint for films sitting eight
 * thousand pixels down the page. Attaching it lazily takes that to zero.
 *
 * Never plays under reduced motion, and always exposes a real control — an
 * autoplaying video with no way to stop it is a hostile pattern, however pretty.
 */
export function Film({
  src,
  label,
  className = "",
  aspect = "9 / 16",
}: {
  src: string;
  label: string;
  className?: string;
  aspect?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [wrapRef, visible, seen] = useInViewport<HTMLDivElement>("120px");
  const reduced = useReducedMotionSafe();
  const [playing, setPlaying] = useState(false);

  // Drive the element. This effect only ever talks to the DOM — it never sets
  // React state, so visibility changes can't cascade renders.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    if (visible && !reduced) {
      v.play().catch(() => {
        /* autoplay refused — the control below still works */
      });
    } else {
      v.pause();
    }
  }, [visible, reduced]);

  // Observe the element. The video is the source of truth for whether it is
  // playing, so the label follows its events rather than our intentions —
  // which also keeps it correct when the browser blocks autoplay.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, []);

  function toggle() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden rounded-[2px] bg-sunk ${className}`}
      style={{ aspectRatio: aspect }}
    >
      <video
        ref={videoRef}
        src={seen ? src : undefined}
        muted
        loop
        playsInline
        preload="none"
        aria-label={label}
        className="h-full w-full object-cover"
      />

      <button
        type="button"
        onClick={toggle}
        // The label lives here rather than in an extra sr-only span; alongside
        // the visible "Play" text that produced "Play Play Estrelaçor".
        aria-label={playing ? `Pause ${label}` : `Play ${label}`}
        className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-white/25 bg-black/45 px-3 py-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/65"
      >
        <span aria-hidden className="block h-2 w-2 rounded-full bg-white/90" />
        <span aria-hidden className="mono text-[0.625rem] text-white/90">
          {playing ? "Pause" : "Play"}
        </span>
      </button>
    </div>
  );
}
