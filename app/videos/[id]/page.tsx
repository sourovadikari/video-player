import Link from "next/link";
import { MediaPlayer } from "@/components/media-player";

export default async function VideoDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <main className="app-shell detail-shell"><nav className="site-nav inner-nav"><Link className="brand" href="/">signal<span>play</span></Link><Link className="nav-cta" href="/">Back home <span>↗</span></Link></nav><div className="detail-content"><span className="section-kicker">Video / {id}</span><h1>Flower study</h1><p className="detail-lede">A detail route owns the content context. The player only owns the media.</p><MediaPlayer type="video" src="/media/demo.mp4" captions={[{ src: "/demo-captions.vtt", srcLang: "en", label: "English", default: true }]} chapters={{ src: "/demo-chapters.vtt", srcLang: "en", label: "Chapters", kind: "chapters" }} /><div className="detail-meta"><span>MP4 · captions · chapters</span><Link className="text-link" href="/playground">Configure this player →</Link></div></div></main>;
}