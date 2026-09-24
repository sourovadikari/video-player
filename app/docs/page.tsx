import Link from "next/link";

const topics = ["Installation", "Basic usage", "Player props", "Playlist", "Cloudinary videos", "Local videos", "Captions / WebVTT", "Quality", "Picture-in-Picture", "Keyboard controls", "Examples"];

export default function DocsPage() {
  return (
    <main className="app-shell">
      <nav className="site-nav inner-nav">
        <Link className="brand" href="/">signal<span>play</span></Link>
        <div className="nav-links"><Link href="/playground">Playground</Link><Link href="/examples">Examples</Link></div>
        <Link className="nav-cta" href="/">Back home <span>↗</span></Link>
      </nav>
      <div className="docs-layout">
        <aside className="docs-sidebar"><span className="section-kicker">Documentation</span>{topics.map((topic, index) => <a href={`#topic-${index}`} key={topic}>{String(index + 1).padStart(2, "0")} {topic}</a>)}</aside>
        <article className="docs-content">
          <span className="section-kicker">Video player / current API</span>
          <h1>Build around the browser.</h1>
          <p className="docs-intro">MediaPlayer is a reusable HTML5 video component. The host owns playlist state, routing, and metadata; the player owns playback, controls, and browser integrations.</p>
          <section id="topic-0"><h2>Installation</h2><p>This project already includes the component and its Lucide icon dependency. Import it from the local component index.</p><pre><code>{`import { MediaPlayer } from "@/components/media-player";`}</code></pre></section>
          <section id="topic-1"><h2>Basic usage</h2><pre><code>{`<MediaPlayer
  src="/media/demo.mp4"
  controls
  seekStep={10}
/>`}</code></pre></section>
          <section id="topic-2"><h2>Player props</h2><p>Playback props include <code>autoplay</code>, <code>muted</code>, <code>loop</code>, and <code>autoNext</code>. Control visibility is configured with <code>MediaPlayerControls</code>: play, volume, progress, settings, speed, quality, captions, pictureInPicture, fullscreen, previous, and next.</p></section>
          <section id="topic-3"><h2>Playlist</h2><p>Keep playlist records in <code>lib/playlist.ts</code>. Calculate <code>hasPrevious</code> and <code>hasNext</code> from the active index, then update the host state in <code>onPrevious</code> and <code>onNext</code>. The Playground demonstrates this flow.</p></section>
          <section id="topic-4"><h2>Cloudinary videos</h2><p>Use the actual Cloudinary delivery URL in <code>src</code>. The current playlist keeps collection assets as typed records and stores quality transformation URLs in <code>qualities</code>; it never uses the collection page as a video source.</p></section>
          <section id="topic-5"><h2>Local videos</h2><p>Files in <code>public/media</code> are addressed from the site root, for example <code>/media/demo.mp4</code>. They are not prefixed with <code>/public</code>.</p></section>
          <section id="topic-6"><h2>Captions / WebVTT</h2><pre><code>{`captions={[{
  src: "/demo-captions.vtt",
  srcLang: "en",
  language: "en",
  label: "English",
  default: true,
}]}`}</code></pre><p>The CC control appears only after a supplied WebVTT track reports that it loaded successfully.</p></section>
          <section id="topic-7"><h2>Quality</h2><p>Pass real alternate media URLs through <code>quality</code>. The Settings menu hides Quality when no variants are configured and switches the native video source while preserving time and play state.</p></section>
          <section id="topic-8"><h2>Picture-in-Picture</h2><p>PiP uses the browser&apos;s native <code>requestPictureInPicture</code> API. Its button is rendered only when the browser reports support, and enter/leave events keep the active state synchronized.</p></section>
          <section id="topic-9"><h2>Keyboard controls</h2><p>Focus the player and use Space or K for play/pause, Arrow Left/Right for seeking, Arrow Up/Down for volume, M for mute, F for fullscreen, and C for captions. Range inputs remain keyboard-operable.</p></section>
          <section id="topic-10"><h2>Examples</h2><p>Visit <Link className="text-link" href="/examples">Examples</Link> for Cloudinary, local, captions, quality, and playlist playback. Use <Link className="text-link" href="/playground">Playground</Link> to change real player configuration at runtime.</p></section>
        </article>
      </div>
    </main>
  );
}
