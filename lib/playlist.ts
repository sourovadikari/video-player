import type { MediaQuality, MediaTrack, PlaylistVideoRecord } from "@/types/media-player";

export type PlaylistVideo = PlaylistVideoRecord;

/**
 * Sources are copied from the collection's public asset metadata rather than the collection
 * page URL. Add, remove, or reorder entries here without changing player or playlist logic.
 */
const cloudinaryVideo = (publicId: string, version: string, title: string): PlaylistVideo => {
  const sourceUrl = `https://res.cloudinary.com/dddgc0vaq/video/upload/${version}/${publicId}.mp4?_s=public-apps`;
  const qualities: MediaQuality[] = [
    { label: "Low", src: `https://res.cloudinary.com/dddgc0vaq/video/upload/q_auto:low/${version}/${publicId}.mp4?_s=public-apps` },
    { label: "High", src: `https://res.cloudinary.com/dddgc0vaq/video/upload/q_auto:best/${version}/${publicId}.mp4?_s=public-apps` },
  ];
  return { id: `cloudinary-${publicId}`, title, description: "Video from the shared Cloudinary collection.", sourceUrl, provider: "cloudinary", thumbnail: `https://res.cloudinary.com/dddgc0vaq/video/upload/h_250,q_auto/${version}/${publicId}.jpg?_s=public-apps`, mimeType: "video/mp4", order: 0, src: sourceUrl, qualities };
};

const demoCaptions: MediaTrack[] = [{ src: "/demo-captions.vtt", srcLang: "en", language: "en", label: "English", default: true }];

export const CLOUDINARY_COLLECTION_VIDEOS: PlaylistVideo[] = [
  cloudinaryVideo("ktezsr3lj5xhrvf7zg90", "v1790228449", "Cloudinary collection video 1"),
  cloudinaryVideo("pejn3wrjkaosd2yiiidi", "v1790228341", "Cloudinary collection video 2"),
];

export const PLAYLIST: PlaylistVideo[] = [
  ...CLOUDINARY_COLLECTION_VIDEOS,
  { id: "demo-clip", title: "Local demo video", description: "The bundled local MP4 demo with WebVTT captions and chapters.", sourceUrl: "/media/demo.mp4", provider: "local", mimeType: "video/mp4", order: 3, src: "/media/demo.mp4", captions: demoCaptions },
];

function indexOf(id: string): number {
  const index = PLAYLIST.findIndex((video) => video.id === id);
  return index === -1 ? 0 : index;
}

export function getVideo(id: string): PlaylistVideo {
  return PLAYLIST[indexOf(id)];
}

export function findVideo(id: string): PlaylistVideo | undefined {
  return PLAYLIST.find((video) => video.id === id);
}

export function getAdjacentVideos(id: string): { previous?: PlaylistVideo; next?: PlaylistVideo } {
  const index = indexOf(id);
  return { previous: PLAYLIST[index - 1], next: PLAYLIST[index + 1] };
}
