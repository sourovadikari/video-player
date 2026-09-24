import type { Ref } from "react";

export type MediaPreload = "none" | "metadata" | "auto";
export type MediaSource = string | { src: string; type?: string };
export type MediaQuality = { label: string; src: MediaSource; width?: number; height?: number };
export type MediaTrack = { src: string; srcLang: string; label: string; kind?: "subtitles" | "captions" | "chapters"; default?: boolean };
export type MediaSessionArtwork = { src: string; sizes?: string; type?: string };
export type MediaSessionMetadata = { title: string; artist?: string; album?: string; artwork?: MediaSessionArtwork[] };
export type MediaPlayerError = { code?: number; message: string; nativeError?: MediaError | null };
export type MediaPlayerState = {
  playing: boolean; currentTime: number; duration: number; volume: number; muted: boolean; buffered: number;
  buffering: boolean; fullscreen: boolean; pictureInPicture: boolean; playbackRate: number; quality?: string;
  captionsEnabled: boolean; controlsVisible: boolean; error?: MediaPlayerError;
};
export type MediaPlayerControls = { play?: boolean; volume?: boolean; progress?: boolean; captions?: boolean; settings?: boolean; speed?: boolean; quality?: boolean; fullscreen?: boolean; pictureInPicture?: boolean; previous?: boolean; next?: boolean };
export type MediaPlayerRef = {
  play: () => Promise<void>; pause: () => void; togglePlay: () => Promise<void>; seek: (time: number) => void;
  setVolume: (volume: number) => void; toggleMute: () => void; setPlaybackRate: (rate: number) => void;
  requestFullscreen: () => Promise<void>; exitFullscreen: () => Promise<void>; enterPictureInPicture: () => Promise<void>;
  exitPictureInPicture: () => Promise<void>; getState: () => MediaPlayerState;
};
export type MediaPlayerProps = {
  src: MediaSource; poster?: string; preload?: MediaPreload; autoplay?: boolean; muted?: boolean; loop?: boolean;
  controls?: boolean | MediaPlayerControls; captions?: MediaTrack[]; chapters?: MediaTrack; quality?: MediaQuality[];
  playbackRate?: boolean; playbackRates?: number[]; seekStep?: number; keyboardShortcuts?: boolean;
  doubleTapSeek?: boolean; landscapeOnFullscreen?: boolean;
  hasPrevious?: boolean; hasNext?: boolean; onPrevious?: () => void; onNext?: () => void;
  mediaSession?: MediaSessionMetadata; className?: string; accent?: string; ref?: Ref<MediaPlayerRef>;
  onPlay?: () => void; onPause?: () => void; onEnded?: () => void; onTimeUpdate?: (currentTime: number) => void;
  onProgress?: (buffered: number) => void; onLoadedMetadata?: (duration: number) => void; onWaiting?: () => void;
  onPlaying?: () => void; onVolumeChange?: (volume: number, muted: boolean) => void; onRateChange?: (rate: number) => void;
  onFullscreenChange?: (fullscreen: boolean) => void; onError?: (error: MediaPlayerError) => void;
  onQualityChange?: (quality: string) => void; onCaptionChange?: (enabled: boolean) => void; onSeek?: (time: number) => void;
};
