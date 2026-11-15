import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { person, stats } from "@/content/profile";

// The picture shown when the site link is pasted into LinkedIn, WhatsApp, Slack and so on.
export const alt = `${person.name}, ${person.headline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Shorter labels than on the page, so all three numbers fit on one line.
const SHORT = ["years building software", "years leading teams", "years on regulated health data"];

export default async function OpengraphImage() {
  const photo = await readFile(join(process.cwd(), "public", "or-haim-sabag.png"));
  const photoSrc = `data:image/png;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          color: "#e8ecf6",
          backgroundColor: "#070a12",
          backgroundImage:
            "radial-gradient(circle at 88% 0%, rgba(139,124,255,0.35), transparent 45%), radial-gradient(circle at 0% 100%, rgba(94,230,200,0.22), transparent 45%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoSrc} width={132} height={132} alt="" style={{ borderRadius: 999, border: "3px solid #1f2942" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 46, fontWeight: 700 }}>{person.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 26, color: "#a9e39c" }}>
              <div style={{ width: 14, height: 14, borderRadius: 99, background: "#7ed36b" }} />
              Open to work
            </div>
          </div>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 96,
              height: 96,
              borderRadius: 24,
              border: "4px solid #5ee6c8",
              color: "#5ee6c8",
              fontSize: 34,
              fontWeight: 800,
            }}
          >
            OHS
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 22, letterSpacing: 5, color: "#5ee6c8", textTransform: "uppercase" }}>{person.tagline}</div>
          <div style={{ display: "flex", flexWrap: "wrap", marginTop: 18, fontSize: 60, lineHeight: 1.12, fontWeight: 600 }}>
            <span>I lead engineering teams and build production software end to end, with&nbsp;</span>
            <span style={{ color: "#5ee6c8" }}>AI agent systems</span>
            <span>&nbsp;inside.</span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 23, color: "#93a0bd" }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span style={{ fontSize: 44, fontWeight: 700, color: "#8b7cff" }}>{s.value}</span>
              <span>{SHORT[i] ?? s.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
