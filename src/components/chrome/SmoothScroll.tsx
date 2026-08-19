"use client";

import { useEffect } from "react";

/**
 * Eased in-page navigation.
 *
 * The browser's own `scroll-behavior: smooth` does animate, but over a page
 * this tall it takes about 1.5 seconds, updates on roughly half the available
 * frames, and eases in a way that arrives abruptly. Measured on this site:
 * 12,481px in 89 distinct positions across 175 frames.
 *
 * This drives the scroll itself, so every frame moves, the duration scales
 * with distance instead of being fixed, and it settles rather than stops.
 *
 * The CSS rule stays in place as the no-JS fallback; it is switched off only
 * for the duration of an animation, otherwise the browser would try to smooth
 * each individual frame this sets and the two would fight.
 */

const MIN = 480;
const MAX = 1000;

// Standard ease-in-out cubic: leaves gently, arrives gently.
const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function SmoothScroll() {
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    let failsafe = 0;

    const reduced = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function scrollTo(to: number) {
      const from = window.scrollY;
      const distance = to - from;
      if (Math.abs(distance) < 2) return;

      // Longer trips get more time, but not proportionally, or crossing the
      // whole page would take several seconds.
      const duration = Math.min(
        MAX,
        Math.max(MIN, Math.sqrt(Math.abs(distance)) * 26),
      );

      const previous = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      // Every canvas loop on the page watches for this. Crossing 12,000px
      // sweeps the network graph, both audio visualisers and the shader
      // through the viewport at once; letting them all redraw mid-flight is
      // what was starving this animation of frames.
      root.setAttribute("data-jumping", "");
      // Belt and braces. Every canvas on the page is halted by that attribute,
      // so if the animation were ever interrupted without its cleanup running,
      // the whole site would silently freeze. This guarantees it clears.
      clearTimeout(failsafe);
      failsafe = window.setTimeout(
        () => root.removeAttribute("data-jumping"),
        duration + 400,
      );
      const start = performance.now();

      cancelAnimationFrame(raf);
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        window.scrollTo(0, from + distance * ease(t));
        if (t < 1) {
          raf = requestAnimationFrame(step);
        } else {
          root.style.scrollBehavior = previous;
          root.removeAttribute("data-jumping");
        }
      };
      raf = requestAnimationFrame(step);
    }

    function onClick(e: MouseEvent) {
      // Let the browser handle modified clicks so opening in a new tab works.
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      const anchor = (e.target as Element | null)?.closest?.(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null;
      if (!anchor) return;

      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;

      const target = document.querySelector(hash);
      if (!(target instanceof HTMLElement)) return;

      e.preventDefault();

      const top = target.getBoundingClientRect().top + window.scrollY;

      if (reduced()) {
        window.scrollTo(0, top);
      } else {
        scrollTo(top);
      }

      // Keep the URL and the focus ring honest, without letting the browser
      // perform its own jump on top of the animation.
      history.pushState(null, "", hash);
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }

    // A wheel or touch gesture should always win over an animation in flight.
    const cancel = () => {
      cancelAnimationFrame(raf);
      clearTimeout(failsafe);
      root.removeAttribute("data-jumping");
    };

    document.addEventListener("click", onClick);
    window.addEventListener("wheel", cancel, { passive: true });
    window.addEventListener("touchstart", cancel, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(failsafe);
      root.removeAttribute("data-jumping");
      document.removeEventListener("click", onClick);
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
    };
  }, []);

  return null;
}
