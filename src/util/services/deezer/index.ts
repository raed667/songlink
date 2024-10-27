import { kv } from "@vercel/kv";
import { backOff } from "exponential-backoff";
import { SearchParams, SearchResult } from "../type";
import { ResourceType } from "@/util/validators/type";

class Deezer {
  public static _name: "deezer";

  static getKey(id: string, type: ResourceType) {
    return `deezer_${type}_${id}`;
  }

  static async getById(
    id: string,
    type: ResourceType,
    market = "US"
  ): Promise<SearchResult | null> {
    const key = this.getKey(id, type);
    const cached = await kv.get(key);
    if (cached) {
      // TODO validate cache
      return { ...cached, cache: true } as SearchResult;
    }

    const resource = await backOff(() => Deezer._getById(id, type, market), {
      maxDelay: 3500,
      numOfAttempts: 5,
    });
    if (resource === null) return null;

    await kv.set(key, JSON.stringify(resource));

    return { ...resource, cache: false };
  }

  private static parseArtist(key: string, item: any): SearchResult {
    return {
      key,
      id: item.id,
      provider: "deezer",
      name: item.name,
      link: item.link,
      cover: item.picture_big, // picture_xl:
    };
  }

  private static parseAlbum(key: string, item: any): SearchResult {
    return {
      key,
      id: item.id,
      provider: "deezer",
      name: item.title,
      link: item.link,
      cover: item.picture_big, // picture_xl:
      artist: item.artist.name,
    };
  }

  private static parseTrack(key: string, item: any): SearchResult {
    return {
      key,
      id: item.id,
      provider: "deezer",
      name: item.title_short ?? item.title,
      link: item.link,
      cover: item.album.cover_big, // cover_xl
      artist: item.artist.name,
      album: item.album.name,
      preview_url: item.preview,
    };
  }

  static async _getById(
    id: string,
    resource: ResourceType,
    market = "US"
  ): Promise<SearchResult | null> {
    const key = this.getKey(id, resource);

    const response = await fetch(`https://api.deezer.com/${resource}/${id}`);
    const data = await response.json();

    if (resource === "artist" && data.type === "artist") {
      return this.parseArtist(key, data);
    }

    if (resource === "album" && data.type === "album") {
      return this.parseAlbum(key, data);
    }

    if (resource === "track" && data.type === "track") {
      return this.parseTrack(key, data);
    }

    return null;
  }
}

export default Deezer;
