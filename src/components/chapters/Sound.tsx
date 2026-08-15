import { SoundStrip } from "@/components/art/SoundStrip";
import { Chapter, Container, Eyebrow, Lede } from "@/components/primitives/Chapter";
import { Film } from "@/components/primitives/Film";
import { Photo } from "@/components/primitives/Photo";
import { Reveal, RevealGroup, RevealItem } from "@/components/primitives/Reveal";
import { SplitHeading } from "@/components/primitives/SplitHeading";
import { sound } from "@/content/profile";

export function Sound() {
  return (
    <Chapter id="sound" tint="gold" className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <Eyebrow>Sound</Eyebrow>
        </Reveal>

        <SplitHeading
          text={sound.title}
          className="mt-6 text-[clamp(2.4rem,6.4vw,4.6rem)]"
        />

        <Reveal delay={0.1}>
          <Lede className="mt-7 max-w-2xl">{sound.lede}</Lede>
        </Reveal>

        <Reveal delay={0.16} className="mt-12">
          <SoundStrip hint={sound.toy.hint} />
        </Reveal>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <div className="space-y-5">
              {sound.body.map((para) => (
                <Reveal key={para.slice(0, 24)}>
                  <p className="prose-measure text-soft">{para}</p>
                </Reveal>
              ))}
            </div>

            <RevealGroup className="mt-8 flex flex-wrap gap-2" step={0.04}>
              {sound.genres.map((g) => (
                <RevealItem key={g}>
                  <span className="mono inline-block rounded-full border border-rule px-3.5 py-1.5 text-soft transition-colors hover:border-accent hover:text-accent-text">
                    {g}
                  </span>
                </RevealItem>
              ))}
            </RevealGroup>

            <Reveal>
              <p className="mt-8 border-l-2 border-accent pl-4 text-[1.05rem] text-ink">
                {sound.stage}
              </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {sound.photos.map((p) => (
              <Photo
                key={p.src}
                src={p.src}
                alt={p.alt}
                caption={p.caption}
                w={p.w}
                h={p.h}
                sizes="(max-width: 1024px) 46vw, 24vw"
              />
            ))}
            {sound.films.map((f) => (
              <Reveal key={f.src}>
                <Film src={f.src} label={f.label} />
                <p className="mono mt-3 text-faint">{f.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </Chapter>
  );
}
