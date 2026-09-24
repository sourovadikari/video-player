import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/site/SiteNav";
import { findVideo, getAdjacentVideos } from "@/lib/playlist";
import { VideoDetailPlayer } from "./VideoDetailPlayer";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const video = findVideo(id);
  return video ? { title: video.title, description: video.description } : { title: "Video not found" };
}

export default async function VideoDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const video = findVideo(id);
  if (!video) notFound();
  const { previous, next } = getAdjacentVideos(video.id);
  const trackSummary = [video.captions?.length ? "captions" : "no captions", video.qualities?.length ? "quality" : undefined, video.provider === "local" ? "chapters" : undefined].filter(Boolean).join(" · ");
  return <main className="app-shell detail-shell"><SiteNav /><div className="detail-content"><span className="section-kicker">Video / {video.provider}</span><h1>{video.title}</h1><p className="detail-lede">{video.description}</p><VideoDetailPlayer video={video} previous={previous} next={next} /><div className="detail-meta"><span>{video.mimeType ?? "video"} · {trackSummary} · {previous || next ? "playlist" : "single video"}</span><Link className="text-link" href="/videos">Back to gallery →</Link></div></div></main>;
}
