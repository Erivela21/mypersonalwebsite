"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAudio } from "@/lib/audio";
import { useCssVars, useReducedMotionSafe } from "@/lib/hooks";
import type { Track } from "@/content/profile";

/**
 * A player for Enrique's own music.
 *
 * The bars are a real AnalyserNode reading the actual audio, not a decorative
 * loop pretending to be one. That distinction matters on a page whose whole
 * claim is "I make music": the visualiser is evidence, not garnish.
 *
 * The AudioContext is constructed on the first press and never before, so the
 * page makes no sound until asked. Nothing here autoplays, ever.
 */

const VARS = ["--accent", "--ink-faint"] as const;
const BINS = 56;

/**
 * A fixed per-bar height for the resting state. Without it every bar idles at
 * the same height and the panel reads as a dotted line rather than as audio
 * waiting to play. Deterministic, so server and client agree.
 */
const IDLE = Array.from({ length: BINS }, (_, i) => {
  const n = Math.sin((i + 1) * 12.9898) * 43758.5453;
  return 0.32 + (n - Math.floor(n)) * 0.62;
});

export function TrackPlayer({
  tracks,
  label,
  note,
}: {
  tracks: readonly Track[];
  label: string;
  note: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const colors = useCssVars(VARS);
  const reduced = useReducedMotionSafe();

  const [current, setCurrent] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  /**
   * Built once, on the first real gesture. A MediaElementSource permanently
   * rebinds the element's output into the graph, so it must only ever be
   * created a single time for a given element.
   */
  const ensureGraph = useCallback(() => {
    const el = audioRef.current;
    if (!el || sourceRef.current) return;
    const audio = getAudio();
    if (!audio) return;

    const src = audio.ctx.createMediaElementSource(el);
    const analyser = audio.ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.72;
    // Straight to the destination rather than through the synth's master bus,
    // which carries a reverb send and a -6dB trim meant for the toy.
    src.connect(analyser);
    analyser.connect(audio.ctx.destination);

    sourceRef.current = src;
    analyserRef.current = analyser;
  }, []);

  async function toggle(index: number) {
    const el = audioRef.current;
    if (!el) return;

    if (current === index && !el.paused) {
      el.pause();
      setPlaying(false);
      return;
    }

    if (current !== index) {
      el.src = tracks[index].src;
      setCurrent(index);
      setProgress(0);
    }

    ensureGraph();
    try {
      await el.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }

  /* ---------------------------------------------------------- visualiser -- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const bins = new Uint8Array(128);

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

    let t = 0;
    const draw = () => {
      const r = canvas.getBoundingClientRect();
      const w = r.width;
      const h = r.height;
      ctx.clearRect(0, 0, w, h);

      const analyser = analyserRef.current;
      const live = analyser && playing;
      if (live) analyser.getByteFrequencyData(bins);

      const accent = colors["--accent"] || "#c08a1e";
      const faint = colors["--ink-faint"] || "#6b7a70";
      const gap = 3;
      const bw = (w - gap * (BINS - 1)) / BINS;
      const mid = h / 2;

      for (let i = 0; i < BINS; i++) {
        let a: number;
        if (live) {
          // Low bins carry most of the energy in a mix, so spread the reads
          // across the useful range rather than crowding the bass end.
          const bin = Math.floor((i / BINS) ** 1.35 * 96) + 2;
          a = (bins[bin] ?? 0) / 255;
          a = Math.max(0.04, a ** 1.15);
        } else {
          a =
            IDLE[i] *
            (reduced ? 0.24 : 0.21 + 0.05 * Math.sin(t / 52 + i / 5.2));
        }

        const bh = Math.max(2, a * h * 0.96);
        const x = i * (bw + gap);
        ctx.beginPath();
        ctx.roundRect(x, mid - bh / 2, bw, bh, Math.min(bw / 2, 2));
        ctx.fillStyle = live ? accent : faint;
        ctx.globalAlpha = live ? 0.55 + a * 0.45 : 0.3;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      t += 1;
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [colors, playing, reduced]);

  /* Progress, and stopping cleanly at the end of a clip. */
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () =>
      setProgress(el.duration ? el.currentTime / el.duration : 0);
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
    };
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", onEnd);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("ended", onEnd);
    };
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="mono text-accent-text">{label}</p>
        <p className="mono text-faint">{note}</p>
      </div>

      <div className="mt-4 h-24 w-full rounded-[3px] border border-rule bg-raised/60 px-4 py-3 sm:h-28">
        <canvas ref={canvasRef} className="h-full w-full" aria-hidden />
      </div>

      <ul className="mt-4">
        {tracks.map((track, i) => {
          const active = current === i;
          const isPlaying = active && playing;
          return (
            <li key={track.src}>
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-pressed={isPlaying}
                className="group relative flex w-full items-center gap-4 border-t border-rule py-4 text-left transition-colors hover:border-accent/60"
              >
                <span
                  aria-hidden
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    isPlaying
                      ? "border-accent bg-accent text-paper"
                      : "border-faint/50 text-accent-text group-hover:border-accent"
                  }`}
                >
                  {isPlaying ? (
                    <svg width="10" height="11" viewBox="0 0 10 11" fill="currentColor">
                      <rect x="0" y="0" width="3.4" height="11" rx="1" />
                      <rect x="6.6" y="0" width="3.4" height="11" rx="1" />
                    </svg>
                  ) : (
                    <svg width="10" height="11" viewBox="0 0 10 11" fill="currentColor">
                      <path d="M0 0.7v9.6a.7.7 0 0 0 1.07.6l7.7-4.8a.7.7 0 0 0 0-1.2L1.07.1A.7.7 0 0 0 0 .7Z" />
                    </svg>
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[1.05rem]">{track.title}</span>
                  {track.note && (
                    <span className="mono mt-0.5 block text-faint">
                      from {track.note}
                    </span>
                  )}
                </span>

                <span className="mono shrink-0 text-faint">
                  {isPlaying ? "Playing" : active ? "Paused" : "Play"}
                </span>
              </button>

              {/* Progress sits on the row's own baseline rather than as a
                  separate bar, so the list stays a list. */}
              {active && (
                <div className="relative -mt-px h-px w-full bg-transparent">
                  <div
                    className="h-px bg-accent transition-[width] duration-150"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Controlled entirely by the buttons above; never given `autoplay`. */}
      <audio ref={audioRef} preload="none" crossOrigin="anonymous" className="sr-only" />
    </div>
  );
}
