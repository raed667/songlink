"use server";
import type { Metadata, ResolvingMetadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";
import { cache } from "react";
import { findRelatedItems, getSourceItemByKey } from "@/util/services";

import { ServiceLogo } from "@/components/ServiceLogo";
import { services } from "@/components/SupportedServices";
import { Share } from "@/components/Share";
import { HomeLink } from "@/components/HomeLink";
const fallbackCover = "/img/cover-fallback.png";

const getSourceItem = cache(async (key: string) => {
  return await getSourceItemByKey(key);
});

type Props = {
  params: { key: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const key = params.key;
  const artist = await getSourceItem(key);
  if (!artist) return { title: "404 - Artist not found" };

  return {
    title: `${artist.name}`,
    description: `Listen to ${artist.name} on your favorite music service`,
    openGraph: {
      title: `${artist.name}`,
      description: `Listen to ${artist.name} on your favorite music service`,
      locale: "en_US",
      type: "music.album",
      images: artist.cover,
      url: `https://songlink.cc/artist/${key}`,
    },
  };
}

export default async function Page({ params }: Props) {
  const key = params.key;

  if (!key) redirect("/404?source=artist");
  const artist = await getSourceItem(key);
  if (!artist) redirect("/404?source=artist&key=" + key);
  const results = await findRelatedItems(artist, "artist", artist.provider);

  const cover =
    artist.cover ??
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
    provider: artist.provider,
    link: artist.link,
    name: artist.name,
  });

  return (
    <main className="min-h-full mx-auto max-w-2xl mt-2 md:mt-6 px-2">
      <HomeLink />
      <Image
        className="rounded-md drop-shadow-md"
        src={cover}
        alt={artist.name}
        width={200}
        height={200}
      />
      <h1 className="mt-2 text-lg font-semibold">{artist.name}</h1>

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
                Listen to {artist.name} on {name}
              </a>
            </li>
          );
        })}
      </ol>

      <Share />
    </main>
  );
}
