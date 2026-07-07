import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import type { ReactNode } from "react";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "@/styles/globals.css";

// Self-hosted fonts (README.md §Design Tokens) exposed as the CSS variables that
// styles/globals.css composes into --sans / --mono / --serif.
const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap" });
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});
const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ATB Console",
  description: "Real-time AI agent-orchestration console",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable}`}
    >
      <head>
        {/* Apply the persisted theme before first paint (no flash). */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: required no-FOUC blocking script */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
