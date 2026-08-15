import { Chapter, Container, Eyebrow, Lede } from "@/components/primitives/Chapter";
import { Reveal, RevealGroup, RevealItem } from "@/components/primitives/Reveal";
import { SplitHeading } from "@/components/primitives/SplitHeading";
import { building } from "@/content/profile";

/**
 * The least decorated chapter on the site, deliberately.
 *
 * This is the section a reader is most likely to be scanning for credibility,
 * and credibility is undermined by ornament. Hairlines, honest dates, plain
 * type. It earns its authority by not performing.
 */
export function Building() {
  return (
    <Chapter id="building" tint="stone" className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <Eyebrow>Building</Eyebrow>
        </Reveal>

        <SplitHeading
          text={building.title}
          className="mt-6 text-[clamp(2.4rem,6.4vw,4.6rem)]"
        />

        <Reveal delay={0.1}>
          <Lede className="mt-7 max-w-2xl">{building.lede}</Lede>
        </Reveal>

        <Reveal delay={0.16}>
          <p className="prose-measure mt-6 text-soft">{building.body}</p>
        </Reveal>

        <div className="mt-16">
          {building.roles.map((r) => (
            <Reveal key={r.org}>
              <article className="grid gap-x-10 gap-y-3 border-t border-rule py-8 sm:grid-cols-[13rem_1fr]">
                <div>
                  <h3 className="text-[1.35rem] leading-tight">{r.org}</h3>
                  <p className="mono mt-2 text-accent-text">{r.when}</p>
                  <p className="mt-1 text-[0.875rem] text-faint">{r.what}</p>
                </div>
                <p className="max-w-xl text-soft">{r.body}</p>
              </article>
            </Reveal>
          ))}

          <Reveal>
            <article className="grid gap-x-10 gap-y-3 border-y border-rule py-8 sm:grid-cols-[13rem_1fr]">
              <div>
                <h3 className="text-[1.35rem] leading-tight">
                  {building.study.label}
                </h3>
                {/* Only the end date is confirmed; the start year is not
                    stated anywhere he has given me, so it is not invented. */}
                <p className="mono mt-2 text-accent-text">Until June 2027</p>
              </div>
              <div className="max-w-xl">
                <p className="text-soft">{building.study.detail}</p>

                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                  {building.study.courses.map((c) => (
                    <span key={c} className="text-[0.9375rem] text-faint">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          </Reveal>
        </div>

        <RevealGroup className="mt-10 flex flex-wrap items-center gap-3" step={0.05}>
          <RevealItem>
            <span className="mono text-accent-text">{building.languagesLabel}</span>
          </RevealItem>
          {building.languages.map((l) => (
            <RevealItem key={l}>
              <span className="numeral rounded-full bg-sunk px-3.5 py-1.5 text-[0.8125rem] text-soft">
                {l}
              </span>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </Chapter>
  );
}
