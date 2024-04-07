"use client";

import AudioPlayer from "react-modern-audio-player";

export const Preview: React.FC<{ url: string }> = ({ url }) => {
  return (
    <div className="rounded-md mt-2 mb-4">
      <AudioPlayer
        playList={[
          {
            id: 1,
            src: url,
          },
        ]}
        audioInitialState={{ volume: 1, curPlayId: 1, repeatType: "ONE" }}
        activeUI={{
          playButton: true,
          progress: "waveform",
        }}
        rootContainerProps={{
          colorScheme: "light",
          scale: "medium",
        }}
      />
    </div>
  );
};
