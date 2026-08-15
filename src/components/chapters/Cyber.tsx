import { Network } from "@/components/art/Network";
import { Chapter, Container, Eyebrow, Lede } from "@/components/primitives/Chapter";
import { Photo } from "@/components/primitives/Photo";
import { Reveal, RevealGroup, RevealItem } from "@/components/primitives/Reveal";
import { SplitHeading } from "@/components/primitives/SplitHeading";
import { cyber } from "@/content/profile";

export function Cyber() {
  return (
    <Chapter id="cyber" tint="teal" className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <Eyebrow>Cyber</Eyebrow>
        </Reveal>

        <SplitHeading
          text={cyber.title}
          className="mt-6 text-[clamp(2.4rem,6.4vw,4.6rem)]"
        />

        <Reveal delay={0.1}>
          <Lede className="mt-7 max-w-2xl">{cyber.lede}</Lede>
        </Reveal>
      </Container>

      <Container wide className="mt-12">
        <Reveal soft>
          <Network className="h-[22rem] w-full sm:h-[26rem] lg:h-[30rem]" />
        </Reveal>

        <RevealGroup className="mt-4 flex flex-wrap justify-center gap-x-10 gap-y-3">
          {cyber.teams.map((t) => (
            <RevealItem key={t.id} className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="block h-2 w-2 rounded-full"
                style={{
                  background: t.id === "red" ? "var(--clay)" : "var(--river)",
                }}
              />
              <span className="mono text-soft">{t.label}</span>
              <span className="text-[0.875rem] text-faint">{t.note}</span>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>

      <Container className="mt-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div>
            <div className="space-y-5">
              {cyber.body.map((para) => (
                <Reveal key={para.slice(0, 24)}>
                  <p className="prose-measure text-soft">{para}</p>
                </Reveal>
              ))}
            </div>

            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              <Reveal>
                <p className="mono text-accent-text">{cyber.toolsLabel}</p>
                <ul className="mt-3 space-y-1.5">
                  {cyber.tools.map((t) => (
                    <li key={t} className="numeral text-[0.9375rem] text-soft">
                      {t}
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={0.06}>
                <p className="mono text-accent-text">{cyber.networkingLabel}</p>
                <ul className="mt-3 space-y-1.5">
                  {cyber.networking.map((t) => (
                    <li key={t} className="numeral text-[0.9375rem] text-soft">
                      {t}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>

          <Photo
            src={cyber.photo.src}
            alt={cyber.photo.alt}
            caption={cyber.photo.caption}
            w={cyber.photo.w}
            h={cyber.photo.h}
            sizes="(max-width: 1024px) 92vw, 34vw"
          />
        </div>
      </Container>
    </Chapter>
  );
}
