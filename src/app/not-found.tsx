import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not here",
};

export default function NotFound() {
  return (
    <main className="tint-moss flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
      <div aria-hidden className="grain" />

      <svg width="80" height="120" viewBox="0 0 80 120" fill="none" aria-hidden>
        <path
          d="M40 4 C 40 40, 12 52, 12 74"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />
        <circle cx="12" cy="80" r="3.5" fill="var(--accent)" />
      </svg>

      <h1 className="mt-8 text-[clamp(2rem,6vw,3rem)]">Nothing here</h1>

      <p className="mt-4 max-w-sm text-soft">
        This page does not exist, which is impressive given how small the site
        is.
      </p>

      <Link
        href="/"
        className="mono mt-9 rounded-full border border-rule px-5 py-2.5 text-accent-text transition-colors hover:border-accent"
      >
        Back to the start
      </Link>
    </main>
  );
}
