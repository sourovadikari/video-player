import type { Metadata } from "next";
import Link from "next/link";
import { MediaPlayer } from "@/components/media-player";
import { SiteNav } from "@/components/site/SiteNav";

export const metadata: Metadata = {
  title: "Reusable Video Player for the Web",
  description: "A typed, accessible HTML5 video player for Cloudinary, local media, captions, playlists, and browser controls.",
};

const captions = [{ src: "/demo-captions.vtt", srcLang: "en", label: "English", default: true }];
const features = ["Cloudinary and local sources", "Playlist navigation", "Captions and quality", "Picture-in-Picture and fullscreen", "Keyboard-accessible controls", "Responsive and headless modes"];

export default function Home() {
  return (
    <main>
      <section className="hero-shell"><SiteNav hero /><div className="hero-grid"><div className="hero-copy"><p className="eyebrow">React video infrastructure</p><h1>Playback that stays <em>out of your way.</em></h1><p className="hero-lede">A focused, reusable Media Player for teams who want a polished video experience without rebuilding the browser.</p><div className="hero-actions"><Link className="button button-primary" href="/videos">Explore videos <span>→</span></Link><Link className="text-link" href="/docs">Read the docs <span>↗</span></Link></div><div className="hero-notes"><span>native HTMLVideoElement</span><span>typed API</span><span>no backend required</span></div></div><div className="hero-player-wrap"><div className="player-label"><span className="live-dot" /> interactive preview <span>local demo</span></div><MediaPlayer src="/media/demo.mp4" captions={captions} /></div></div></section>
      <section className="signal-band"><div><span className="section-kicker">01 / Reusable by design</span><h2>One player. A clear boundary.</h2></div><p>The application owns routes, metadata, and playlists. MediaPlayer owns playback, controls, state, and browser APIs.</p></section>
      <section className="feature-section"><div className="section-heading"><span className="section-kicker">02 / Platform features</span><h2>Everything close to the metal.</h2></div><div className="feature-grid">{features.map((feature, index) => <article key={feature}><span className="feature-index">{String.fromCharCode(65 + index)}</span><h3>{feature}</h3><p>Real browser-backed behavior with graceful capability detection and a compact, configurable interface.</p></article>)}</div></section>
      <section className="code-band"><div><span className="section-kicker">03 / Start small</span><h2>Bring your own source.</h2></div><pre><code>{`<MediaPlayer
  src="https://res.cloudinary.com/dddgc0vaq/video/upload/v1790228341/pejn3wrjkaosd2yiiidi.mp4?_s=public-apps"
  controls
  seekStep={10}
  accent="#c8f169"
/>`}</code></pre></section>
      <section className="final-cta"><span className="section-kicker">04 / Build with it</span><h2>See the player in context.</h2><div className="hero-actions"><Link className="button button-primary" href="/playground">Open playground <span>→</span></Link><Link className="text-link" href="/examples">View examples <span>↗</span></Link><Link className="text-link" href="/docs">Documentation <span>↗</span></Link></div></section>
    </main>
  );
}
