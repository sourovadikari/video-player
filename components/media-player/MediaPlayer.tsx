"use client";

import { ArrowLeft, Captions, Check, ChevronRight, ChevronsLeft, ChevronsRight, Gauge, Maximize, Minimize, Pause, PictureInPicture2, Play, Settings, SkipBack, SkipForward, SlidersHorizontal, Volume1, Volume2, VolumeX, X } from "lucide-react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import type { MediaPlayerControls, MediaPlayerError, MediaPlayerProps, MediaPlayerRef, MediaPlayerState, MediaSource, MediaTrack } from "@/types/media-player";

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const DEFAULT_QUALITY = "Default";
const HIDE_DELAY = 2800;
const TOUCH_QUERY = "(hover: none) and (pointer: coarse)";
const ICON_DESKTOP = 18; // visual icon size only; the button hit area stays 40px
const ICON_TOUCH = 20;
const ICON_MENU = 16;

type LockableOrientation = ScreenOrientation & { lock?: (orientation: "landscape") => Promise<void>; unlock?: () => void };
type Drag = "seek" | "volume" | null;

const sourceValue = (source: MediaSource) => (typeof source === "string" ? source : source.src);
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
const safeDuration = (value: number) => (Number.isFinite(value) && value > 0 ? value : 0);
const formatRate = (rate: number) => `${rate}x`;
const isEditable = (target: EventTarget | null) => target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
const isButton = (target: EventTarget | null) => target instanceof HTMLElement && Boolean(target.closest("button"));

