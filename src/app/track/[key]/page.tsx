"use server";
import { findRelatedItems, getSourceItemByKey } from "@/util/services";
import type { Metadata, ResolvingMetadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Track } from "@/util/services/type";
import { services } from "@/components/SupportedServices";
import { ServiceLogo } from "@/components/ServiceLogo";
import { Preview } from "./preview";
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

  return {
    title: `${track.name} - ${track.artist} - Song link`,
    openGraph: {
      type: "music.song",
      images: track.cover,
    },
  };
}

export default async function Page({ params }: Props) {
  const key = params.key;

  if (!key) redirect("/404?source=track");

  const track = (await getSourceItemByKey(key)) as Track | null;

  if (!track) redirect("/404?source=track&key=" + key);
  const results = await findRelatedItems(track, "track", track.provider);

  const cover =
    track.cover ??
    results
      .map((res) => {
        if (res.status === "fulfilled") return res?.value?.cover;
      })
      .find(Boolean) ??
    fallbackCover;

  const links = results
    .map((res) => {
      if (res.status === "fulfilled" && res.value) {
        return {
          provider: res.value.provider,
          link: res.value.link,
          name: res.value.name,
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
        alt={track.name}
        width={200}
        height={200}
      />
      <h1 className="mt-2 text-lg font-semibold">{track.name}</h1>
      <h2 className="text-md font-semibold text-gray-800">
        {track.artist} - {track.album}
      </h2>

      {track.preview_url && <Preview url={track.preview_url} />}

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
                Listen to {track.name} by {track.artist} on {name}
              </a>
            </li>
          );
        })}
      </ol>

      <Share />
    </main>
  );
}
