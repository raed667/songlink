"use server";

import { sql } from "@vercel/postgres";
import { log } from "next-axiom";
import { Provider, ResourceType } from "../validators/type";
import spotify from "./spotify";
import deezer from "./deezer";
import appleMusic from "./appleMusic";
import tidal from "./tidal";
import youtubeMusic from "./youtubeMusic";
import { SearchResult } from "./type";
import { cleanTitle } from "./helpers/clean";

export const findSourceItem = async (
  id: string,
  type: ResourceType,
  provider: Provider
): Promise<SearchResult | null> => {
  switch (provider) {
    case "spotify":
      return spotify.getById(id, type);
    case "deezer":
      return deezer.getById(id, type);
    case "appleMusic":
      return appleMusic.getById(id, type);
    case "tidal":
      return tidal.getById(id, type);
    case "youtubeMusic":
      return youtubeMusic.getById(id, type);
    default:
      throw new Error(`Provider "${provider}" not supported`);
  }
};

const getSearchParams = (
  source: SearchResult,
  type: ResourceType
): { track_name?: string; album_name?: string; artist_name?: string } => {
  if (type === "artist") {
    return { artist_name: source.name };
  }
  if (type === "album") {
    // @ts-expect-error: TODO fix later
    return { album_name: source.name, artist_name: source.artist };
  }
  if (type === "track") {
    return {
      track_name: cleanTitle(source.name),
      // @ts-expect-error: TODO fix later
      artist_name: source.artist,
      // @ts-expect-error: TODO fix later
      album_name: source.album,
    };
  }
  throw new Error(`Resource of type "${type}" not supported`);
};

export const findRelatedItems = async (
  source: SearchResult,
  type: ResourceType
) => {
  log.debug("finding related items", { source, type });
  const promises = [];
  const services: Array<{
    service: string;
    method: "search" | "getById";
  }> = [];

  const searchParams = getSearchParams(source, type);
  const keys: Record<string, string> = {
    [source.provider]: source.key,
  };

  const { rows } = await isSavedRelationship(source.key, source.provider);

  const cachedKeys = rows[0] ?? {};

  if (source.provider !== "spotify") {
    if (cachedKeys["spotify"]) {
      promises.push(getSourceItemByKey(cachedKeys["spotify"]));
      services.push({
        service: "spotify",
        method: "getById",
      });
    }
  }

  if (source.provider !== "appleMusic") {
    if (cachedKeys["applemusic"]) {
      promises.push(getSourceItemByKey(cachedKeys["applemusic"]));
      services.push({
        service: "appleMusic",
        method: "getById",
      });
    }
  }

  if (source.provider !== "deezer") {
    if (cachedKeys["deezer"]) {
      promises.push(getSourceItemByKey(cachedKeys["deezer"]));
      services.push({
        service: "deezer",
        method: "getById",
      });
    }
  }

  if (source.provider !== "tidal") {
    if (cachedKeys["tidal"]) {
      promises.push(getSourceItemByKey(cachedKeys["tidal"]));
      services.push({ service: "tidal", method: "getById" });
    }
  }

  if (source.provider !== "youtubeMusic") {
    if (cachedKeys["youtubemusic"]) {
      promises.push(getSourceItemByKey(cachedKeys["youtubemusic"]));
      services.push({ service: "youtubeMusic", method: "getById" });
    }
  }

  const results = await Promise.allSettled(promises);

  results.forEach(async (result, idx) => {
    if (result.status === "fulfilled" && result.value) {
      const { provider, key } = result.value;
      keys[provider] = key;
    } else {
      const { service, method } = services[idx];
      log.error("Error finding related items", {
        ...searchParams,
        type,
        service,
        method,
      });
    }
  });

  return results;
};

const isSupportedProvider = (provider: string): provider is Provider =>
  ["spotify", "appleMusic", "deezer", "tidal", "youtubeMusic"].includes(
    provider
  );

const isSupportedType = (type: string): type is ResourceType => {
  return type === "track" || type === "album" || type === "artist";
};

export const getSourceItemByKey = async (key: string) => {
  const [provider, type, id] = key.split("_");
  if (!provider || !type || !id) throw new Error(`Invalid key="${key}"`);

  if (!isSupportedType(type)) {
    throw new Error(`Resource of type "${type}" not supported`);
  }

  if (!isSupportedProvider(provider)) {
    throw new Error(`Provider "${provider}" not supported`);
  }
  return findSourceItem(id, type, provider);
};

const isSavedRelationship = async (key: string, provider: Provider) => {
  switch (provider) {
    case "appleMusic":
      return sql`SELECT * FROM relationship_cache WHERE applemusic like ${key};`;
    case "spotify":
      return sql`SELECT * FROM relationship_cache WHERE spotify like ${key};`;
    case "deezer":
      return sql`SELECT * FROM relationship_cache WHERE deezer like ${key};`;
    case "tidal":
      return sql`SELECT * FROM relationship_cache WHERE tidal like ${key};`;
    case "youtubeMusic":
      return sql`SELECT * FROM relationship_cache WHERE youtubemusic like ${key};`;
    default:
      throw new Error(`Provider "${provider}" not supported`);
  }
};
