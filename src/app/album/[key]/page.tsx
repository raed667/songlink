"use server";
import Image from "next/image";
import { redirect } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
import { cache } from "react";
import { findRelatedItems, getSourceItemByKey } from "@/util/services";
import { Album } from "@/util/services/type";
import { ServiceLogo } from "@/components/ServiceLogo";
import { services } from "@/util/services/list";

const fallbackCover = "/img/cover-fallback.png";

const getSourceItem = cache(async (key: string) => {
  return (await getSourceItemByKey(key)) as Album | null;
});

type Props = {
  params: { key: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const key = params.key;
  const album = await getSourceItem(key);
  if (!album) return { title: "404 - Album not found" };

  let description = `Listen to ${album.name}`;
  if (album.artist) description += ` by ${album.artist}`;
  description += " on your favorite music service";

  const results = await findRelatedItems(album, "album");

  const cover =
    album.cover ??
    results
      .map((res) => {
        if (res.status === "fulfilled") return res?.value?.cover;
      })
      .find(Boolean) ??
    fallbackCover;

  return {
    title: `${album.name} - ${album?.artist}`,
    description,

    openGraph: {
      title: `${album.name} - ${album?.artist}`,
      description,
      locale: "en_US",
      type: "music.album",
      images: cover,
      url: `https://songlink.cc/album/${key}`,
    },
  };
}

export default async function Page({ params }: Props) {
  const key = params.key;

  if (!key) redirect("/404?source=album");

  const album = await getSourceItem(key);
  if (!album) redirect("/404?source=album&key=" + key);

  const results = await findRelatedItems(album, "album");

  const cover =
    album.cover ??
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
    provider: album.provider,
    link: album.link,
    name: album.name,
  });

  return (
    <main className="min-h-full mx-auto max-w-2xl mt-2 md:mt-6 px-2">
      <Image
        className="rounded-md drop-shadow-md"
        src={cover}
        alt={album.name}
        width={200}
        height={200}
      />
      <h1 className="mt-2 text-lg font-semibold">{album.name}</h1>
      <h2 className="text-md font-semibold text-gray-800">{album.artist}</h2>
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
                Listen to {album.name} on {name}
              </a>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
