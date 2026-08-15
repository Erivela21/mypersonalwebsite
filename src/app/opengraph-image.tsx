import { ImageResponse } from "next/og";
import { person, site } from "@/content/profile";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${person.name}. ${site.tagline}`;

/**
 * The share card is the valley, flattened.
 *
 * Deliberately uses only system faces: pulling Fraunces over the network at
 * build time would make the card a build-time dependency on Google's CDN for
 * no real gain at this size.
 */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: "#F6F4ED",
          position: "relative",
        }}
      >
        {/* sun */}
        <div
          style={{
            position: "absolute",
            top: 96,
            right: 130,
            width: 150,
            height: 150,
            borderRadius: 999,
            background: "#E8D9AE",
            display: "flex",
          }}
        />

        {/* far ridge */}
        <svg
          width="1200"
          height="330"
          viewBox="0 0 1200 330"
          style={{ position: "absolute", bottom: 0, left: 0 }}
        >
          <path
            d="M0 150 L92 96 L152 122 L242 44 L320 106 L394 70 L472 126 L562 60 L642 116 L722 78 L808 130 L892 90 L978 130 L1062 96 L1142 132 L1200 112 L1200 330 L0 330 Z"
            fill="#C7D2CE"
          />
          <path
            d="M0 206 C 120 164, 240 230, 360 200 C 480 170, 600 234, 720 206 C 840 178, 960 232, 1080 204 C 1140 190, 1170 196, 1200 192 L1200 330 L0 330 Z"
            fill="#A3B6A5"
          />
          <path
            d="M0 268 C 150 232, 300 288, 450 268 C 600 248, 700 292, 830 276 C 960 260, 1090 286, 1200 264 L1200 330 L0 330 Z"
            fill="#6F8B72"
          />
        </svg>

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            padding: "0 80px 132px",
          }}
        >
          <div
            style={{
              fontSize: 21,
              letterSpacing: 5,
              color: "#3A5540",
              display: "flex",
            }}
          >
            CYBERSECURITY · MUSIC · RUNNING
          </div>
          <div
            style={{
              fontSize: 108,
              color: "#1E2A22",
              marginTop: 20,
              letterSpacing: -3,
              display: "flex",
            }}
          >
            {person.name}
          </div>
          <div
            style={{
              fontSize: 31,
              color: "#4A574E",
              marginTop: 18,
              display: "flex",
            }}
          >
            {site.tagline}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
