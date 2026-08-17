import { RouteMap } from "@/components/art/RouteMap";
import { Chapter, Container, Eyebrow, Lede } from "@/components/primitives/Chapter";
import { Film } from "@/components/primitives/Film";
import { Photo } from "@/components/primitives/Photo";
import { Reveal, RevealGroup, RevealItem } from "@/components/primitives/Reveal";
import { SplitHeading } from "@/components/primitives/SplitHeading";
import { moving } from "@/content/profile";
import { route } from "@/content/route";

export function Moving() {
  return (
    <Chapter id="moving" tint="clay" className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <Eyebrow>Moving</Eyebrow>
        </Reveal>

        <SplitHeading
          text={moving.title}
          className="mt-6 max-w-4xl text-[clamp(2.4rem,6.4vw,4.6rem)]"
        />

        <Reveal delay={0.1}>
          <Lede className="mt-7 max-w-2xl">{moving.lede}</Lede>
        </Reveal>
      </Container>

      <Container wide className="mt-14">
        <RouteMap />
      </Container>

      <Container className="mt-16">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div>
            {/* Every figure here is measured from his own GPX. Nothing is
                rounded up and nothing is estimated. */}
            <RevealGroup className="flex flex-wrap gap-x-12 gap-y-6 border-b border-rule pb-8">
              {moving.stats.map((s) => (
                <RevealItem key={s.label}>
                  <p className="mono text-faint">{s.label}</p>
                  <p className="numeral mt-1.5 text-[1.75rem] leading-none text-accent-text">
                    {s.value}
                    {s.unit && (
                      <span className="ml-1 text-[1.05rem] text-faint">{s.unit}</span>
                    )}
                  </p>
                </RevealItem>
              ))}
              <RevealItem>
                <p className="mono text-faint">Race</p>
                <p className="mt-1.5 text-[1.75rem] leading-none">{route.name}</p>
                {/* Anyone can go and check the run themselves, which is a
                    stronger claim than any number set in a nice typeface. */}
                <a
                  href={moving.stravaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono mt-2 inline-flex items-center gap-1 text-accent-text underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent"
                >
                  On Strava
                  <span aria-hidden>↗</span>
                </a>
              </RevealItem>
            </RevealGroup>

            <div className="mt-8 space-y-5">
              {moving.body.map((para) => (
                <Reveal key={para.slice(0, 24)}>
                  <p className="prose-measure text-soft">{para}</p>
                </Reveal>
              ))}
            </div>

            <RevealGroup as="ul" className="mt-12 space-y-0">
              {moving.others.map((o) => (
                <RevealItem
                  as="li"
                  key={o.name}
                  className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 border-t border-rule py-4"
                >
                  <span className="text-[1.05rem]">{o.name}</span>
                  <span className="text-[0.9375rem] text-faint">{o.note}</span>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>

          <div className="flex flex-col gap-6 sm:flex-row lg:flex-col">
            <Photo
              src={moving.photo.src}
              alt={moving.photo.alt}
              caption={moving.photo.caption}
              w={moving.photo.w}
              h={moving.photo.h}
              className="flex-1"
              sizes="(max-width: 1024px) 46vw, 30vw"
            />
            <Reveal className="flex-1">
              <Film src={moving.film.src} label={moving.film.label} />
              <p className="mono mt-3 text-faint">{moving.film.label}</p>
            </Reveal>
          </div>
        </div>
      </Container>
    </Chapter>
  );
}
