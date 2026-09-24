import type { Metadata } from "next";

export const metadata: Metadata = { title: "Documentation", description: "The typed MediaPlayer API, playlist model, browser integrations, and examples." };

export default function DocsLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
