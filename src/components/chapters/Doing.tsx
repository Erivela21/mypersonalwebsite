import { Chapter, Container, Eyebrow } from "@/components/primitives/Chapter";
import { Photo } from "@/components/primitives/Photo";
import { Reveal } from "@/components/primitives/Reveal";
import { doing } from "@/content/profile";

/**
 * Enrique's own photographs, ungraded, each with a line saying where it is and
 * what he was doing there.
 *
 * CSS columns rather than a grid: the shots are a mix of portrait and
 * landscape, and a masonry flow lets each keep its real proportions instead of
 * being cropped into a uniform card.
 */
export function Doing() {
  return (
    <Chapter id="doing" tint="river" className="py-24 sm:py-28">
      <Container wide>
        <Reveal>
          <Eyebrow>Things I do</Eyebrow>
        </Reveal>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
          <Reveal delay={0.06}>
            <h2 className="max-w-2xl text-[clamp(2rem,4.6vw,3.2rem)]">
              {doing.title}
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="max-w-xs text-[0.9375rem] text-soft">{doing.lede}</p>
          </Reveal>
        </div>

        <div className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {doing.shots.map((s) => (
            <Photo
              key={s.src}
              src={s.src}
              alt={s.alt}
              caption={s.caption}
              w={s.w}
              h={s.h}
              className="mb-6 break-inside-avoid"
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
            />
          ))}
        </div>
      </Container>
    </Chapter>
  );
}
