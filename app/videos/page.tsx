import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteNav } from "@/components/site/SiteNav";
import { PLAYLIST } from "@/lib/playlist";

export const metadata: Metadata = {
  title: "Video Gallery",
  description: "Browse Cloudinary and local videos powered by the reusable signalplay Media Player.",
};

export default function VideosPage() {
  return (
    <main className="app-shell">
      <SiteNav />
      <section className="gallery-header"><span className="section-kicker">Video gallery / {PLAYLIST.length} sources</span><h1>Choose a video.</h1><p>Open a dedicated player page for each source. The gallery stays lightweight; playback happens on the detail route.</p></section>
      <section className="video-gallery" aria-label="Video gallery">
        {PLAYLIST.map((video) => (
          <article className="video-card" key={video.id}>
            <Link className="video-card-media" href={`/videos/${video.id}`} aria-label={`Play ${video.title}`}>
              {video.thumbnail ? <Image src={video.thumbnail} alt="" fill sizes="(max-width: 800px) 100vw, 33vw" /> : <span className="video-card-placeholder" aria-hidden="true">MP4</span>}
              <span className="video-card-play" aria-hidden="true">Play</span>
            </Link>
            <div className="video-card-body"><div className="video-card-meta"><span>{video.provider}</span>{video.duration ? <span>{Math.round(video.duration)} sec</span> : null}</div><h2>{video.title}</h2><p>{video.description}</p><Link className="text-link" href={`/videos/${video.id}`}>Open video <span>↗</span></Link></div>
          </article>
        ))}
      </section>
    </main>
  );
}
