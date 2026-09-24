import type { Metadata } from "next";

export const metadata: Metadata = { title: "Playground", description: "Configure and test the reusable signalplay Media Player." };

export default function PlaygroundLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
