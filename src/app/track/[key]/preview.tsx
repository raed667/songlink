"use client";

import { PauseCircle, PlayCircle } from "lucide-react";
import { useRef, useState } from "react";

export const PreviewAudio: React.FC<{ url: string }> = ({ url }) => {
  const ref = useRef<HTMLAudioElement>(null);
  const [isPlaying, setPlaying] = useState(false);

  const onToggle = () => {
    if (ref.current?.paused) {
      ref.current?.play();
    } else {
      ref.current?.pause();
    }
  };

  return (
    <div className="text-gray-400 mt-2">
      <button onClick={onToggle}>
        {isPlaying ? (
          <PauseCircle className="text-connect" />
        ) : (
          <PlayCircle className="text-connect" />
        )}
      </button>
      <audio
        ref={ref}
        src={url}
        loop
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
    </div>
  );
};
