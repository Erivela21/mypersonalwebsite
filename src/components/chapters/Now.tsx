import { BookCover } from "@/components/art/BookCover";
import { AuroraBackdrop } from "@/components/reactbits/AuroraBackdrop";
import { Chapter, Container, Eyebrow, Lede } from "@/components/primitives/Chapter";
import { Reveal, RevealGroup, RevealItem } from "@/components/primitives/Reveal";
import { SplitHeading } from "@/components/primitives/SplitHeading";
import { now } from "@/content/profile";

/**
 * The last chapter is deliberately open. No summary, no call to action. He is
 * twenty one and halfway through an exchange, and a tidy conclusion would be a
 * lie about where he actually is. The line leaves the bottom unfinished.
 */
export function Now() {
  return (
    <Chapter id="now" tint="gold" className="relative overflow-hidden py-24 sm:py-32">
      {/* The last chapter gets the same light as the first, so the site closes
          where it opened. Same lazy chunk, already fetched by this point. */}
      <AuroraBackdrop className="-z-10 top-auto h-[55%]" opacity={0.34} />

      <Container>
        <Reveal>
          <Eyebrow>Now</Eyebrow>
        </Reveal>

        <SplitHeading
          text={now.title}
          className="mt-6 text-[clamp(2.4rem,6.4vw,4.6rem)]"
        />

        <Reveal delay={0.1}>
          <Lede className="mt-7 max-w-2xl">{now.lede}</Lede>
        </Reveal>

        <div className="mt-8 space-y-5">
          {now.body.map((para) => (
            <Reveal key={para.slice(0, 24)}>
              <p className="prose-measure text-soft">{para}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 grid gap-12 border-t border-rule pt-10 sm:grid-cols-2">
          <div>
            <Reveal>
              <p className="mono text-accent-text">{now.spokenLabel}</p>
            </Reveal>
            <RevealGroup as="ul" className="mt-4 space-y-2.5" step={0.05}>
              {now.spokenLanguages.map((l) => (
                <RevealItem
                  as="li"
                  key={l.name}
                  className="flex items-baseline justify-between gap-6 border-b border-rule/60 pb-2.5"
                >
                  <span className="text-[1.0625rem]">{l.name}</span>
                  <span className="mono text-faint">{l.level}</span>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>

          <div>
            <Reveal>
              <p className="mono text-accent-text">{now.readingLabel}</p>
            </Reveal>

            <div className="mt-5 flex flex-wrap items-start gap-7">
              <BookCover title={now.book.title} author={now.book.author} />

              <Reveal delay={0.1} className="max-w-[15rem]">
                <h3 className="text-[1.4rem] leading-tight">{now.book.title}</h3>
                <p className="mono mt-1.5 text-faint">{now.book.author}</p>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-soft">
                  {now.book.note}
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </Container>

      {/* The line leaves the page rather than stopping. */}
      <div aria-hidden className="pointer-events-none relative mt-12 h-16">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <path
            d="M 50 0 C 50 40, 50 60, 50 100"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.25"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            opacity="0.5"
          />
        </svg>
      </div>
    </Chapter>
  );
}
