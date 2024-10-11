"use server";
import type { Metadata, ResolvingMetadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";
import { PreviewAudio } from "./preview";
import { findRelatedItems, getSourceItemByKey } from "@/util/services";
import { Artist, Track } from "@/util/services/type";
import { services } from "@/components/SupportedServices";
import { ServiceLogo } from "@/components/ServiceLogo";
import { Share } from "@/components/Share";
import { HomeLink } from "@/components/HomeLink";

const fallbackCover = "/img/cover-fallback.png";

type Props = {
  params: { key: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const key = params.key;
  const track = (await getSourceItemByKey(key)) as Track | null;
  if (!track) return { title: "404 - Track not found" };

  let description = `Listen to ${track.name}`;
  if (track.artist) description += ` by ${track.artist}`;
  description += " on your favorite music service";

  return {
    title: `${track.name} - ${track.artist}`,
    description,

    openGraph: {
      type: "music.song",
      images: track.cover,
      url: `https://songlink.cc/track/${key}`,
    },
  };
}

export default async function Page({ params }: Props) {
  const key = params.key;

  if (!key) redirect("/404?source=track");

  const track = (await getSourceItemByKey(key)) as Track | null;

  if (!track) redirect("/404?source=track&key=" + key);
  const results = await findRelatedItems(track, "track", track.provider);
  const items = results
    .filter((res) => res.status === "fulfilled")
    .map((res) => (res.status === "fulfilled" ? res.value : null))
    .filter(Boolean) as Track[];

  const spotifyTrack = items.find((res) => res?.provider === "spotify");
  const appleTrack = items.find((res) => res?.provider === "appleMusic");

  const name = spotifyTrack?.name ?? appleTrack?.name ?? track.name;
  const album = spotifyTrack?.album ?? appleTrack?.album ?? track.album;
  const artist = spotifyTrack?.artist ?? appleTrack?.artist ?? track.artist;
  const cover =
    spotifyTrack?.cover ?? appleTrack?.cover ?? track.cover ?? fallbackCover;

  const links = items
    .map((res) => {
      if (res) {
        return {
          provider: res.provider,
          link: res.link,
          name: res.name,
        };
      }
    })
    .filter(Boolean);

  links.push({
    provider: track.provider,
    link: track.link,
    name: track.name,
  });

  return (
    <main className="min-h-full sm:mx-auto max-w-2xl mt-2 md:mt-6 px-2">
      <HomeLink />
      <Image
        className="rounded-md drop-shadow-md"
        src={cover}
        alt={name}
        width={200}
        height={200}
      />
      <div className="mt-2 ">
        <h1 className="text-lg font-semibold flex items-center gap-2">
          {track.preview_url && (
            <div className="text-connect">
              <PreviewAudio url={track.preview_url} />
            </div>
          )}
          {name}
        </h1>
        <h2 className="text-md font-semibold text-gray-800">
          {track.artist} {album && `- ${album}`}
        </h2>
      </div>

      <ol>
        {links.map((link, i) => {
          if (!link) return null;
          const name =
            services.find(
              (service) =>
                service.key.toLocaleLowerCase() ===
                link.provider.toLocaleLowerCase()
            )?.name ?? link.provider;
          return (
            <li
              key={link.link}
              className="bg-gray-100 my-2 p-2 rounded-md flex items-center gap-2 hover:bg-gray-200 cursor-pointer"
            >
              <ServiceLogo name={link.provider} />
              <a href={link.link}>
                Listen to {name} by {artist} on {name}
              </a>
            </li>
          );
        })}
      </ol>

      <Share />
    </main>
  );
}
