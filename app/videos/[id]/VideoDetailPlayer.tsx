"use client";

import { useRouter } from "next/navigation";
import { MediaPlayer } from "@/components/media-player";
import type { PlaylistVideo } from "@/lib/playlist";

export function VideoDetailPlayer({ video, previous, next }: { video: PlaylistVideo; previous?: PlaylistVideo; next?: PlaylistVideo }) {
  const router = useRouter();
  return (
    <MediaPlayer
      key={video.id}
      src={video.src}
      captions={video.captions}
      quality={video.qualities}
      chapters={video.provider === "local" ? { src: "/demo-chapters.vtt", srcLang: "en", label: "Chapters", kind: "chapters" } : undefined}
      hasPrevious={Boolean(previous)}
      hasNext={Boolean(next)}
      onPrevious={previous ? () => router.push(`/videos/${previous.id}`) : undefined}
      onNext={next ? () => router.push(`/videos/${next.id}`) : undefined}
    />
  );
}
