"use server";

import { sql } from "@vercel/postgres";
import { log } from "next-axiom";
import { Provider, ResourceType } from "../validators/type";
import { isSupportedProvider, isSupportedType } from "../validators";
import spotify from "./spotify";
import deezer from "./deezer";
import appleMusic from "./appleMusic";
import tidal from "./tidal";
import youtubeMusic from "./youtubeMusic";
import { SearchResult } from "./type";
import { cleanTitle } from "./helpers/clean";
// export const maxDuration = 60;

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
    } else {
      promises.push(spotify.search(type, searchParams));
      services.push({
        service: "spotify",
        method: "search",
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
    } else {
      promises.push(appleMusic.search(type, searchParams));
      services.push({
        service: "appleMusic",
        method: "search",
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
    } else {
      promises.push(deezer.search(type, searchParams));
      services.push({
        service: "deezer",
        method: "search",
      });
    }
  }

  if (source.provider !== "tidal") {
    if (cachedKeys["tidal"]) {
      promises.push(getSourceItemByKey(cachedKeys["tidal"]));
      services.push({ service: "tidal", method: "getById" });
    } else {
      promises.push(tidal.search(type, searchParams));
      services.push({ service: "tidal", method: "search" });
    }
  }

  if (source.provider !== "youtubeMusic") {
    if (cachedKeys["youtubemusic"]) {
      promises.push(getSourceItemByKey(cachedKeys["youtubemusic"]));
      services.push({ service: "youtubeMusic", method: "getById" });
    } else {
      promises.push(youtubeMusic.search(type, searchParams));
      services.push({ service: "youtubeMusic", method: "search" });
    }
  }

  const results = await Promise.allSettled(promises);

  results.forEach(async (result, idx) => {
    if (result.status === "fulfilled" && result.value) {
      const { provider, key } = result.value;
      keys[provider] = key;
      if (cachedKeys && !cachedKeys[provider.toLowerCase()]) {
        await appendKey(cachedKeys.id, provider, key);
      }
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
  if (
    Object.values(cachedKeys).length === 0 &&
    Object.values(keys).length > 1
  ) {
    try {
      await saveOrUpdateRelatedKeys(keys);
    } catch (error) {
      log.error("Error saving key relations", {
        keys,
        error,
      });
    }
  }
  await log.flush();
  return results;
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

const saveOrUpdateRelatedKeys = async (keys: Record<string, string>) => {
  const ids = await Promise.all(
    Object.entries(keys).map(async ([provider, key]) => {
      const { rows } = await isSavedRelationship(key, provider as Provider);
      const cachedKeys = rows[0] ?? {};
      if (cachedKeys.id) {
        return cachedKeys.id as number;
      }
    })
  );

  const uniqueIds = Array.from(
    new Set(ids.filter((id): id is number => id !== undefined))
  );

  if (uniqueIds.length > 1) {
    throw new Error(
      `Database inconsistency, found multiple matches for the same row: ${uniqueIds.join(
        ","
      )}`
    );
  }

  const id = uniqueIds.at(0);

  if (id === undefined) {
    return await saveRelatedKeys(keys);
  } else {
    return await updateRelatedKeys(id, keys);
  }
};

const saveRelatedKeys = async (keys: Record<string, string>) => {
  return sql`INSERT INTO relationship_cache (spotify, deezer, applemusic, tidal, youtubemusic) VALUES (${keys.spotify}, ${keys.deezer}, ${keys.appleMusic}, ${keys.tidal}, ${keys.youtubeMusic})`;
};

const updateRelatedKeys = async (id: number, keys: Record<string, string>) => {
  return sql`UPDATE relationship_cache SET spotify=${keys.spotify}, deezer=${keys.deezer}, applemusic=${keys.appleMusic}, tidal=${keys.tidal}, youtubemusic=${keys.youtubeMusic} WHERE id=${id}`;
};

const isSavedRelationship = async (key: string, provider: Provider) => {
  switch (provider) {
    case "appleMusic":
      return sql`SELECT * FROM relationship_cache WHERE applemusic=${key};`;
    case "spotify":
      return sql`SELECT * FROM relationship_cache WHERE spotify=${key};`;
    case "deezer":
      return sql`SELECT * FROM relationship_cache WHERE deezer=${key};`;
    case "tidal":
      return sql`SELECT * FROM relationship_cache WHERE tidal=${key};`;
    case "youtubeMusic":
      return sql`SELECT * FROM relationship_cache WHERE youtubemusic=${key};`;
    default:
      throw new Error(`Provider "${provider}" not supported`);
  }
};

const appendKey = async (id: string, provider: Provider, key: string) => {
  switch (provider) {
    case "appleMusic":
      return sql`UPDATE relationship_cache SET applemusic=${key} WHERE id=${id};`;
    case "spotify":
      return sql`UPDATE relationship_cache SET spotify=${key} WHERE id=${id};`;
    case "deezer":
      return sql`UPDATE relationship_cache SET deezer=${key} WHERE id=${id};`;
    case "tidal":
      return sql`UPDATE relationship_cache SET tidal=${key} WHERE id=${id};`;
    case "youtubeMusic":
      return sql`UPDATE relationship_cache SET youtubemusic=${key} WHERE id=${id};`;
    default:
      throw new Error(`Provider "${provider}" not supported`);
  }
};
