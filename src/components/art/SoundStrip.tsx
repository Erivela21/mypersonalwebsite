"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SCALE, playNote } from "@/lib/audio";
import { useCssVars, useInViewport, useReducedMotionSafe } from "@/lib/hooks";

/**
 * A strip you can play.
 *
 * Rather than describing music with a decorative waveform, this is an actual
 * instrument: drag across it and it sounds, tuned so that anything you play
 * works. It exists because "I make music" is worth demonstrating rather than
 * asserting — and because it stays honest while there are no tracks to embed.
 *
 * Sound only ever happens on a deliberate press or keypress. Hovering moves
 * the bars and nothing else.
 */

const BARS = 64;
const VARS = ["--accent", "--ink-faint", "--paper"] as const;

/**
 * A fixed per-bar height multiplier. Without it every bar idles at the same
 * height and the strip reads as a fence rather than as audio. Deterministic,
 * so server and client agree.
 */
const PROFILE = Array.from({ length: BARS }, (_, i) => {
  const n = Math.sin((i + 1) * 12.9898) * 43758.5453;
  return 0.5 + (n - Math.floor(n)) * 0.85;
});

export function SoundStrip({ hint }: { hint: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wrapRef, visible] = useInViewport<HTMLDivElement>("80px");
  const reduced = useReducedMotionSafe();
  const colors = useCssVars(VARS);

  // Live state kept in refs — this loop runs at 60fps and must not re-render.
  const amps = useRef<number[]>(new Array(BARS).fill(0));
  const hover = useRef<number>(-1);
  const pressed = useRef(false);
  const lastPlayed = useRef(-1);
  const [focusIndex, setFocusIndex] = useState(-1);
  const [touched, setTouched] = useState(false);

  const trigger = useCallback(
    (index: number, velocity = 0.55) => {
      if (index < 0 || index >= BARS) return;
      const note = SCALE[Math.floor((index / BARS) * SCALE.length)];
      playNote(note, velocity);
      amps.current[index] = 1;
      // Neighbours bloom a little, so a single note still looks like a chord.
      if (index > 0) amps.current[index - 1] = Math.max(amps.current[index - 1], 0.45);
      if (index < BARS - 1) amps.current[index + 1] = Math.max(amps.current[index + 1], 0.45);
      setTouched(true);
    },
    [],
  );

  /* ------------------------------------------------------------ drawing -- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !visible) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let t = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const accent = colors["--accent"] || "#46654c";
    const faint = colors["--ink-faint"] || "#6b7a70";

    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (document.documentElement.hasAttribute("data-jumping")) return;
      const r = canvas.getBoundingClientRect();
      const w = r.width;
      const h = r.height;
      ctx.clearRect(0, 0, w, h);

      const gap = 4;
      const bw = (w - gap * (BARS - 1)) / BARS;
      const mid = h / 2;
      // Cap the radius independently of bar width, or a short bar rounds into
      // a dot and the whole strip stops reading as a waveform.
      const radius = Math.min(bw / 2, 2.5);

      for (let i = 0; i < BARS; i++) {
        // Idle: a slow travelling swell so the strip looks alive but calm.
        const idle =
          PROFILE[i] *
          (reduced
            ? 0.26
            : 0.22 + 0.07 * Math.sin(t / 46 + i / 4.6) + 0.03 * Math.sin(t / 17 + i));

        const near = hover.current >= 0 ? Math.abs(i - hover.current) : 99;
        const proximity = near <= 4 ? (1 - near / 5) * 0.3 : 0;
        const focusBoost = focusIndex === i ? 0.34 : 0;

        const a = Math.min(1, idle + proximity + focusBoost + amps.current[i] * 0.7);
        const bh = Math.max(3, a * h * 0.94);
        const x = i * (bw + gap);

        ctx.beginPath();
        ctx.roundRect(x, mid - bh / 2, bw, bh, radius);
        ctx.fillStyle = amps.current[i] > 0.02 || focusIndex === i ? accent : faint;
        ctx.globalAlpha = amps.current[i] > 0.02 ? 0.5 + amps.current[i] * 0.5 : 0.46;
        ctx.fill();

        amps.current[i] *= 0.935;
        if (amps.current[i] < 0.001) amps.current[i] = 0;
      }

      ctx.globalAlpha = 1;
      t += 1;
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [visible, reduced, colors, focusIndex]);

  /* -------------------------------------------------------- interaction -- */
  function indexFromEvent(e: React.PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    return Math.floor(((e.clientX - r.left) / r.width) * BARS);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const i = indexFromEvent(e);
    hover.current = i;
    if (pressed.current && i !== lastPlayed.current) {
      lastPlayed.current = i;
      trigger(i, 0.5);
    }
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    pressed.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const i = indexFromEvent(e);
    lastPlayed.current = i;
    trigger(i, 0.7);
  }

  function endPress(e: React.PointerEvent<HTMLDivElement>) {
    pressed.current = false;
    lastPlayed.current = -1;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;

    if (step !== 0) {
      e.preventDefault();
      const next = Math.min(BARS - 1, Math.max(0, (focusIndex < 0 ? 0 : focusIndex) + step));
      setFocusIndex(next);
      trigger(next, 0.6);
      return;
    }

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      trigger(focusIndex < 0 ? Math.floor(BARS / 2) : focusIndex, 0.7);
    }
  }

  return (
    <div className="w-full">
      <div
        ref={wrapRef}
        tabIndex={0}
        role="group"
        aria-label="Playable sound strip. Use the left and right arrow keys to play notes."
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={endPress}
        onPointerCancel={endPress}
        onPointerLeave={(e) => {
          hover.current = -1;
          endPress(e);
        }}
        onFocus={() => setFocusIndex((i) => (i < 0 ? Math.floor(BARS / 2) : i))}
        onBlur={() => setFocusIndex(-1)}
        onKeyDown={onKeyDown}
        className="relative h-32 w-full touch-none select-none rounded-[3px] border border-rule bg-raised/60 px-4 py-3 transition-colors hover:border-accent/50 sm:h-40"
        data-cursor="hot"
      >
        <canvas ref={canvasRef} className="h-full w-full" aria-hidden />
      </div>

      <p className="mono mt-3 text-faint">{touched ? "Keep going" : hint}</p>
    </div>
  );
}
