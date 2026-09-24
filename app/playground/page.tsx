"use client";

import { useMemo, useState } from "react";
import { MediaPlayer } from "@/components/media-player";
import { SiteNav } from "@/components/site/SiteNav";
import { PLAYLIST } from "@/lib/playlist";
import type { MediaPlayerControls } from "@/types/media-player";

const SKIP_PRESETS = [5, 10, 15, 30];

type ControlKey = keyof MediaPlayerControls;
const CONTROL_TOGGLES: { key: ControlKey; label: string }[] = [
  { key: "playPause", label: "Play / Pause" },
  { key: "previous", label: "Previous Video" },
  { key: "next", label: "Next Video" },
  { key: "volume", label: "Volume (desktop only)" },
  { key: "progress", label: "Progress" },
  { key: "settings", label: "Settings menu" },
  { key: "speed", label: "Playback speed (in Settings)" },
  { key: "quality", label: "Quality (in Settings)" },
  { key: "captions", label: "Captions / CC" },
  { key: "pictureInPicture", label: "Picture-in-Picture" },
  { key: "fullscreen", label: "Fullscreen" },
];

export default function PlaygroundPage() {
  const [headless, setHeadless] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [muted, setMuted] = useState(false);
  const [loop, setLoop] = useState(false);
  const [autoNext, setAutoNext] = useState(false);
  const [accent, setAccent] = useState("#c8f169");
  const [doubleTapSeek, setDoubleTapSeek] = useState(true);
  const [seekStep, setSeekStep] = useState(10);
  const [landscapeOnFullscreen, setLandscapeOnFullscreen] = useState(true);
  const [playlistEnabled, setPlaylistEnabled] = useState(true);
  const [videoIndex, setVideoIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [controls, setControls] = useState<Required<MediaPlayerControls>>({
    play: true, playPause: true, seek: true, previous: true, next: true, volume: true, progress: true,
    settings: true, speed: true, quality: true, captions: true, pictureInPicture: true, fullscreen: true,
  });

  const toggleControl = (key: ControlKey) => setControls((current) => ({ ...current, [key]: !current[key] }));
  const video = PLAYLIST[videoIndex];
  const hasPrevious = playlistEnabled && videoIndex > 0;
  const hasNext = playlistEnabled && videoIndex < PLAYLIST.length - 1;

  const code = useMemo(() => {
    const controlsProp = headless
      ? "false"
      : `{{ ${Object.entries(controls).filter(([, value]) => !value).map(([key]) => `${key}: false`).join(", ") || "/* all controls on */ "}}}`;
    const lines = [
      "<MediaPlayer",
      `  src="${video.src}"`,
      `  controls={${controlsProp}}`,
      autoplay ? "  autoplay" : "",
      muted ? "  muted" : "",
      loop ? "  loop" : "",
      autoNext ? "  autoNext" : "",
      `  seekStep={${seekStep}}`,
      doubleTapSeek ? "" : "  doubleTapSeek={false}",
      landscapeOnFullscreen ? "" : "  landscapeOnFullscreen={false}",
      playlistEnabled ? `  hasPrevious={${hasPrevious}} hasNext={${hasNext}}` : "",
      playlistEnabled ? "  onPrevious={handlePrevious} onNext={handleNext}" : "",
      `  accent="${accent}"`,
      "/>",
    ].filter(Boolean);
    return lines.join("\n");
  }, [headless, controls, autoplay, muted, loop, autoNext, seekStep, doubleTapSeek, landscapeOnFullscreen, playlistEnabled, accent, video.src, hasPrevious, hasNext]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="app-shell">
      <SiteNav />
      <section className="tool-header">
        <span className="section-kicker">Playground / live configuration</span>
        <h1>Shape the player.</h1>
        <p>Every toggle below sets a real prop on the component rendered to the left — nothing here is cosmetic-only.</p>
      </section>
      <div className="playground-layout">
        <section className="preview-panel">
          <div className="panel-top"><span>Preview</span><span className="status-pill"><span className="live-dot" /> live</span></div>
          <MediaPlayer
            key={`${video.id}-${headless}`}
            src={video.src}
            captions={video.captions}
            quality={video.qualities}
            controls={headless ? false : controls}
            autoplay={autoplay}
            muted={muted}
            loop={loop}
            autoNext={autoNext}
            accent={accent}
            seekStep={seekStep}
            doubleTapSeek={doubleTapSeek}
            landscapeOnFullscreen={landscapeOnFullscreen}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            onPrevious={playlistEnabled ? () => setVideoIndex((index) => Math.max(0, index - 1)) : undefined}
            onNext={playlistEnabled ? () => setVideoIndex((index) => Math.min(PLAYLIST.length - 1, index + 1)) : undefined}
          />
          <div className="preview-meta">
            <span>{video.title}</span>
            <span>{headless ? "Headless mode" : "Default controls"}</span>
          </div>
          {playlistEnabled && (
            <div className="playlist-rail" aria-label="Video playlist">
              {PLAYLIST.map((item, index) => (
                <button type="button" key={item.id} className={`playlist-item ${index === videoIndex ? "selected" : ""}`} onClick={() => setVideoIndex(index)} aria-current={index === videoIndex ? "true" : undefined}>
                  <span className="playlist-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="playlist-copy"><strong>{item.title}</strong><small>{item.provider}</small></span>
                </button>
              ))}
            </div>
          )}
        </section>
        <aside className="config-panel">
          <div className="panel-top"><span>Configuration</span><span className="mono-label">props</span></div>

          <span className="field-label">Playback</span>
          <label className="toggle-row"><span>Autoplay</span><input type="checkbox" checked={autoplay} onChange={(event) => setAutoplay(event.target.checked)} /></label>
          <label className="toggle-row"><span>Muted on load</span><input type="checkbox" checked={muted} onChange={(event) => setMuted(event.target.checked)} /></label>
          <label className="toggle-row"><span>Loop</span><input type="checkbox" checked={loop} onChange={(event) => setLoop(event.target.checked)} /></label>
          <label className="toggle-row"><span>Auto Next</span><input type="checkbox" checked={autoNext} onChange={(event) => setAutoNext(event.target.checked)} /></label>
          <label className="toggle-row"><span>Headless (no UI at all)</span><input type="checkbox" checked={headless} onChange={(event) => setHeadless(event.target.checked)} /></label>

          <span className="field-label">Controls shown{headless ? " (n/a — headless)" : ""}</span>
          <div className={`toggle-grid ${headless ? "is-disabled" : ""}`}>
            {CONTROL_TOGGLES.map(({ key, label }) => (
              <label className="toggle-row" key={key}>
                <span>{label}</span>
                <input type="checkbox" disabled={headless} checked={controls[key]} onChange={() => toggleControl(key)} />
              </label>
            ))}
          </div>

          <span className="field-label">Navigation</span>
          <label className="toggle-row"><span>Demo playlist (Previous / Next Video)</span><input type="checkbox" checked={playlistEnabled} onChange={(event) => { setPlaylistEnabled(event.target.checked); setVideoIndex(0); }} /></label>

          <span className="field-label">Seeking</span>
          <label className="toggle-row"><span>Enable double-tap / double-click seek</span><input type="checkbox" checked={doubleTapSeek} onChange={(event) => setDoubleTapSeek(event.target.checked)} /></label>
          <div className="segmented">
            {SKIP_PRESETS.map((amount) => (
              <button type="button" key={amount} className={seekStep === amount ? "selected" : ""} onClick={() => setSeekStep(amount)}>{amount}s</button>
            ))}
          </div>

          <span className="field-label">Fullscreen</span>
          <label className="toggle-row"><span>Attempt landscape lock on mobile</span><input type="checkbox" checked={landscapeOnFullscreen} onChange={(event) => setLandscapeOnFullscreen(event.target.checked)} /></label>

          <label className="field-label">Accent color
            <div className="color-field">
              <input type="color" value={accent} onChange={(event) => setAccent(event.target.value)} />
              <code>{accent}</code>
            </div>
          </label>

          <div className="panel-top copy-row">
            <span className="mono-label">Code</span>
            <button type="button" className="copy-button" onClick={() => void copyCode()}>{copied ? "Copied" : "Copy"}</button>
          </div>
          <pre className="code-preview"><code>{code}</code></pre>
        </aside>
      </div>
    </main>
  );
}
