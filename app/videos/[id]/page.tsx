import Link from "next/link";
import { findVideo, getAdjacentVideos } from "@/lib/playlist";
import { notFound } from "next/navigation";
import { VideoDetailPlayer } from "./VideoDetailPlayer";

export default async function VideoDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const video = findVideo(id);
  if (!video) notFound();
  const { previous, next } = getAdjacentVideos(video.id);
  const trackSummary = [video.captions?.length ? "captions" : "no captions", video.provider === "local" ? "chapters" : undefined].filter(Boolean).join(" · ");
  return <main className="app-shell detail-shell"><nav className="site-nav inner-nav"><Link className="brand" href="/">signal<span>play</span></Link><Link className="nav-cta" href="/">Back home <span>↗</span></Link></nav><div className="detail-content"><span className="section-kicker">Video / {video.id}</span><h1>{video.title}</h1><p className="detail-lede">{video.description}</p><VideoDetailPlayer video={video} previous={previous} next={next} /><div className="detail-meta"><span>{video.mimeType ?? "video"} · {trackSummary} · {previous || next ? "sample playlist" : "single video"}</span><Link className="text-link" href="/playground">Configure this player →</Link></div></div></main>;
}
