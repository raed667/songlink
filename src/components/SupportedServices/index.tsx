import clsx from "clsx";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const services = [
  {
    key: "spotify",
    name: "Spotify",
    logo: "/img/logo/spotify.svg",
    example: "https://open.spotify.com/track/4PTG3Z6ehGkBFwjybzWkR8",
  },
  {
    key: "applemusic",
    name: "Apple Music",
    logo: "/img/logo/appleMusic.svg",
    example:
      "https://music.apple.com/fr/album/never-gonna-give-you-up/1559523357?i=1559523359",
  },
  {
    key: "deezer",
    name: "Deezer",
    logo: "/img/logo/deezer.svg",
    example: "https://www.deezer.com/us/track/14408104",
  },
  {
    key: "youtubemusic",
    name: "Youtube Music",
    logo: "/img/logo/YoutubeMusic.svg",
    soon: true,
  },
  {
    key: "Tidal",
    name: "Tidal",
    logo: "/img/logo/Tidal.svg",
    soon: true,
  },
];

export const SupportedServices: React.FC = () => {
  const onClick = (provider: string) => {
    const service = services.find((service) => service.name === provider);
    if (!service || service.soon || !service.example) return;
    document
      .getElementById("input_link")
      ?.setAttribute("value", service.example);
  };

  return (
    <div className="mx-auto max-w-2xl mt-4 px-4 md:px-0">
      <h2 className="text-l font-semibold pb-2">supported services</h2>
      <div className="flex flex-wrap gap-2 mt-2">
        {services.map((service) => (
          <div
            key={service.key}
            tabIndex={service.soon ? undefined : 0}
            className={clsx(
              "bg-gray-100 p-2 rounded-md flex items-center gap-2",
              service.soon && "opacity-50",
              !service.soon && "cursor-pointer active:bg-gray-200"
            )}
            onKeyUp={(event) => {
              if (event.key === "Enter") onClick(service.name);
            }}
            onClick={() => {
              onClick(service.name);
            }}
          >
            <Image
              src={service.logo}
              alt={service.name}
              width={32}
              height={32}
              className={clsx("w-8 h-8", service.soon && "grayscale")}
            />
            <span>{service.name}</span>

            {service.soon && (
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                Soon
              </span>
            )}
          </div>
        ))}
        <Link href="https://github.com/raed667/songlink/discussions">
          <div className="bg-gray-100 h-full p-2 rounded-md flex items-center gap-2 cursor-pointer active:bg-gray-200">
            <Plus /> Request a service
          </div>
        </Link>
      </div>
    </div>
  );
};
