import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import { FreeMode, Autoplay } from "swiper/modules";
import { LoaderCircle } from "lucide-react";
import { Track } from "@/util/services/type";

import "swiper/css";

const getTracks = async () => {
  const response = await fetch("/new_songs", {
    next: { revalidate: 3600 },
  });
  const data = await response.json();
  return data.tracks as Track[];
};

export const NewSongs: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    getTracks()
      .then((tracks) => {
        setTracks(tracks);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="mx-auto flex justify-center">
        <LoaderCircle size={21} className="animate-spin" />
      </div>
    );

  return (
    <div>
      {/* <div className="mb-4 mx-auto max-w-2xl mt-8 flex justify-center text-gray-800 grayscale font-bold">
        Trending songs
      </div> */}
      <Swiper
        freeMode={true}
        loop={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: true,
          pauseOnMouseEnter: true,
        }}
        breakpoints={{
          320: {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          480: {
            slidesPerView: 3,
            spaceBetween: 10,
          },
          640: {
            slidesPerView: 4,
            spaceBetween: 10,
          },
          768: {
            slidesPerView: 5,
            spaceBetween: 10,
          },
          981: {
            slidesPerView: 6,
            spaceBetween: 10,
          },
          1800: {
            slidesPerView: 7,
            spaceBetween: 10,
          },
        }}
        modules={[FreeMode, Autoplay]}
      >
        {tracks
          .filter((track) => !!track.cover)
          .map((track) => {
            return (
              <SwiperSlide key={track.id}>
                <a href={`/track/${track.key}`}>
                  <Image
                    className="rounded-md drop-shadow-md"
                    src={track.cover!}
                    alt={track.name}
                    width={200}
                    height={200}
                  />
                  <div className="mt-2 ">
                    <div className="text-lg font-semibold flex items-center gap-2">
                      {track.name}
                    </div>
                    <div className="text-md font-semibold text-gray-800">
                      {track.artist}
                    </div>
                  </div>
                </a>
              </SwiperSlide>
            );
          })}
      </Swiper>
    </div>
  );
};
