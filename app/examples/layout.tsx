import type { Metadata } from "next";

export const metadata: Metadata = { title: "Examples", description: "Working Cloudinary, local, caption, quality, and playlist examples for signalplay." };

export default function ExamplesLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
