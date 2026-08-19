import { Chapter, Container } from "@/components/primitives/Chapter";
import { Reveal } from "@/components/primitives/Reveal";
import { Magnet } from "@/components/reactbits/Magnet";
import { person } from "@/content/profile";

const LINKS = [
  { label: "Email", value: person.email, href: `mailto:${person.email}` },
  { label: "GitHub", value: "Erivela21", href: person.github },
  { label: "LinkedIn", value: "enrique-rivela", href: person.linkedin },
  // Only appears once `person.cv` points at a file that exists.
  ...(person.cv ? [{ label: "CV", value: "Download PDF", href: person.cv }] : []),
];

export function SiteFooter() {
  return (
    <Chapter as="footer" id="footer" tint="moss" className="border-t border-rule py-16">
      <Container>
        <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-10">
          <Reveal>
            <p className="font-display text-[1.6rem] leading-tight">{person.name}</p>
            <p className="mono mt-2 text-faint">{person.location}</p>
          </Reveal>

          <Reveal delay={0.06}>
            <ul className="flex flex-col gap-3 sm:flex-row sm:gap-10">
              {LINKS.map((l) => (
                <li key={l.label}>
                  <p className="mono text-faint">{l.label}</p>
                  <Magnet radius={60} strength={4} className="mt-1">
                  <a
                    href={l.href}
                    className="group inline-flex items-center gap-1.5 text-[1.0625rem] transition-colors hover:text-accent-text"
                    {...(l.href.startsWith("http")
                      ? { target: "_blank", rel: "noreferrer noopener" }
                      : {})}
                  >
                    <span className="border-b border-transparent transition-colors group-hover:border-accent">
                      {l.value}
                    </span>
                    {l.href.startsWith("http") && (
                      <svg
                        width="9"
                        height="9"
                        viewBox="0 0 10 10"
                        fill="none"
                        aria-hidden
                        className="translate-y-[-1px] opacity-45 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-[-3px]"
                      >
                        <path
                          d="M1 9L9 1M9 1H3M9 1V7"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </a>
                  </Magnet>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-6">
          <p className="mono text-faint">
            Built by hand · {new Date().getFullYear()}
          </p>
          <a href="#hero" className="mono text-faint transition-colors hover:text-accent-text">
            Back to the top
          </a>
        </div>
      </Container>
    </Chapter>
  );
}
