"use client";

import { useEffect, useRef } from "react";
import { useCssVars, useFinePointer, useInViewport, useReducedMotionSafe } from "@/lib/hooks";

/**
 * The club, drawn as what it actually is: two halves of one system.
 *
 * A real force simulation — nodes repel, edges pull, the whole thing finds its
 * own shape as it comes into view. Red and blue start as separate clusters and
 * are stitched together by the bridge nodes between them, because that split
 * and that stitching is the point of the club.
 *
 * Packets travel the edges at a readable pace. The cursor pushes nodes aside
 * and they spring back. No terminal green, no skulls.
 */

const VARS = ["--clay", "--river", "--ink-faint", "--rule", "--paper"] as const;

type Node = {
  x: number; y: number; vx: number; vy: number;
  r: number; team: "red" | "blue" | "bridge"; hub: boolean; label?: string;
};
type Edge = { a: number; b: number; rest: number; revealAt: number };
type Packet = { edge: number; t: number; speed: number; dir: 1 | -1 };

/** Deterministic PRNG — identical layout every load, no hydration surprises. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildGraph() {
  const rand = mulberry32(20250115); // the month the club started
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const push = (team: Node["team"], hub = false, label?: string) => {
    nodes.push({
      x: 0.5 + (rand() - 0.5) * 0.5,
      y: 0.5 + (rand() - 0.5) * 0.5,
      vx: 0, vy: 0,
      r: hub ? 7 : 3 + rand() * 2,
      team, hub, label,
    });
    return nodes.length - 1;
  };

  const redHub = push("red", true, "RED TEAM");
  const blueHub = push("blue", true, "BLUE TEAM");

  const reds = Array.from({ length: 9 }, () => push("red"));
  const blues = Array.from({ length: 9 }, () => push("blue"));
  const bridges = Array.from({ length: 5 }, () => push("bridge"));

  let order = 0;
  const link = (a: number, b: number, rest: number) => {
    // Fast enough that the whole graph is present within about a second —
    // a diagram still assembling itself when you start reading is just broken.
    edges.push({ a, b, rest, revealAt: order++ * 1.6 });
  };

  reds.forEach((n) => link(redHub, n, 0.15 + rand() * 0.07));
  blues.forEach((n) => link(blueHub, n, 0.15 + rand() * 0.07));

  // A few intra-cluster links so each side has its own texture.
  for (let i = 0; i < reds.length - 1; i += 2) link(reds[i], reds[i + 1], 0.12);
  for (let i = 0; i < blues.length - 1; i += 2) link(blues[i], blues[i + 1], 0.12);

  // The bridges — this is the part that makes it one graph and not two.
  bridges.forEach((n, i) => {
    link(n, reds[i % reds.length], 0.17);
    link(n, blues[(i + 2) % blues.length], 0.17);
  });
  link(redHub, blueHub, 0.42);

  return { nodes, edges };
}

export function Network({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wrapRef, visible] = useInViewport<HTMLDivElement>("120px");
  const reduced = useReducedMotionSafe();
  const fine = useFinePointer();
  const colors = useCssVars(VARS);
  const pointer = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !visible) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { nodes, edges } = buildGraph();
    const packets: Packet[] = [];
    let raf = 0;
    let frame = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const step = () => {
      const scale = Math.min(w, h);

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          let d2 = dx * dx + dy * dy;
          if (d2 < 0.00001) d2 = 0.00001;
          const d = Math.sqrt(d2);
          // Tuned so repulsion balances the edge springs at ~0.12 apart.
          // An order of magnitude higher and every node pins to the bounds.
          const force = Math.min(0.000012 / d2, 0.002);
          dx /= d; dy /= d;
          a.vx -= dx * force; a.vy -= dy * force;
          b.vx += dx * force; b.vy += dy * force;
        }

        // Teams sit on opposite sides; bridges are pulled to the middle.
        const targetX = a.team === "red" ? 0.33 : a.team === "blue" ? 0.67 : 0.5;
        a.vx += (targetX - a.x) * 0.004;
        a.vy += (0.5 - a.y) * 0.005;

        if (fine) {
          const dx = a.x - pointer.current.x;
          const dy = a.y - pointer.current.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 0.022 && d2 > 0.000001) {
            const d = Math.sqrt(d2);
            const push = (0.022 - d2) * 0.9;
            a.vx += (dx / d) * push;
            a.vy += (dy / d) * push;
          }
        }
      }

      for (const e of edges) {
        const a = nodes[e.a];
        const b = nodes[e.b];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 0.0001;
        const f = (d - e.rest) * 0.02;
        const ux = (dx / d) * f;
        const uy = (dy / d) * f;
        a.vx += ux; a.vy += uy;
        b.vx -= ux; b.vy -= uy;
      }

      for (const n of nodes) {
        n.vx *= 0.86; n.vy *= 0.86;
        n.x += n.vx; n.y += n.vy;
        // Keep everything inside the frame, with room for labels.
        n.x = Math.min(0.94, Math.max(0.06, n.x));
        n.y = Math.min(0.9, Math.max(0.1, n.y));
      }

      void scale;
    };

    // Pre-warm so the graph enters already coherent, then settles on screen.
    for (let i = 0; i < 120; i++) step();

    const draw = () => {
      raf = requestAnimationFrame(draw);
      // Stand down while an in-page jump is animating.
      if (document.documentElement.hasAttribute("data-jumping")) return;
      frame++;
      if (!reduced) step();

      const red = colors["--clay"] || "#b96c4c";
      const blue = colors["--river"] || "#5f8794";
      const faint = colors["--ink-faint"] || "#6b7a70";
      const paper = colors["--paper"] || "#f6f4ed";

      // Draw into a centred region rather than the full box. On a wide,
      // short container, mapping x straight to width smears the graph into a
      // horizontal band and destroys the two-cluster reading.
      const spanW = Math.min(w, h * 2.1);
      const originX = (w - spanW) / 2;
      const X = (n: Node) => originX + n.x * spanW;
      const Y = (n: Node) => n.y * h;
      const tint = (n: Node) => (n.team === "red" ? red : n.team === "blue" ? blue : faint);

      ctx.clearRect(0, 0, w, h);

      // edges
      edges.forEach((e, i) => {
        const reveal = reduced ? 1 : Math.min(1, Math.max(0, (frame - e.revealAt) / 26));
        if (reveal <= 0) return;
        const a = nodes[e.a];
        const b = nodes[e.b];
        ctx.beginPath();
        ctx.moveTo(X(a), Y(a));
        ctx.lineTo(X(a) + (X(b) - X(a)) * reveal, Y(a) + (Y(b) - Y(a)) * reveal);
        ctx.strokeStyle = a.team === b.team ? tint(a) : faint;
        ctx.globalAlpha = 0.42;
        ctx.lineWidth = 1;
        ctx.stroke();
        void i;
      });

      // packets — traffic, not decoration
      if (!reduced) {
        if (packets.length < 7 && frame % 34 === 0) {
          const e = (frame * 7) % edges.length;
          if (edges[e].revealAt < frame) {
            packets.push({ edge: e, t: 0, speed: 0.007 + (e % 5) * 0.0016, dir: 1 });
          }
        }
        for (let i = packets.length - 1; i >= 0; i--) {
          const p = packets[i];
          p.t += p.speed;
          if (p.t >= 1) { packets.splice(i, 1); continue; }
          const e = edges[p.edge];
          const a = nodes[e.a];
          const b = nodes[e.b];
          const px = X(a) + (X(b) - X(a)) * p.t;
          const py = Y(a) + (Y(b) - Y(a)) * p.t;
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = tint(a);
          ctx.globalAlpha = Math.sin(p.t * Math.PI) * 0.85;
          ctx.fill();
        }
      }

      // nodes
      for (const n of nodes) {
        const reveal = reduced ? 1 : Math.min(1, frame / 40);
        ctx.globalAlpha = 0.9 * reveal;
        ctx.beginPath();
        ctx.arc(X(n), Y(n), n.r, 0, Math.PI * 2);
        ctx.fillStyle = tint(n);
        ctx.fill();

        if (n.hub) {
          ctx.globalAlpha = 0.32 * reveal;
          ctx.beginPath();
          ctx.arc(X(n), Y(n), n.r + 6 + Math.sin(frame / 40) * 1.6, 0, Math.PI * 2);
          ctx.strokeStyle = tint(n);
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.globalAlpha = reveal;
          ctx.fillStyle = tint(n);
          ctx.font = "500 10px var(--font-mono), ui-monospace, monospace";
          ctx.letterSpacing = "0.14em";
          ctx.textAlign = "center";
          ctx.fillText(n.label ?? "", X(n), Y(n) - n.r - 12);
        } else {
          // A paper-coloured core keeps small nodes legible over edges.
          ctx.globalAlpha = reveal;
          ctx.beginPath();
          ctx.arc(X(n), Y(n), Math.max(1, n.r - 2), 0, Math.PI * 2);
          ctx.fillStyle = paper;
          ctx.globalAlpha = 0.35 * reveal;
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [visible, reduced, colors, fine]);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    pointer.current = {
      x: (e.clientX - r.left) / r.width,
      y: (e.clientY - r.top) / r.height,
    };
  }

  return (
    <div
      ref={wrapRef}
      onPointerMove={onMove}
      onPointerLeave={() => (pointer.current = { x: -999, y: -999 })}
      className={`relative ${className}`}
      role="img"
      aria-label="A network diagram of the club: a red team cluster and a blue team cluster, joined by bridging nodes."
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
