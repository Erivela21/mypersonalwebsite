/**
 * Every fact and every line of copy on this site lives here.
 *
 * Rules:
 *  - Nothing here is invented. Sources are Enrique's own words and his CV.
 *  - Voice: casual and first person, the way he actually talks. Contractions
 *    are fine and wanted. What is not fine: em dashes anywhere, clever
 *    inversions, rule-of-three, or any sentence that sounds like it was
 *    written to be quoted. Those are the things that read as AI.
 *  - Optional fields render nothing when empty, so the site is complete today
 *    and gets richer as files are dropped in.
 */

export const person = {
  name: "Enrique Rivela",
  role: "Computer Science & AI student",
  email: "erivelagomez@gmail.com",
  github: "https://github.com/Erivela21",
  linkedin: "https://www.linkedin.com/in/enrique-rivela/",
  location: "Spain",
  /**
   * Removed at Enrique's request. The PDF carried his personal mobile number,
   * which does not belong on a public page. Set a path here to bring the
   * footer link back.
   */
  cv: null as string | null,
} as const;

export const site = {
  /**
   * The stable Vercel production domain, not a per-deployment URL (those end
   * in a random hash and change on every push).
   *
   * This one line feeds metadataBase, the canonical URL, sitemap.xml,
   * robots.txt and the Open Graph share card. If a real domain is bought
   * later, changing it here updates all of them.
   */
  url: "https://mypersonalwebsite-five-tau.vercel.app",
  title: "Enrique Rivela",
  tagline: "Computer science, cybersecurity, music and running.",
  description:
    "Enrique Rivela. Computer science and AI student, co-founder of the IE Cybersecurity Club, music producer and long distance runner. Currently on exchange in São Paulo.",
} as const;

/* ------------------------------------------------------------------ hero -- */

export type Facet = {
  id: string;
  label: string;
  src: string;
  alt: string;
  /** Which accent this card pulls from. */
  tint: "moss" | "river" | "clay" | "gold" | "teal";
  /** Where the subject actually sits, so a 3:4 crop doesn't cut it out. */
  focus: string;
};

export const hero = {
  name: "Enrique Rivela",
  sub: "My personal website.",
  scrollCue: "Scroll",
  /** The four things the site is about, shown as real photographs. */
  facets: [
    {
      id: "cyber",
      label: "Cybersecurity",
      src: "/media/club.png",
      alt: "Students around a table of open laptops at the cybersecurity club",
      tint: "teal",
      focus: "50% 62%",
    },
    {
      id: "running",
      label: "Running",
      src: "/media/race-start.jpg",
      alt: "Four friends in the starting pen of a road race in Madrid, packed in with hundreds of other runners before the gun",
      tint: "clay",
      focus: "50% 62%",
    },
    {
      id: "music",
      label: "Music",
      src: "/media/concert.png",
      alt: "Singing into a microphone under a single spotlight",
      tint: "gold",
      focus: "50% 48%",
    },
    {
      id: "places",
      label: "Places",
      src: "/media/japan.png",
      alt: "A snowbound village of steep thatched roofs seen through a wooden window",
      tint: "river",
      focus: "58% 34%",
    },
    {
      id: "outdoors",
      label: "Outdoors",
      src: "/media/ourense.png",
      alt: "A river pool over granite with a dog asleep on the sand",
      tint: "moss",
      focus: "50% 58%",
    },
  ] satisfies Facet[],
} as const;

/* ----------------------------------------------------------------- doing -- */

export type Shot = {
  src: string;
  alt: string;
  caption: string;
  w: number;
  h: number;
};

export const doing = {
  title: "Things I do when I'm not at a laptop",
  lede: "Photos I took and actually like. A lot of them are Galicia, because that's where I keep ending up.",
  shots: [
    {
      src: "/media/ourense.png",
      alt: "A still river pool over granite slabs with oak trees behind and a dog asleep on the sand",
      caption:
        "Ourense, Galicia. That's my uncle's dog, asleep on the sand like he always is.",
      w: 768,
      h: 1024,
    },
    {
      src: "/media/nerga.png",
      alt: "Turquoise shallows over granite boulders with a pine headland curving around the bay",
      caption: "Rías Baixas, Galicia. This is where I spend my summers.",
      w: 1024,
      h: 461,
    },
    {
      src: "/media/beach-walk.png",
      alt: "Two people carrying a paddleboard down to flat water under a mackerel sky",
      caption:
        "Rías Baixas again. Paddleboarding with friends, early, before it got too hot.",
      w: 576,
      h: 1024,
    },
    {
      src: "/media/snow.png",
      alt: "Snow covered peaks at dusk with pink cloud and footprints across the drift",
      caption: "The Pyrenees. I do a bit of alpinism when I can get up there.",
      w: 768,
      h: 1024,
    },
    {
      src: "/media/beach-pines.png",
      alt: "Pines on a low cliff above a curving beach with waves running in",
      caption: "Galicia. I know this bit of coast pretty well by now.",
      w: 1024,
      h: 576,
    },
    {
      src: "/media/portugal.png",
      alt: "A pale limestone cliff above an empty beach and a deep blue sea",
      caption: "Portugal, on a trip with my friends.",
      w: 768,
      h: 1024,
    },
    {
      src: "/media/japan.png",
      alt: "A snowbound village of steep thatched roofs framed by a wooden window",
      caption: "Japan, with my family. Still working on the language.",
      w: 768,
      h: 1024,
    },
  ] satisfies Shot[],
} as const;

