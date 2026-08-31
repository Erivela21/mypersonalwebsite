import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { site, person } from "@/content/profile";
import { MotionProvider } from "@/components/chrome/MotionProvider";
import "./globals.css";

/* The display face. SOFT rounds the terminals and WONK lets a few letterforms
   go deliberately off-model — that single axis is most of the handmade feeling. */
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s · ${site.title}`,
  },
  description: site.description,
  authors: [{ name: person.name, url: site.url }],
  creator: person.name,
  keywords: [
    "Enrique Rivela",
    "cybersecurity",
    "IE University",
    "music production",
    "ultramarathon",
    "computer science",
  ],
  openGraph: {
    type: "profile",
    title: site.title,
    description: site.description,
    url: site.url,
    siteName: site.title,
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f4ed" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1512" },
  ],
  colorScheme: "light dark",
};

/* Runs before first paint so an explicitly-chosen theme never flashes the
   wrong one. Kept deliberately tiny and dependency-free. */
const themeScript = `(function(){try{var s=localStorage.getItem("theme");var d=window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.setAttribute("data-theme",s==="light"||s==="dark"?s:(d?"dark":"light"))}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      // Server default; the inline script below corrects it before first paint.
      data-theme="light"
      // Next 16 no longer overrides scroll-behavior during navigation unless asked.
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${fraunces.variable} ${instrument.variable} ${jetbrains.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Motion renders an element's `initial` state into the server HTML as
            an inline style, then animates it away on mount. With scripting
            disabled that never happens, so anything with an entrance stays at
            opacity 0 — including the h1 with his name on it. This reveals them
            for readers without JavaScript, and costs nothing for everyone
            else, since a browser running scripts ignores it entirely. */}
        <noscript>
          <style>{`[style*="opacity:0"],[style*="opacity: 0"]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
