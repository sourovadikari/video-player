"use client";

import Link from "next/link";
import { useState } from "react";
import { MediaPlayer } from "@/components/media-player";
import { SiteNav } from "@/components/site/SiteNav";
import { PLAYLIST } from "@/lib/playlist";

const cloudinarySource = PLAYLIST[1];
const localSource = PLAYLIST[2];

export default function ExamplesPage() {
  const [index, setIndex] = useState(0);
  const video = PLAYLIST[index];
  return <main className="app-shell"><SiteNav /><section className="tool-header"><span className="section-kicker">Examples / real compositions</span><h1>Small patterns, real playback.</h1><p>Every example uses the same reusable native video player with typed application data around it.</p></section><div className="example-grid"><article className="example-card"><span className="section-kicker">01 / playlist</span><h2>{video.title}</h2><MediaPlayer key={video.id} src={video.src} poster={video.thumbnail} captions={video.captions} quality={video.qualities} seekStep={10} autoNext hasPrevious={index > 0} hasNext={index < PLAYLIST.length - 1} onPrevious={() => setIndex((current) => Math.max(0, current - 1))} onNext={() => setIndex((current) => Math.min(PLAYLIST.length - 1, current + 1))} /><div className="preview-meta"><span>{video.provider}</span><span>{video.qualities?.length ? "quality variants" : "WebVTT captions"}</span></div><Link className="text-link" href={`/videos/${video.id}`}>Open detail →</Link></article><article className="example-card"><span className="section-kicker">02 / focused source examples</span><h2>Cloudinary delivery</h2><MediaPlayer src={cloudinarySource.src} poster={cloudinarySource.thumbnail} quality={cloudinarySource.qualities} controls={{ previous: false, next: false }} /><h2>Local captions</h2><MediaPlayer src={localSource.src} captions={localSource.captions} controls={{ previous: false, next: false, quality: false }} /><Link className="text-link" href="/playground">Configure every option →</Link></article></div><section className="code-band examples-code"><div><span className="section-kicker">03 / API shape</span><h2>Application state stays outside.</h2></div><pre><code>{`<MediaPlayer
  src={video.src}
  captions={video.captions}
  quality={video.qualities}
  hasPrevious={index > 0}
  onNext={() => setIndex(index + 1)}
/>`}</code></pre></section></main>;
}