/* ---------------------------------------------------------------- moving -- */

export const moving = {
  title: "Eighty nine of a hundred and three",
  lede: "I signed up for the 103 km at Estrelaçor, in the Serra da Estrela. I got to 89 and wasn't allowed to carry on.",
  body: [
    "Fourteen and a half hours, most of it in the dark. I was pulled about fourteen kilometres from the finish because I was missing a piece of the required kit. Not because I wanted to stop.",
    "That's a stupid way to end a race and it's entirely on me for not checking properly. It also means I never found out where my actual limit was that day, which is the part that still bothers me.",
    "I'm going back for the rest of it, with the right kit this time.",
  ],
  /**
   * Everything here is measured from Enrique's own GPX, in src/content/route.ts.
   * The Serra da Estrela location is derived from the coordinates in that file
   * and the 1,995 m high point, which is Torre. Neither is assumed.
   *
   * The two distance figures are the whole point of this section: he entered a
   * 103 km race and covered 89.2 km of it. Do not collapse them into one
   * number, and do not describe this as a finish.
   */
  stravaUrl: "https://www.strava.com/activities/16032912335",
  /**
   * `count` marks a figure as a real number that can be animated up from zero.
   * Moving time is a duration, not a quantity, so it has none and renders flat.
   */
  stats: [
    { label: "I covered", value: "89.2", unit: "km", count: 89.2 },
    { label: "Full course", value: "103", unit: "km", count: 103 },
    { label: "Moving time", value: "14h 32m", unit: "" },
    { label: "Climbing", value: "2,811", unit: "m", count: 2811, separator: "," },
    { label: "Highest point", value: "1,995", unit: "m", count: 1995, separator: "," },
  ] as {
    label: string;
    value: string;
    unit: string;
    count?: number;
    separator?: string;
  }[],
  photo: {
    src: "/media/ultra.png",
    alt: "Race kit laid out on a table with a hydration vest being adjusted",
    caption: "The morning of the race. Mostly admin, honestly.",
    w: 768,
    h: 1024,
  } satisfies Shot & { caption: string },
  films: [
    { src: "/video/ultra-run.mp4", label: "During the race" },
    { src: "/video/ultra.mp4", label: "Training for it" },
  ],
  others: [
    { name: "Football", note: "The one I've played the longest." },
    { name: "Tennis", note: "Good for days when I don't want to think." },
    {
      name: "Strength training",
      note: "Boring, but it's the reason the long runs don't wreck me.",
    },
  ],
} as const;

/* ----------------------------------------------------------------- sound -- */

export type Track = {
  title: string;
  src: string;
  cover?: string;
  note?: string;
};

export const sound = {
  title: "I make music",
  lede: "I've been doing it long enough that it's not a phase.",
  body: [
    "Mostly production and songwriting. Hip hop and rap are the base, but I keep dragging other stuff in. Heavy metal, flamenco, whatever's stuck in my head that week. Some of it works. Most of it doesn't. I keep trying anyway.",
    "I play piano and I'm learning guitar, which so far mostly means I'm bad at guitar.",
  ],
  stage: "I get on stage sometimes too, which is a completely different kind of scary.",
  genres: ["Hip hop", "Rap", "Heavy metal", "Flamenco", "Whatever else"],
  /**
   * Artwork from releases he previously had on Spotify. These are separate from
   * the two excerpts above, so the layout keeps them apart. Do not caption them
   * as artwork for those tracks.
   *
   * Downscaled from an 11.7 MB 4864px master and a 1920px banner.
   */
  artwork: {
    label: "Cover art",
    note: "From a couple of albums I used to have up on Spotify.",
    hint: "Drag it, click it, or use the button.",
    covers: [
      {
        src: "/media/covers/war-banner.jpg",
        alt: "Wide artwork: overlapping glitched figures in tactical gear on a ruined boardwalk under a full moon",
        label: "Wide artwork",
        w: 1920,
        h: 810,
      },
      {
        src: "/media/covers/war-cover.jpg",
        alt: "Album cover: a figure in tactical gear advancing through heavy smoke over scorched ground, two jets crossing the sky above, with a parental advisory label in the corner",
        label: "Album cover",
        w: 1800,
        h: 1800,
      },
    ],
  },
  /**
   * Twenty second excerpts, cut from the 24-bit and 32-bit float masters with
   * fades only at the cut points. His mix is otherwise untouched: no
   * normalisation, no limiting, no level changes.
   */
  tracksLabel: "Two of mine",
  tracksNote: "Twenty second excerpts. Headphones are better.",
  tracks: [
    {
      title: "Trago al Suelo",
      src: "/audio/trago-al-suelo.mp3",
    },
    {
      title: "Welcome to the Hip-Hop",
      src: "/audio/welcome-to-the-hip-hop.mp3",
    },
  ] satisfies Track[],
  toy: {
    label: "Or make your own",
    hint: "Drag across the strip. It makes a sound, which is about all I can promise.",
  },
  photos: [
    {
      src: "/media/studio.png",
      alt: "A treated studio room with monitors, a MIDI controller and a session open on screen",
      caption: "Where most of it happens",
      w: 768,
      h: 1024,
    },
    {
      src: "/media/concert.png",
      alt: "A figure at a microphone under a single hard spotlight with the room behind in darkness",
      caption: "And sometimes this",
      w: 682,
      h: 1024,
    },
  ] satisfies Shot[],
  films: [
    { src: "/video/studio.mp4", label: "Studio" },
    { src: "/video/concert.mp4", label: "Stage" },
  ],
} as const;

