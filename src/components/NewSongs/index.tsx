import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import { FreeMode, Autoplay } from "swiper/modules";
import { LoaderCircle } from "lucide-react";
import { Album, Track } from "@/util/services/type";

import "swiper/css";

const getTracks = async () => {
  const response = await fetch("/new_songs", {
    next: { revalidate: 3600 },
  });
  const data = await response.json();
  if (data.type === "album") {
    return {
      type: "album",
      results: data.results as Album[],
    };
  }
  if (data.type === "track") {
    return {
      type: "track",
      results: data.results as Track[],
    };
  }
  return null;
};

export const NewSongs: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<Array<Track | Album>>([]);
  const [type, setType] = useState<string | null>(null);

  useEffect(() => {
    getTracks()
      .then((results) => {
        if (results) {
          setType(results.type);
          setResults(results.results);
        }
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
        {results
          .filter((item) => !!item.cover)
          .map((item) => {
            return (
              <SwiperSlide key={item.id}>
                <a href={`/${type}/${item.key}`}>
                  <Image
                    className="rounded-md drop-shadow-md"
                    src={item.cover!}
                    alt={item.name}
                    width={200}
                    height={200}
                  />
                  <div className="mt-2 ">
                    <div className="text-lg font-semibold flex items-center gap-2 truncate">
                      {item.name}
                    </div>
                    <div className="text-md font-semibold text-gray-800">
                      {item.artist}
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
