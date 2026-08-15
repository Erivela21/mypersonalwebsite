import { ChapterRail } from "@/components/chrome/ChapterRail";
import { Cursor } from "@/components/chrome/Cursor";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { ThemeToggle } from "@/components/chrome/ThemeToggle";
import { Thread } from "@/components/primitives/Thread";

import { Hero } from "@/components/chapters/Hero";
import { Doing } from "@/components/chapters/Doing";
import { Moving } from "@/components/chapters/Moving";
import { Sound } from "@/components/chapters/Sound";
import { Building } from "@/components/chapters/Building";
import { Cyber } from "@/components/chapters/Cyber";
import { Now } from "@/components/chapters/Now";

/**
 * One line runs the length of this page.
 *
 * `Thread` hands it between chapters, arriving at whichever edge the next
 * chapter's layout starts on, which is why the `from`/`to` values wander
 * rather than staying centred. In each chapter it becomes that chapter's own
 * object: a ridge, a waveform, a network edge. It never terminates.
 */
export default function Page() {
  return (
    <>
      <a href="#doing" className="skip-link">
        Skip to content
      </a>

      <div aria-hidden className="grain" />
      <Cursor />
      <ChapterRail />
      <ThemeToggle />

      <main id="main">
        <Hero />

        <Thread from={50} to={34} />
        <Doing />

        <Thread from={34} to={68} dashed />
        <Moving />

        <Thread from={68} to={42} />
        <Sound />

        <Thread from={42} to={56} />
        <Building />

        <Thread from={56} to={38} dashed />
        <Cyber />

        <Thread from={38} to={50} />
        <Now />
      </main>

      <SiteFooter />
    </>
  );
}