/* -------------------------------------------------------------- building -- */

export const building = {
  title: "What I build",
  lede: "I study computer science and AI at IE University in Madrid. I finish in 2027.",
  body: "I like knowing how things work, which usually means taking them apart before I can put them back together.",
  roles: [
    {
      org: "Automation startup",
      what: "Madrid",
      when: "Nov 2025 to now",
      body: "I build n8n automations and an AI chatbot that goes into client websites. Most of the job is getting one company's API to talk to another company's API without either of them noticing anything weird.",
    },
    {
      org: "Kabel",
      what: "Consulting firm, Madrid",
      when: "2021 to 2022",
      body: "I helped the Solutions Area Manager look into computer vision for spotting anomalies in automated processes. I was still in school and understood maybe half of it, which was half more than when I started.",
    },
  ],
  study: {
    label: "IE University",
    detail: "BSc Computer Science and Artificial Intelligence. I finish in June 2027.",
    courses: [
      "Language models",
      "Machine learning",
      "Artificial intelligence",
      "Networks",
      "Mathematics",
    ],
  },
  languagesLabel: "Languages I write in",
  languages: ["Python", "C", "Java"],
} as const;

/* ----------------------------------------------------------------- cyber -- */

export const cyber = {
  title: "Red team, blue team",
  lede: "In January 2025 a friend and I started the first cybersecurity club at IE University.",
  body: [
    "We run labs, CTFs and hackathons, and we get people from the industry to come in and talk. It's split into red team and blue team on purpose. Attacking and defending teach you different halves of the same thing and you need both of them.",
    "I'm not an expert and I'd rather nobody called me one. I'm a student who found something he wants to get good at. Most of the learning happens on Hack The Box and HTB Academy, at night, slowly.",
  ],
  teams: [
    { id: "red", label: "Red team", note: "Find the way in." },
    { id: "blue", label: "Blue team", note: "Notice that someone did." },
  ],
  toolsLabel: "Tools I actually use",
  tools: ["Nmap", "Wireshark", "Burp Suite", "Metasploit"],
  networkingLabel: "Networking",
  networking: ["TCP/IP", "DNS", "VPNs", "Firewalls"],
  photo: {
    src: "/media/club.png",
    alt: "Five students around a table covered in laptops in a glass walled university room",
    caption: "The two of us who started it, and the people who made it a club.",
    w: 576,
    h: 1024,
  } satisfies Shot & { caption: string },
} as const;

/* ------------------------------------------------------------------- now -- */

export const now = {
  title: "Right now",
  lede: "I'm in São Paulo on exchange at Insper for about five months.",
  body: [
    // The one place the journey is stated, now that Places is gone.
    "For context: I was born in Madrid, moved to Menlo Park in California when I was seven, went back to Madrid at twelve and stayed nine years, and now I'm here.",
    "After this I go back for my final year at IE. Then I'd like to work in security. That's the whole plan and I know it isn't much of one.",
  ],
  book: {
    title: "The Midnight Library",
    author: "Matt Haig",
    note: "My favourite book, and the one I'd tell anyone to read. It's about all the lives you could've lived instead of this one.",
  },
  spokenLabel: "Languages I speak",
  spokenLanguages: [
    { name: "Spanish", level: "Native" },
    { name: "English", level: "Bilingual" },
    { name: "Portuguese", level: "Advanced" },
    { name: "Japanese", level: "Learning" },
  ],
  readingLabel: "What I'd recommend",
} as const;

/* -------------------------------------------------------------- chapters -- */

export type ChapterId =
  | "hero"
  | "doing"
  | "moving"
  | "sound"
  | "building"
  | "cyber"
  | "now";

export type Chapter = {
  id: ChapterId;
  label: string;
  tint: "moss" | "river" | "clay" | "gold" | "stone" | "teal";
};

export const chapters: Chapter[] = [
  { id: "hero", label: "Me", tint: "moss" },
  { id: "doing", label: "Things I do", tint: "river" },
  { id: "moving", label: "Running", tint: "clay" },
  { id: "sound", label: "Music", tint: "gold" },
  { id: "building", label: "Building", tint: "moss" },
  { id: "cyber", label: "Cyber", tint: "teal" },
  { id: "now", label: "Now", tint: "gold" },
];
