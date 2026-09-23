"use client";

import Link from "next/link";
import { useState } from "react";
import { MediaPlayer } from "@/components/media-player";

export default function PlaygroundPage() {
  const [headless, setHeadless] = useState(false);
  const [muted, setMuted] = useState(false);
  const [accent, setAccent] = useState("#c8f169");
  const code = `<MediaPlayer\n  src="/media/demo.mp4"\n  controls={!${headless}}\n  muted={${muted}}\n  accent="${accent}"\n/>`;
  return <main className="app-shell"><nav className="site-nav inner-nav"><Link className="brand" href="/">signal<span>play</span></Link><div className="nav-links"><Link href="/docs">Docs</Link><Link href="/examples">Examples</Link></div><Link className="nav-cta" href="/">Back home <span>↗</span></Link></nav><section className="tool-header"><span className="section-kicker">Playground / live configuration</span><h1>Shape the player.</h1><p>Change the props, test browser video behavior, and copy the same API your app will use.</p></section><div className="playground-layout"><section className="preview-panel"><div className="panel-top"><span>Preview</span><span className="status-pill"><span className="live-dot" /> live</span></div><MediaPlayer src="/media/demo.mp4" controls={!headless} muted={muted} accent={accent} captions={[{ src: "/demo-captions.vtt", srcLang: "en", label: "English", default: true }]} /><div className="preview-meta"><span>Native video</span><span>{headless ? "Headless mode" : "Default controls"}</span></div></section><aside className="config-panel"><div className="panel-top"><span>Configuration</span><span className="mono-label">props</span></div><label className="toggle-row"><span>Headless mode</span><input type="checkbox" checked={headless} onChange={(event) => setHeadless(event.target.checked)} /></label><label className="toggle-row"><span>Muted on load</span><input type="checkbox" checked={muted} onChange={(event) => setMuted(event.target.checked)} /></label><label className="field-label">Accent color<div className="color-field"><input type="color" value={accent} onChange={(event) => setAccent(event.target.value)} /><code>{accent}</code></div></label><pre className="code-preview"><code>{code}</code></pre></aside></div></main>;
}
