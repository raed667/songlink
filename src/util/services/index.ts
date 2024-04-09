import spotify from "./spotify";
import deezer from "./deezer";
import appleMusic from "./appleMusic";
import { Provider, ResourceType } from "../validators/type";
import { isSupportedProvider, isSupportedType } from "../validators";
import { SearchResult } from "./type";
import { sql } from "@vercel/postgres";
import { Logger } from "next-axiom";

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
      track_name: source.name,
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
  type: ResourceType,
  provider: Provider
) => {
  const log = new Logger();
  log.debug("finding related items", { source, type, provider });
  const promises = [];
  const searchParams = getSearchParams(source, type);
  const keys: Record<string, string> = {
    [source.provider]: source.key,
  };

  const { rows } = await isSavedRelationship(source.key, provider);
  const cachedKeys = rows[0] ?? {};

  if (provider !== "spotify") {
    if (cachedKeys["spotify"]) {
      promises.push(getSourceItemByKey(cachedKeys["spotify"]));
    } else {
      promises.push(spotify.search(type, searchParams));
    }
  }

  if (provider !== "appleMusic") {
    if (cachedKeys["applemusic"]) {
      promises.push(getSourceItemByKey(cachedKeys["applemusic"]));
    } else {
      promises.push(appleMusic.search(type, searchParams));
    }
  }

  if (provider !== "deezer") {
    if (cachedKeys["deezer"]) {
      promises.push(getSourceItemByKey(cachedKeys["deezer"]));
    } else {
      promises.push(deezer.search(type, searchParams));
    }
  }

  const results = await Promise.allSettled(promises);

  results.forEach(async (result) => {
    if (result.status === "fulfilled" && result.value) {
      const { provider, key } = result.value;
      keys[provider] = key;
      if (cachedKeys && !cachedKeys[provider.toLowerCase()]) {
        await appendKey(cachedKeys.id, provider, key);
      }
    } else {
      log.error("Error finding related items", { result, type, searchParams });
    }
  });
  if (
    Object.values(cachedKeys).length === 0 &&
    Object.values(keys).length > 1
  ) {
    try {
      await saveRelatedKeys(keys);
    } catch (error) {
      log.error("Error saving key relations", {
        error,
      });
      console.error("Error saving key relations", error);
    }
  }
  await log.flush();
  return results;
};

export const getSourceItemByKey = async (key: string) => {
  const [provider, type, id] = key.split("_");
  if (!provider || !type || !id) throw new Error("Invalid key");

  if (!isSupportedType(type)) {
    throw new Error(`Resource of type "${type}" not supported`);
  }

  if (!isSupportedProvider(provider)) {
    throw new Error(`Provider "${provider}" not supported`);
  }
  return findSourceItem(id, type, provider);
};

const saveRelatedKeys = async (keys: Record<string, string>) => {
  return sql`INSERT INTO relationship_cache (spotify, deezer, applemusic) VALUES (${keys.spotify}, ${keys.deezer}, ${keys.appleMusic})`;
};

const isSavedRelationship = async (key: string, provider: Provider) => {
  switch (provider) {
    case "appleMusic":
      return sql`SELECT * FROM relationship_cache WHERE applemusic=${key};`;
    case "spotify":
      return sql`SELECT * FROM relationship_cache WHERE spotify=${key};`;
    case "deezer":
      return sql`SELECT * FROM relationship_cache WHERE deezer=${key};`;
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
  }
};
