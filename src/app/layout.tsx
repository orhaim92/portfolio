import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Backdrop } from "@/components/Backdrop";
import { VisitBeacon } from "@/components/VisitBeacon";
import { person } from "@/content/profile";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const display = Instrument_Serif({ variable: "--font-display", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// On Vercel this is the production address, so link previews point at the real site.
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3210";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${person.name} · ${person.headline}`,
  description: person.summary,
  openGraph: { title: `${person.name} · ${person.headline}`, description: person.summary, type: "profile", siteName: person.name },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${display.variable} antialiased`}>
      <body className="min-h-screen">
        <noscript>
          <style>{`.reveal,.rise{opacity:1!important;transform:none!important;animation:none!important}`}</style>
        </noscript>
        <Backdrop />
        <VisitBeacon />
        {children}
      </body>
    </html>
  );
}
