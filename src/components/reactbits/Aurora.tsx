"use client";

/**
 * Adapted from React Bits (MIT) — reactbits.dev, Backgrounds/Aurora.
 *
 * The shader is theirs and unchanged: simplex noise driving a colour ramp. What
 * changed is everything around it, because the original is written as a demo.
 *
 * 1. Colours come from this site's CSS tokens rather than the stock neon
 *    purple and green, which means the aurora restyles itself when the theme
 *    flips instead of needing a second asset.
 * 2. The original constructs three `new Color(hex)` objects *inside* the render
 *    loop. At 60fps that is 180 allocations a second of pure garbage. They are
 *    now converted once and only recomputed when the colours actually change.
 * 3. Added: pauses when scrolled out of view and when the tab is hidden, so a
 *    GPU loop is never running for a background nobody can see.
 * 4. Added: a WebGL2 capability check. The shader is `#version 300 es`, so on a
 *    WebGL1-only context it would silently fail to compile. Now it bails and
 *    the CSS wash underneath carries the section on its own.
 * 5. Device pixel ratio is pinned to 1. This is a soft gradient with no edges,
 *    so rendering four times the pixels for a retina screen buys nothing.
 */

import { useEffect, useRef } from "react";
import { Color, Mesh, Program, Renderer, Triangle } from "ogl";

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ),
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {                   \
  int index = 0;                                                   \
  for (int i = 0; i < 2; i++) {                                     \
     ColorStop currentColor = colors[i];                            \
     bool isInBetween = currentColor.position <= factor;            \
     index = int(mix(float(index), float(i), float(isInBetween)));  \
  }                                                                \
  ColorStop currentColor = colors[index];                          \
  ColorStop nextColor = colors[index + 1];                          \
  float range = nextColor.position - currentColor.position;         \
  float lerpFactor = (factor - currentColor.position) / range;      \
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor);\
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);

  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);

  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;

  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);

  vec3 auroraColor = intensity * rampColor;

  fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
}
`;

export default function Aurora({
  colorStops,
  amplitude = 0.9,
  blend = 0.6,
  speed = 0.5,
  paused = false,
}: {
  colorStops: readonly string[];
  amplitude?: number;
  blend?: number;
  speed?: number;
  /** Set while offscreen so the GPU loop stops. */
  paused?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const stopsRef = useRef(colorStops);
  const dirty = useRef(true);
  const pausedRef = useRef(paused);

  // The original assigns to refs during render, which React's rules-of-refs
  // forbids. Syncing in effects keeps the render pure and behaves identically,
  // since the frame loop only reads these on the next tick anyway.
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    stopsRef.current = colorStops;
    dirty.current = true;
  }, [colorStops]);

  useEffect(() => {
    const node = host.current;
    if (!node) return;

    const renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      dpr: 1,
    });

    const gl = renderer.gl;

    // The fragment shader is GLSL ES 3.00, which needs WebGL2. Without this
    // guard a WebGL1 context fails to compile it and logs noise for nothing.
    if (!("isWebgl2" in renderer) || !renderer.isWebgl2) {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      return;
    }

    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.canvas.style.backgroundColor = "transparent";
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) delete geometry.attributes.uv;

    const toRgb = (hex: string) => {
      const c = new Color(hex);
      return [c.r, c.g, c.b] as [number, number, number];
    };

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uColorStops: { value: stopsRef.current.map(toRgb) },
        uResolution: { value: [node.offsetWidth, node.offsetHeight] },
        uBlend: { value: blend },
      },
    });
    dirty.current = false;

    const mesh = new Mesh(gl, { geometry, program });
    node.appendChild(gl.canvas);

    const resize = () => {
      renderer.setSize(node.offsetWidth, node.offsetHeight);
      program.uniforms.uResolution.value = [node.offsetWidth, node.offsetHeight];
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(node);

    let raf = 0;
    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (pausedRef.current || document.hidden || document.documentElement.hasAttribute("data-jumping")) return;

      // Recompute colour uniforms only when the palette actually changed,
      // rather than allocating three Colors every single frame.
      if (dirty.current) {
        program.uniforms.uColorStops.value = stopsRef.current.map(toRgb);
        dirty.current = false;
      }

      program.uniforms.uTime.value = t * 0.001 * speed;
      program.uniforms.uAmplitude.value = amplitude;
      program.uniforms.uBlend.value = blend;
      renderer.render({ scene: mesh });
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (gl.canvas.parentNode === node) node.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [amplitude, blend, speed]);

  return <div ref={host} className="h-full w-full" />;
}
