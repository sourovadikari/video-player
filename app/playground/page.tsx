"use client";

import Link from "next/link";
import { useState } from "react";
import { MediaPlayer } from "@/components/media-player";

const video = "/media/demo.mp4";
const audio = "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3";

export default function PlaygroundPage() {
  const [type, setType] = useState<"video" | "audio">("video");
  const [headless, setHeadless] = useState(false);
  const [muted, setMuted] = useState(false);
  const [accent, setAccent] = useState("#c8f169");
  const source = type === "video" ? video : audio;
  const code = `<MediaPlayer\n  type="${type}"\n  src="${source}"\n  controls={!${headless}}\n  muted={${muted}}\n  accent="${accent}"\n/>`;
  return <main className="app-shell"><nav className="site-nav inner-nav"><Link className="brand" href="/">signal<span>play</span></Link><div className="nav-links"><Link href="/docs">Docs</Link><Link href="/examples">Examples</Link></div><Link className="nav-cta" href="/">Back home <span>↗</span></Link></nav><section className="tool-header"><span className="section-kicker">Playground / live configuration</span><h1>Shape the player.</h1><p>Change the props, test the browser behavior, and copy the same API your app will use.</p></section><div className="playground-layout"><section className="preview-panel"><div className="panel-top"><span>Preview</span><span className="status-pill"><span className="live-dot" /> live</span></div><MediaPlayer type={type} src={source} controls={!headless} muted={muted} accent={accent} captions={type === "video" ? [{ src: "/demo-captions.vtt", srcLang: "en", label: "English", default: true }] : []} /><div className="preview-meta"><span>{type === "video" ? "Native video" : "Native audio"}</span><span>{headless ? "Headless mode" : "Default controls"}</span></div></section><aside className="config-panel"><div className="panel-top"><span>Configuration</span><span className="mono-label">props</span></div><label className="field-label">Media type<div className="segmented"><button className={type === "video" ? "selected" : ""} onClick={() => setType("video")}>Video</button><button className={type === "audio" ? "selected" : ""} onClick={() => setType("audio")}>Audio</button></div></label><label className="toggle-row"><span>Headless mode</span><input type="checkbox" checked={headless} onChange={(event) => setHeadless(event.target.checked)} /></label><label className="toggle-row"><span>Muted on load</span><input type="checkbox" checked={muted} onChange={(event) => setMuted(event.target.checked)} /></label><label className="field-label">Accent color<div className="color-field"><input type="color" value={accent} onChange={(event) => setAccent(event.target.value)} /><code>{accent}</code></div></label></aside></div><section className="code-panel"><div className="panel-top"><span>Generated React</span><button className="copy-button" onClick={() => void navigator.clipboard?.writeText(code)}>Copy code</button></div><pre><code>{code}</code></pre></section></main>;
}