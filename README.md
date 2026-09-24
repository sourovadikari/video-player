# signalplay

A reusable, accessible HTML5 MediaPlayer for Next.js and React. It supports public MP4 sources, Cloudinary delivery, local media, playlists, captions, real quality variants, keyboard controls, fullscreen, and native Picture-in-Picture.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Use `npm run lint`, `npx tsc --noEmit`, and `npm run build` before shipping.

## Basic usage

```tsx
import { MediaPlayer } from "@/components/media-player";

<MediaPlayer
  src="https://res.cloudinary.com/dddgc0vaq/video/upload/v1790228341/pejn3wrjkaosd2yiiidi.mp4?_s=public-apps"
  controls
  seekStep={10}
  accent="#c8f169"
/>
```

`controls` accepts `true`, `false`, or a typed `MediaPlayerControls` object. The current object keys are `play`, `playPause`, `volume`, `progress`, `seek`, `captions`, `quality`, `settings`, `speed`, `pictureInPicture`, `fullscreen`, `previous`, and `next`. `playPause` and `seek` are explicit aliases; the older `play` and `progress` keys remain supported.

## Props

- `src`: a browser-playable URL or `{ src, type }` media source.
- `poster`: optional poster image.
- `controls`: all controls or a per-control configuration object.
- `autoplay`, `muted`, `loop`: native playback behavior.
- `autoNext`: calls `onNext` when the source ends and `hasNext` is true.
- `seekStep`: seconds used by keyboard and double-tap seeking; defaults to `10`.
- `captions`: optional WebVTT `MediaTrack[]`; CC appears only after a track loads.
- `quality`: optional real alternate `MediaQuality[]`; Quality is hidden when absent.
- `hasPrevious`, `hasNext`, `onPrevious`, `onNext`: host-owned playlist navigation.
- `doubleTapSeek`, `landscapeOnFullscreen`, and `keyboardShortcuts`: interaction options.
- `accent`: CSS color used for the player’s active states.

The player never parses routes, imports application data, or assumes Cloudinary. It only receives sources and callbacks.

## Playlist data

The demo data lives in `lib/playlist.ts`. A reusable record supports `id`, `title`, `description`, `src`, `poster`/`thumbnail`, `duration`, `category`, `captions`, `qualities`, provider metadata, and order. The host calculates the active index and owns previous/next callbacks.

```tsx
const current = videos[index];

<MediaPlayer
  src={current.src}
  captions={current.captions}
  quality={current.qualities}
  hasPrevious={index > 0}
  hasNext={index < videos.length - 1}
  onPrevious={() => setIndex((value) => Math.max(0, value - 1))}
  onNext={() => setIndex((value) => Math.min(videos.length - 1, value + 1))}
  autoNext
/>
```

## Captions and quality

Captions use standard WebVTT files:

```tsx
captions={[{
  src: "/demo-captions.vtt",
  srcLang: "en",
  language: "en",
  label: "English",
  default: true,
}]}
```

Quality entries must point to actual encoded alternatives or real provider transformations. Do not list fake resolutions. The demo Cloudinary records contain low and high transformation URLs; the local demo intentionally has no fake quality selector.

## Cloudinary and local videos

Use Cloudinary’s individual delivery URL, never a collection or preview page. Local files in `public/media` are referenced as `/media/demo.mp4`, without `/public` in the URL.

## Routes

- `/`: product overview and a working local preview.
- `/videos`: lightweight gallery with posters and source metadata.
- `/videos/[id]`: dynamic player page with route-aware previous/next navigation.
- `/playground`: live configuration and playlist test environment.
- `/examples`: focused Cloudinary, local, captions, quality, and playlist examples.
- `/docs`: current API documentation.

## Browser behavior

Play/pause is controlled by the player button or keyboard. The video surface only shows or hides controls. Desktop volume controls are omitted on touch layouts. PiP and fullscreen buttons are capability-driven and use native browser APIs. Space/K toggles playback, Arrow Left/Right seeks, Arrow Up/Down adjusts volume, M mutes, F toggles fullscreen, and C toggles captions.
