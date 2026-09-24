import type { MediaTrack } from "@/types/media-player";

export type PlaylistVideo = {
  id: string;
  title: string;
  description: string;
  src: string;
  captions?: MediaTrack[];
};

/**
 * Reusable playlist/navigation data. This project ships with exactly one real media file
 * (public/media/demo.mp4), so every entry below intentionally points at it — the point of
 * this module is the navigation shape (ids, ordering, previous/next lookup), not fake unique
 * footage. Swap in real per-video `src`/poster values once real sources exist; the Previous/
 * Next Video wiring in the player and the video detail page does not need to change.
 */
export const PLAYLIST: PlaylistVideo[] = [
  {
    id: "flower-study",
    title: "Flower study",
    description: "A detail route owns the content context. The player only owns the video.",
    src: "/media/demo.mp4",
    captions: [{ src: "/demo-captions.vtt", srcLang: "en", label: "English", default: true }],
  },
  {
    id: "garden-detail",
    title: "Garden detail",
    description: "Second entry in the sample playlist, reusing the same source clip.",
    src: "/media/demo.mp4",
    captions: [{ src: "/demo-captions.vtt", srcLang: "en", label: "English", default: true }],
  },
  {
    id: "golden-hour",
    title: "Golden hour",
    description: "Third and last entry in the sample playlist.",
    src: "/media/demo.mp4",
    captions: [{ src: "/demo-captions.vtt", srcLang: "en", label: "English", default: true }],
  },
];

function indexOf(id: string): number {
  const index = PLAYLIST.findIndex((video) => video.id === id);
  return index === -1 ? 0 : index;
}

export function getVideo(id: string): PlaylistVideo {
  return PLAYLIST[indexOf(id)];
}

/** Real previous/next lookup: returns undefined at either end instead of wrapping or faking an entry. */
export function getAdjacentVideos(id: string): { previous?: PlaylistVideo; next?: PlaylistVideo } {
  const index = indexOf(id);
  return { previous: PLAYLIST[index - 1], next: PLAYLIST[index + 1] };
}
