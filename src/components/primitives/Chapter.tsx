import type { ReactNode } from "react";
import type { Chapter as ChapterMeta } from "@/content/profile";

const TINT: Record<ChapterMeta["tint"], string> = {
  moss: "tint-moss",
  river: "tint-river",
  clay: "tint-clay",
  gold: "tint-gold",
  stone: "tint-stone",
  teal: "tint-teal",
};

/**
 * A chapter is an environment, not a block. It owns its tint — everything
 * inside reads `--accent` from here, so a section changes character by
 * changing one class.
 */
export function Chapter({
  id,
  tint,
  children,
  className = "",
  as: Tag = "section",
  wash = true,
}: {
  id: string;
  tint: ChapterMeta["tint"];
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "footer";
  wash?: boolean;
}) {
  return (
    <Tag
      id={id}
      // scroll-mt keeps anchored headings clear of the top of the viewport
      className={`${TINT[tint]} relative scroll-mt-8 isolate ${className}`}
    >
      {wash && <div aria-hidden className="wash" />}
      {children}
    </Tag>
  );
}

export function Container({
  children,
  className = "",
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`mx-auto w-full px-6 sm:px-8 lg:px-12 ${
        wide ? "max-w-[86rem]" : "max-w-[68rem]"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/** The small mono label above a chapter title. */
export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`mono text-accent-text ${className}`}>
      <span className="inline-block h-px w-6 translate-y-[-0.25em] bg-current align-middle opacity-60" />
      <span className="ml-3">{children}</span>
    </p>
  );
}

export function Lede({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`font-display text-[1.55rem] leading-[1.32] text-ink sm:text-[1.9rem] ${className}`}
      style={{ fontVariationSettings: '"SOFT" 60, "WONK" 1' }}
    >
      {children}
    </p>
  );
}

export function Body({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`prose-measure text-soft ${className}`}>{children}</p>
  );
}
