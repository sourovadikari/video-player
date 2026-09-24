"use client";

import Link from "next/link";
import { useState } from "react";
import { MediaPlayer } from "@/components/media-player";
import { PLAYLIST } from "@/lib/playlist";

export default function ExamplesPage() {
  const [index, setIndex] = useState(0);
  const video = PLAYLIST[index];
  return <main className="app-shell"><nav className="site-nav inner-nav"><Link className="brand" href="/">signal<span>play</span></Link><div className="nav-links"><Link href="/playground">Playground</Link><Link href="/docs">Docs</Link></div><Link className="nav-cta" href="/">Back home <span>↗</span></Link></nav><section className="tool-header"><span className="section-kicker">Examples / working compositions</span><h1>Small patterns, real playback.</h1><p>These examples use the same native video player with Cloudinary delivery, local media, captions, quality sources, and playlist navigation.</p></section><div className="example-grid"><article className="example-card"><span className="section-kicker">01 / playlist playback</span><h2>{video.title}</h2><MediaPlayer key={video.id} src={video.src} poster={video.thumbnail} captions={video.captions} quality={video.qualities} seekStep={10} hasPrevious={index > 0} hasNext={index < PLAYLIST.length - 1} onPrevious={() => setIndex((current) => Math.max(0, current - 1))} onNext={() => setIndex((current) => Math.min(PLAYLIST.length - 1, current + 1))} /><div className="preview-meta"><span>{video.provider}</span><span>{video.qualities?.length ? "quality variants" : "local source"}</span></div><Link className="text-link" href={`/videos/${video.id}`}>Open detail →</Link></article><article className="example-card"><span className="section-kicker">02 / local captions</span><h2>WebVTT and focused controls</h2><MediaPlayer src="/media/demo.mp4" captions={PLAYLIST[2].captions} controls={{ previous: false, next: false, quality: false, pictureInPicture: false }} /><p>Captions appear only after the real WebVTT track loads. Quality and PiP remain capability-driven.</p><Link className="text-link" href="/playground">Configure it →</Link></article></div></main>;
}
