/**
 * A very small synth.
 *
 * The AudioContext is built on the first real gesture and never before —
 * browsers block it otherwise, and a site that starts making noise on load is
 * the worst thing a music section can do.
 *
 * Everything is tuned to A minor pentatonic. That's the trick behind the
 * strip in the Sound chapter: on a pentatonic scale there is no wrong note, so
 * a stranger dragging their cursor across it always makes something that
 * sounds intentional.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let wet: ConvolverNode | null = null;

/** A minor pentatonic, two and a bit octaves. */
export const SCALE = [
  220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99,
  880.0, 1046.5,
];

/** Decaying noise makes a serviceable room. Cheap, and much warmer than dry. */
function buildReverb(context: AudioContext): ConvolverNode {
  const seconds = 1.7;
  const rate = context.sampleRate;
  const length = Math.floor(rate * seconds);
  const impulse = context.createBuffer(2, length, rate);

  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      // Deterministic-ish noise; exact values don't matter, the envelope does.
      const noise = Math.sin(i * (channel === 0 ? 12.9898 : 78.233)) * 43758.5453;
      const rand = noise - Math.floor(noise);
      data[i] = (rand * 2 - 1) * Math.pow(1 - i / length, 2.6);
    }
  }

  const convolver = context.createConvolver();
  convolver.buffer = impulse;
  return convolver;
}

export function getAudio(): { ctx: AudioContext; master: GainNode } | null {
  if (typeof window === "undefined") return null;

  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;

    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);

    wet = buildReverb(ctx);
    const wetGain = ctx.createGain();
    wetGain.gain.value = 0.3;
    wet.connect(wetGain);
    wetGain.connect(master);
  }

  if (ctx.state === "suspended") void ctx.resume();
  return { ctx, master: master! };
}

/** One soft plucked note. Returns silently if audio isn't available. */
export function playNote(freq: number, velocity = 0.5, duration = 1.5) {
  const audio = getAudio();
  if (!audio || !wet) return;
  const { ctx: c, master: out } = audio;
  const t = c.currentTime;

  const osc = c.createOscillator();
  osc.type = "triangle";
  osc.frequency.value = freq;

  // A second oscillator a whisker off pitch gives it body.
  const osc2 = c.createOscillator();
  osc2.type = "sine";
  osc2.frequency.value = freq * 1.004;

  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(2800, t);
  filter.frequency.exponentialRampToValueAtTime(700, t + duration);
  filter.Q.value = 0.6;

  const gain = c.createGain();
  const peak = Math.max(0.02, Math.min(velocity, 1) * 0.22);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  osc.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(out);
  gain.connect(wet);

  osc.start(t);
  osc2.start(t);
  osc.stop(t + duration + 0.05);
  osc2.stop(t + duration + 0.05);

  osc.onended = () => {
    osc.disconnect();
    osc2.disconnect();
    filter.disconnect();
    gain.disconnect();
  };
}

/** Suspends the context so a backgrounded tab isn't holding audio hardware. */
export function suspendAudio() {
  if (ctx && ctx.state === "running") void ctx.suspend();
}