function formatTime(value: number) {
  const total = Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = (total % 60).toString().padStart(2, "0");
  return hours > 0 ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds}` : `${minutes}:${seconds}`;
}

/** End of the buffered range that contains `time`; falls back to `time` when nothing is buffered there. */
function bufferedEnd(media: HTMLVideoElement, time: number) {
  const ranges = media.buffered;
  for (let index = 0; index < ranges.length; index += 1) if (ranges.start(index) <= time + 0.5 && ranges.end(index) >= time) return ranges.end(index);
  return time;
}

const subscribeTouch = (notify: () => void) => { const query = window.matchMedia(TOUCH_QUERY); query.addEventListener("change", notify); return () => query.removeEventListener("change", notify); };
const useIsTouch = () => useSyncExternalStore(subscribeTouch, () => window.matchMedia(TOUCH_QUERY).matches, () => false);
const noopSubscribe = () => () => undefined;
const usePictureInPictureSupport = () => useSyncExternalStore(noopSubscribe, () => Boolean(document.pictureInPictureEnabled), () => false);

function IconButton({ label, onClick, active = false, disabled = false, className = "", children }: { label: string; onClick: () => void; active?: boolean; disabled?: boolean; className?: string; children: ReactNode }) {
  return <button type="button" className={`player-button ${active ? "is-active" : ""} ${className}`} onClick={onClick} disabled={disabled} aria-label={label} title={label}>{children}</button>;
}

/** Reports whether a caption file really loaded, so CC only renders for captions that exist. */
function CaptionTrack({ track, onStatus }: { track: MediaTrack; onStatus: (src: string, ok: boolean) => void }) {
  const ref = useRef<HTMLTrackElement>(null);
  const { src, srcLang, label, kind = "subtitles" } = track;
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const loaded = () => onStatus(src, true);
    const failed = () => onStatus(src, false);
    element.addEventListener("load", loaded);
    element.addEventListener("error", failed);
    if (element.readyState === 2) loaded();
    else if (element.readyState === 3) failed();
    return () => { element.removeEventListener("load", loaded); element.removeEventListener("error", failed); };
  }, [src, onStatus]);
  return <track ref={ref} src={src} srcLang={srcLang ?? track.language ?? "en"} label={label} kind={kind} />;
}

export const MediaPlayer = forwardRef<MediaPlayerRef, MediaPlayerProps>(function MediaPlayer({
  src, poster, preload = "metadata", autoplay = false, muted = false, loop = false, autoNext = false, controls = true, captions = [], chapters, quality = [], playbackRate = true, playbackRates = PLAYBACK_RATES, seekStep = 10, keyboardShortcuts = true, doubleTapSeek = true, landscapeOnFullscreen = true, hasPrevious = false, hasNext = false, onPrevious, onNext, mediaSession, className = "", accent = "#ff0033", onPlay, onPause, onEnded, onTimeUpdate, onProgress, onLoadedMetadata, onWaiting, onPlaying, onVolumeChange, onRateChange, onFullscreenChange, onError, onQualityChange, onCaptionChange, onSeek,
}, ref) {
  const mediaRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | undefined>(undefined);
  const feedbackTimer = useRef<number | undefined>(undefined);
  const holdRef = useRef(false);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const ignoreTapUntil = useRef(0);
  const hideAnchor = useRef<{ x: number; y: number } | null>(null);
  const lastPointer = useRef<{ x: number; y: number } | null>(null);
  const previousVolume = useRef(1);
  const resumeRef = useRef<{ time: number; playing: boolean } | null>(null);
  const tapRef = useRef<{ time: number; x: number; chainUntil: number; side: "back" | "forward" | null }>({ time: 0, x: 0, chainUntil: 0, side: null });
  const latest = useRef({ onFullscreenChange, onCaptionChange, onSeek, onQualityChange, onProgress, onTimeUpdate });
  const isTouch = useIsTouch();
  const pictureInPictureSupported = usePictureInPictureSupport();
  const touchRef = useRef(isTouch);
  const landscapeRef = useRef(landscapeOnFullscreen);
  useEffect(() => { landscapeRef.current = landscapeOnFullscreen; }, [landscapeOnFullscreen]);

  const sourceKey = sourceValue(src);
  const [state, setState] = useState<MediaPlayerState>({ playing: false, currentTime: 0, duration: 0, volume: 1, muted, buffered: 0, buffering: false, fullscreen: false, pictureInPicture: false, playbackRate: 1, quality: quality.length > 0 ? DEFAULT_QUALITY : undefined, captionsEnabled: captions.some((track) => track.default), controlsVisible: true });
  const [menu, setMenu] = useState<"main" | "speed" | "quality" | null>(null);
  const [dragging, setDragging] = useState<Drag>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [started, setStarted] = useState(false);
  const [userHidden, setUserHidden] = useState(false);
  const [qualityLabel, setQualityLabel] = useState(DEFAULT_QUALITY);
  const [seekFeedback, setSeekFeedback] = useState<{ side: "back" | "forward"; id: number } | null>(null);
  const [notice, setNotice] = useState("");
  const [captionStatus, setCaptionStatus] = useState<Record<string, boolean>>({});

  const patch = useCallback((next: Partial<MediaPlayerState>) => setState((current) => (Object.keys(next) as (keyof MediaPlayerState)[]).some((key) => !Object.is(current[key], next[key])) ? { ...current, ...next } : current), []);

  // Quality is only offered when the caller supplies REAL alternative sources. A single MP4 has exactly one
  // encoded resolution, so listing 360p/720p/1080p for it would be fake; real switching needs several files or HLS/DASH.
  const hasQuality = quality.length > 0;
  const speedOptions = playbackRate ? playbackRates : [];
  const readyCaptions = captions.filter((track) => captionStatus[track.src] === true);
  const overrides: MediaPlayerControls = typeof controls === "object" ? controls : {};
  // "Show Playback speed" / "Show Quality" gate the individual settings rows; the Settings button itself
  // only appears when at least one of those rows would actually have something to show.
  const showSpeed = (overrides.speed ?? true) && speedOptions.length > 0;
  const showQuality = (overrides.quality ?? true) && hasQuality;
  const config: Required<MediaPlayerControls> = {
    play: overrides.play ?? true,
    volume: (overrides.volume ?? true) && !isTouch,
    progress: overrides.progress ?? true,
    captions: (overrides.captions ?? true) && readyCaptions.length > 0,
    settings: (overrides.settings ?? true) && (showSpeed || showQuality),
    speed: showSpeed,
    quality: showQuality,
    fullscreen: overrides.fullscreen ?? true,
    pictureInPicture: (overrides.pictureInPicture ?? true) && pictureInPictureSupported && !isTouch,
    // Previous/Next are never faked: they only appear when the caller actually wires up a playlist.
    previous: (overrides.previous ?? true) && Boolean(onPrevious),
    next: (overrides.next ?? true) && Boolean(onNext),
  };
  const hasControls = controls !== false;
  const activeSource = qualityLabel === DEFAULT_QUALITY ? src : quality.find((item) => item.label === qualityLabel)?.src ?? src;
  const strongHold = menu !== null || dragging !== null || Boolean(state.error); // always visible, cannot be toggled off
  const hold = !state.playing || strongHold; // blocks AUTO-hide (paused also keeps controls up)
  const controlsVisible = strongHold || (!userHidden && (hold || state.controlsVisible));
  const loading = !state.error && (!hasLoaded || state.buffering);

  useEffect(() => { latest.current = { onFullscreenChange, onCaptionChange, onSeek, onQualityChange, onProgress, onTimeUpdate }; });
  useEffect(() => { touchRef.current = isTouch; }, [isTouch]);
  useEffect(() => { holdRef.current = hold; }, [hold]);

  // ---- controls auto-hide (one timer, no state churn on every pointer move) ----
  const clearHideTimer = () => { if (hideTimer.current) window.clearTimeout(hideTimer.current); hideTimer.current = undefined; };
  const scheduleHide = useCallback(() => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => { if (!holdRef.current) patch({ controlsVisible: false }); }, HIDE_DELAY);
  }, [patch]);
  const wake = useCallback(() => { hideAnchor.current = null; setUserHidden(false); patch({ controlsVisible: true }); scheduleHide(); }, [patch, scheduleHide]);
  useEffect(() => () => { clearHideTimer(); if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current); }, []);
  const changeMenu = useCallback((next: "main" | "speed" | "quality" | null) => { setMenu(next); wake(); }, [wake]);

  // ---- media -> state (one function feeds every time/buffer event) ----
  const syncMedia = (force = false) => {
    const media = mediaRef.current;
    if (!media || (dragging === "seek" && !force)) return;
    const duration = safeDuration(media.duration);
    const currentTime = duration > 0 ? clamp(media.currentTime, 0, duration) : clamp(media.currentTime, 0, Number.MAX_SAFE_INTEGER);
    const buffered = duration > 0 ? clamp(bufferedEnd(media, currentTime) / duration, 0, 1) : 0;
    patch({ currentTime, duration, buffered });
  };

  // ---- imperative API ----
  const play = async () => {
    try { await mediaRef.current?.play(); } catch (error) {
      const name = error instanceof DOMException ? error.name : "";
      if (name === "AbortError") return; // interrupted by pause()/load(): not a failure
      if (name === "NotAllowedError") { setNotice("Playback was blocked by the browser."); return; }
      raiseError({ message: error instanceof Error ? error.message : "Playback failed." });
    }
  };
  const pause = () => mediaRef.current?.pause();
  const togglePlay = () => (mediaRef.current?.paused ? play() : (pause(), Promise.resolve()));
  const seek = (time: number) => {
    const media = mediaRef.current;
    if (!media) return;
    const duration = safeDuration(media.duration);
    const next = duration > 0 ? clamp(time, 0, duration) : clamp(time, 0, Number.MAX_SAFE_INTEGER);
    media.currentTime = next;
    patch({ currentTime: next });
    latest.current.onSeek?.(next);
  };
  const seekBy = (delta: number) => seek((mediaRef.current?.currentTime ?? 0) + delta);
  const setVolume = (volume: number) => { const media = mediaRef.current; if (!media) return; const next = clamp(volume, 0, 1); if (next > 0) previousVolume.current = next; media.volume = next; media.muted = next === 0; };
  const toggleMute = () => { const media = mediaRef.current; if (!media) return; if (media.muted || media.volume === 0) { media.volume = previousVolume.current || 1; media.muted = false; } else { previousVolume.current = media.volume; media.muted = true; } };
  const setPlaybackRate = (rate: number) => { const media = mediaRef.current; if (!media) return; media.defaultPlaybackRate = rate; media.playbackRate = rate; }; // defaultPlaybackRate survives load()/source switches
  const requestFullscreen = async () => {
    const player = playerRef.current;
    const video = mediaRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    try {
      if (player?.requestFullscreen) await player.requestFullscreen();
      else if (video?.webkitEnterFullscreen) video.webkitEnterFullscreen(); // iOS Safari: only the <video> can go fullscreen
      else setNotice("Fullscreen is not supported in this browser.");
    } catch { setNotice("Fullscreen could not be started in this browser."); }
  };
  const exitFullscreen = async () => { if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined); };
  const enterPictureInPicture = async () => { try { await mediaRef.current?.requestPictureInPicture(); } catch { setNotice("Picture-in-Picture is not available."); } };
  const exitPictureInPicture = async () => { if (document.pictureInPictureElement) await document.exitPictureInPicture().catch(() => undefined); };
  useImperativeHandle(ref, () => ({ play, pause, togglePlay, seek, setVolume, toggleMute, setPlaybackRate, requestFullscreen, exitFullscreen, enterPictureInPicture, exitPictureInPicture, getState: () => ({ ...state, controlsVisible }) }));

  function raiseError(error: MediaPlayerError) { setHasLoaded(true); patch({ error, buffering: false, playing: false }); onError?.(error); }

  // ---- fullscreen: orientation lock/unlock is tied to the real fullscreenchange, so Esc / back gesture also unlock ----
  useEffect(() => {
    const onChange = () => {
      const fullscreen = document.fullscreenElement === playerRef.current;
      patch({ fullscreen });
      latest.current.onFullscreenChange?.(fullscreen);
      const orientation = screen.orientation as LockableOrientation | undefined;
      try {
        if (fullscreen && touchRef.current && landscapeRef.current) void orientation?.lock?.("landscape")?.catch(() => undefined);
        else if (!fullscreen) orientation?.unlock?.();
      } catch { /* Orientation lock is unsupported (desktop, iOS). Fullscreen still works. */ }
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [patch]);

  // ---- keep the desktop settings menu inside small players (CSS cannot read the player's own height) ----
  useEffect(() => {
    const player = playerRef.current;
    if (!player || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => player.style.setProperty("--player-h", `${entry.contentRect.height}px`));
    observer.observe(player);
    return () => observer.disconnect();
  }, []);

  // ---- picture-in-picture state ----
  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;
    const enter = () => patch({ pictureInPicture: true });
    const leave = () => patch({ pictureInPicture: false });
    media.addEventListener("enterpictureinpicture", enter);
    media.addEventListener("leavepictureinpicture", leave);
    return () => { media.removeEventListener("enterpictureinpicture", enter); media.removeEventListener("leavepictureinpicture", leave); };
  }, [patch]);

  // ---- media session ----
  useEffect(() => {
    if (!mediaSession || !("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata(mediaSession);
    const actions: MediaSessionAction[] = ["play", "pause", "seekbackward", "seekforward"];
    const handlers: Record<string, () => void> = { play: () => void mediaRef.current?.play(), pause: () => mediaRef.current?.pause(), seekbackward: () => seekBy(-seekStep), seekforward: () => seekBy(seekStep) };
    actions.forEach((action) => { try { navigator.mediaSession.setActionHandler(action, handlers[action]); } catch { /* Unsupported action. */ } });
    return () => actions.forEach((action) => { try { navigator.mediaSession.setActionHandler(action, null); } catch { /* Unsupported action. */ } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaSession, seekStep]);

  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(""), 2600); return () => window.clearTimeout(timer); }, [notice]);

  // ---- captions: apply the enabled state to the real TextTracks (also starts the fetch, so load/error can be reported) ----
  const captionsKey = captions.map((track) => track.src).join("|");
  useEffect(() => {
    const tracks = mediaRef.current?.textTracks;
    if (!tracks) return;
    const activeIndex = Math.max(0, captions.findIndex((track) => track.default));
    let subtitleIndex = 0;
    for (let index = 0; index < tracks.length; index += 1) {
      if (tracks[index].kind === "chapters") continue;
      tracks[index].mode = state.captionsEnabled && subtitleIndex === activeIndex ? "showing" : "hidden";
      subtitleIndex += 1;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.captionsEnabled, captionsKey, sourceKey]);
  const onCaptionStatus = useCallback((trackSrc: string, ok: boolean) => setCaptionStatus((current) => (current[trackSrc] === ok ? current : { ...current, [trackSrc]: ok })), []);
  const toggleCaptions = () => { if (readyCaptions.length === 0) return; const enabled = !state.captionsEnabled; patch({ captionsEnabled: enabled }); latest.current.onCaptionChange?.(enabled); };

  // ---- menus close on outside pointer / Escape ----
  useEffect(() => {
    if (menu === null) return;
    const onPointerDown = (event: globalThis.PointerEvent) => { if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) { if (event.target === surfaceRef.current) ignoreTapUntil.current = performance.now() + 800; changeMenu(null); } };
    const onKeyDown = (event: globalThis.KeyboardEvent) => { if (event.key === "Escape") changeMenu(null); };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("pointerdown", onPointerDown); document.removeEventListener("keydown", onKeyDown); };
  }, [menu, changeMenu]);

  // ---- drag (progress / volume): released anywhere ----
  useEffect(() => {
    if (!dragging) return;
    const end = () => { setDragging(null); wake(); requestAnimationFrame(() => syncMedia(true)); };
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => { window.removeEventListener("pointerup", end); window.removeEventListener("pointercancel", end); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, wake]);

  // ---- quality: switch to a REAL alternative source, keep position and play state ----
  const switchQuality = (label: string) => {
    const media = mediaRef.current;
    if (!media || label === qualityLabel) { changeMenu(null); return; }
    resumeRef.current = { time: media.currentTime, playing: !media.paused };
    setQualityLabel(label);
    patch({ quality: label, buffering: true });
    latest.current.onQualityChange?.(label);
    changeMenu(null);
  };

  // ---- double tap / double click (touch + mouse, on the dedicated surface, so controls can never trigger it) ----
  const skip = (side: "back" | "forward") => {
    seekBy(side === "forward" ? seekStep : -seekStep);
    setSeekFeedback({ side, id: Date.now() });
    if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setSeekFeedback(null), 700);
  };
  // Video surface: toggles control visibility ONLY. It never plays or pauses.
  const toggleControls = (x: number, y: number) => {
    if (!controlsVisible) { wake(); return; }
    if (strongHold) return;
    clearHideTimer();
    hideAnchor.current = { x, y }; // desktop: ignore tiny mouse jitter so the hide sticks until the pointer really moves
    setUserHidden(true);
    patch({ controlsVisible: false });
  };
  const onSurfacePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (performance.now() < ignoreTapUntil.current) return; // this press only closed a menu
    if (!doubleTapSeek) { toggleControls(event.clientX, event.clientY); return; }
    const bounds = event.currentTarget.getBoundingClientRect();
    const side = event.clientX < bounds.left + bounds.width / 2 ? "back" : "forward";
    const now = performance.now();
    const tap = tapRef.current;
    const isDouble = (now - tap.time < 300 && Math.abs(event.clientX - tap.x) < 80) || (now < tap.chainUntil && side === tap.side);
    if (isDouble) { skip(side); wake(); tap.chainUntil = now + 500; tap.side = side; tap.time = 0; } else { tap.time = now; tap.x = event.clientX; toggleControls(event.clientX, event.clientY); }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!keyboardShortcuts || isEditable(event.target)) return;
    const key = event.key.toLowerCase();
    if ((event.key === " " || key === "k") && !isButton(event.target)) { event.preventDefault(); void togglePlay(); }
    else if (event.key === "ArrowLeft") seekBy(-seekStep);
    else if (event.key === "ArrowRight") seekBy(seekStep);
    else if (event.key === "ArrowUp") { event.preventDefault(); setVolume((mediaRef.current?.volume ?? 1) + 0.05); }
    else if (event.key === "ArrowDown") { event.preventDefault(); setVolume((mediaRef.current?.volume ?? 1) - 0.05); }
    else if (key === "m") toggleMute();
    else if (key === "f") void (state.fullscreen ? exitFullscreen() : requestFullscreen());
    else if (key === "c" && readyCaptions.length) toggleCaptions();
    wake();
  };

  // ---- <video> events ----
  const mediaEvents = {
    onPlay: () => { setHasLoaded(true); setStarted(true); patch({ playing: true, buffering: false }); wake(); onPlay?.(); },
    onPause: () => { patch({ playing: false }); onPause?.(); },
    onEnded: () => {
      patch({ playing: false, controlsVisible: true });
      syncMedia(true);
      if (autoNext && hasNext && onNext) {
        onNext();
        return;
      }
      onEnded?.();
    },
    onTimeUpdate: () => { syncMedia(); latest.current.onTimeUpdate?.(mediaRef.current?.currentTime ?? 0); },
    onProgress: () => { syncMedia(); const media = mediaRef.current; const duration = safeDuration(media?.duration ?? 0); if (media && duration > 0) latest.current.onProgress?.(clamp(bufferedEnd(media, media.currentTime) / duration, 0, 1)); },
    onDurationChange: () => syncMedia(true),
    onSeeking: () => syncMedia(),
    onSeeked: () => { syncMedia(); patch({ buffering: false }); },
    onLoadedMetadata: () => {
      const media = mediaRef.current;
      if (!media) return;
      const pending = resumeRef.current;
      if (pending) { resumeRef.current = null; const duration = safeDuration(media.duration); media.currentTime = duration > 0 ? clamp(pending.time, 0, duration) : 0; if (pending.playing) void media.play().catch(() => undefined); }
      setHasLoaded(true);
      syncMedia(true);
      patch({ volume: media.volume, muted: media.muted, playbackRate: media.playbackRate, error: undefined });
      onLoadedMetadata?.(safeDuration(media.duration));
    },
    onLoadStart: () => { if (resumeRef.current) patch({ buffering: true }); },
    onCanPlay: () => { setHasLoaded(true); patch({ buffering: false }); },
    onWaiting: () => { patch({ buffering: true }); onWaiting?.(); },
    onPlaying: () => { patch({ buffering: false }); onPlaying?.(); },
    onRateChange: () => { const rate = mediaRef.current?.playbackRate ?? 1; patch({ playbackRate: rate }); onRateChange?.(rate); },
    onVolumeChange: () => { const media = mediaRef.current; if (!media) return; if (!media.muted && media.volume > 0) previousVolume.current = media.volume; patch({ volume: media.volume, muted: media.muted }); onVolumeChange?.(media.volume, media.muted); },
    onError: () => { const error = mediaRef.current?.error; if (!error) return; raiseError({ code: error.code, nativeError: error, message: "The media could not be loaded." }); },
  };

  const retry = () => {
    const media = mediaRef.current;
    if (!media) return;
    resumeRef.current = { time: state.currentTime, playing: true };
    setHasLoaded(false);
    patch({ error: undefined, buffering: true });
    media.load();
  };

  const VolumeIcon = state.muted || state.volume === 0 ? VolumeX : state.volume < 0.4 ? Volume1 : Volume2;
  const effectiveVolume = state.muted ? 0 : state.volume;
  const duration = safeDuration(state.duration);
  const currentTime = duration > 0 ? clamp(state.currentTime, 0, duration) : 0;

  // ---- the ONE progress bar: rail (gray) + buffered (white) + played (accent) + the input's own thumb ----
  const progress = config.progress && (
    <div className={`progress-wrap ${dragging === "seek" ? "is-dragging" : ""}`} style={{ "--pct": duration > 0 ? currentTime / duration : 0, "--buf": state.buffered } as CSSProperties}>
      <span className="progress-rail" /><span className="progress-buffered" /><span className="progress-played" />
      <input className="progress-range" type="range" aria-label="Seek through video" aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`} min={0} max={duration || 1} step={0.1} value={currentTime} disabled={duration === 0}
        onPointerDown={() => setDragging("seek")} onChange={(event) => seek(Number(event.target.value))} />
    </div>
  );

  const settingsButton = config.settings && (
    <div ref={settingsRef} className="player-menu-anchor">
      <IconButton label="Settings" active={menu !== null} onClick={() => changeMenu(menu ? null : "main")}><Settings size={isTouch ? ICON_TOUCH : ICON_DESKTOP} /></IconButton>
      {menu && (
        <div className="player-menu" role="menu">
          {isTouch && <div className="menu-handle" aria-hidden="true" />}
          {menu === "main" && <>
            <div className="menu-heading">Player settings</div>
            {config.speed && <button type="button" role="menuitem" onClick={() => changeMenu("speed")}><b><Gauge size={ICON_MENU} />Playback speed</b><span>{formatRate(state.playbackRate)}<ChevronRight size={14} /></span></button>}
            {config.quality && <button type="button" role="menuitem" onClick={() => changeMenu("quality")}><b><SlidersHorizontal size={ICON_MENU} />Quality</b><span>{state.quality ?? DEFAULT_QUALITY}<ChevronRight size={14} /></span></button>}
            {config.captions && <button type="button" role="menuitemcheckbox" aria-checked={state.captionsEnabled} onClick={toggleCaptions}><b><Captions size={ICON_MENU} />Captions</b><span>{state.captionsEnabled ? "On" : "Off"}</span></button>}
            {config.pictureInPicture && <button type="button" role="menuitem" onClick={() => void (state.pictureInPicture ? exitPictureInPicture() : enterPictureInPicture())}><b><PictureInPicture2 size={ICON_MENU} />Picture-in-Picture</b><span>{state.pictureInPicture ? "On" : "Off"}</span></button>}
          </>}
          {menu === "speed" && <>
            <button type="button" className="menu-back" onClick={() => changeMenu("main")}><b><ArrowLeft size={16} />Playback speed</b></button>
            {speedOptions.map((rate) => <button type="button" role="menuitemradio" aria-checked={state.playbackRate === rate} key={rate} className={state.playbackRate === rate ? "selected" : ""} onClick={() => { setPlaybackRate(rate); changeMenu(null); }}><b>{formatRate(rate)}</b>{state.playbackRate === rate && <Check size={16} />}</button>)}
          </>}
          {menu === "quality" && <>
            <button type="button" className="menu-back" onClick={() => changeMenu("main")}><b><ArrowLeft size={16} />Quality</b></button>
            {[DEFAULT_QUALITY, ...quality.map((item) => item.label)].map((label) => <button type="button" role="menuitemradio" aria-checked={qualityLabel === label} key={label} className={qualityLabel === label ? "selected" : ""} onClick={() => switchQuality(label)}><b>{label}</b>{qualityLabel === label && <Check size={16} />}</button>)}
          </>}
        </div>
      )}
    </div>
  );
  const captionsButton = config.captions && <IconButton label={state.captionsEnabled ? "Turn captions off" : "Turn captions on"} active={state.captionsEnabled} onClick={toggleCaptions}><Captions size={isTouch ? ICON_TOUCH : ICON_DESKTOP} /></IconButton>;
  const fullscreenButton = config.fullscreen && <IconButton label={state.fullscreen ? "Exit fullscreen" : "Fullscreen"} onClick={() => void (state.fullscreen ? exitFullscreen() : requestFullscreen())}>{state.fullscreen ? <Minimize size={isTouch ? ICON_TOUCH : ICON_DESKTOP} /> : <Maximize size={isTouch ? ICON_TOUCH : ICON_DESKTOP} />}</IconButton>;
  const playPause = config.play && <IconButton label={state.playing ? "Pause" : "Play"} className="play-control" onClick={() => void togglePlay()}>{state.playing ? <Pause size={isTouch ? 26 : 20} /> : <Play size={isTouch ? 26 : 20} />}</IconButton>;
  const time = <span className="time-label">{formatTime(currentTime)} / {formatTime(duration)}</span>;

  const desktopControls = (
    <div className="player-controls desktop">
      {progress}
      <div className="control-row">
        {playPause}
        {config.previous && <IconButton label="Previous video" disabled={!hasPrevious} onClick={() => onPrevious?.()}><SkipBack size={ICON_DESKTOP} /></IconButton>}
        {config.next && <IconButton label="Next video" disabled={!hasNext} onClick={() => onNext?.()}><SkipForward size={ICON_DESKTOP} /></IconButton>}
        {config.volume && (
          <div className="volume-group">
            <IconButton label={state.muted ? "Unmute" : "Mute"} onClick={toggleMute}><VolumeIcon size={ICON_DESKTOP} /></IconButton>
            <input className="volume-range" type="range" aria-label="Volume" min={0} max={1} step={0.01} value={effectiveVolume} style={{ "--range-fill": `${effectiveVolume * 100}%` } as CSSProperties}
              onPointerDown={() => setDragging("volume")} onChange={(event) => setVolume(Number(event.target.value))} />
          </div>
        )}
        {time}
        <span className="control-spacer" />
        {captionsButton}
        {settingsButton}
        {config.pictureInPicture && <IconButton label="Picture-in-Picture" onClick={() => void (state.pictureInPicture ? exitPictureInPicture() : enterPictureInPicture())} active={state.pictureInPicture}><PictureInPicture2 size={ICON_DESKTOP} /></IconButton>}
        {fullscreenButton}
      </div>
    </div>
  );

  // Touch layout follows the mobile reference: CC + settings top-right, transport centered, time + fullscreen + progress at the bottom.
  const touchControls = (
    <div className="player-controls touch">
      <div className="touch-top">{captionsButton}{settingsButton}</div>
      <div className="touch-center">
        {config.previous && <IconButton label="Previous video" className="touch-skip" disabled={!hasPrevious} onClick={() => onPrevious?.()}><SkipBack size={ICON_TOUCH} /></IconButton>}
        {!loading && playPause}
        {loading && <span className="touch-center-spacer" />}
        {config.next && <IconButton label="Next video" className="touch-skip" disabled={!hasNext} onClick={() => onNext?.()}><SkipForward size={ICON_TOUCH} /></IconButton>}
      </div>
      <div className="touch-bottom"><div className="touch-meta">{time}{fullscreenButton}</div>{progress}</div>
    </div>
  );

  return (
    <div ref={playerRef} className={`media-player ${isTouch ? "is-touch" : "is-desktop"} ${controlsVisible ? "" : "controls-hidden"} ${state.fullscreen ? "is-fullscreen" : ""} ${className}`} style={{ "--player-accent": accent } as CSSProperties}
      tabIndex={0} onKeyDown={onKeyDown} onFocus={(event) => { if (event.target instanceof HTMLElement && event.target.matches(":focus-visible")) wake(); }}
      onPointerDown={(event) => { if (event.target !== surfaceRef.current) wake(); }}
      onPointerMove={(event) => { if (event.pointerType === "touch") return; const last = lastPointer.current; lastPointer.current = { x: event.clientX, y: event.clientY }; if (last && last.x === event.clientX && last.y === event.clientY) return; /* same-position moves (synthetic, pre-click) are not activity */ const anchor = hideAnchor.current; if (anchor && Math.hypot(event.clientX - anchor.x, event.clientY - anchor.y) < 10) return; wake(); }}>
      <video ref={mediaRef} className="media-element" src={sourceValue(activeSource)} preload={preload} autoPlay={autoplay} muted={muted} loop={loop} poster={started ? undefined : poster} playsInline {...mediaEvents}>
        {captions.map((track) => <CaptionTrack key={track.src} track={track} onStatus={onCaptionStatus} />)}
        {chapters && <track src={chapters.src} srcLang={chapters.srcLang} label={chapters.label} kind="chapters" />}
      </video>
      {/* Video surface: never toggles playback. It only wakes the controls (via the container) and detects touch double-taps. */}
      <div ref={surfaceRef} className="tap-surface" onPointerUp={onSurfacePointerUp} />
      {seekFeedback && <div key={seekFeedback.id} className={`seek-feedback ${seekFeedback.side}`} aria-hidden="true">{seekFeedback.side === "back" ? <ChevronsLeft size={22} /> : <ChevronsRight size={22} />}<b>{seekStep} seconds</b></div>}
      {loading && <div className="player-loader" role="status" aria-label={hasLoaded ? "Buffering" : "Loading video"}><span className="loader-ring" /></div>}
      {state.error && <div className="media-error" role="alert"><X size={20} /><strong>Unable to load video</strong><button type="button" onClick={retry}>Retry</button></div>}
      {notice && <div className="media-notice" role="status">{notice}</div>}
      {isTouch && menu && <div className="menu-backdrop" />}
      {hasControls && (isTouch ? touchControls : desktopControls)}
    </div>
  );
});
