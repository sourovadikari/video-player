import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import "../components/media-player/media-player.css";
import "../components/media-player/player-tuning.css";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: { default: "signalplay | A media player for the web", template: "%s | signalplay" },
  description: "A reusable, accessible React video and audio player built on native browser media APIs.",
  metadataBase: new URL("https://signalplay.local"),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" className={`${display.variable} ${mono.variable}`}><body>{children}</body></html>; }
