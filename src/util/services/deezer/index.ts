import { kv } from "@vercel/kv";
import { ResourceType } from "@/util/validators/type";
import { SearchParams, SearchResult } from "../type";

class Deezer {
  public static _name: "deezer";

  static async search(
    type: ResourceType,
    params: SearchParams,
    market = "US"
  ): Promise<SearchResult | null> {
    let q = ``;

    if (params.track_name) {
      q += `track:"${params.track_name}"`;
    }
    if (params.album_name) {
      q += `album:"${params.album_name}"`;
    }
    if (params.artist_name) {
      q += `artist:"${params.artist_name}"`;
    }

    const response = await fetch(
      `https://api.deezer.com/search/${type}?q=${q}`
    );
    const result = await response.json();

    if (!result || !result.data || result.data.length === 0) {
      return null;
    }

    const item = result.data[0];
    const key = this.getKey(item.id, type);

    if (type === "artist" && item.type === "artist") {
      const value = this.parseArtist(key, item);
      await kv.set(key, JSON.stringify(value));
      return value;
    }

    if (type === "album" && item.type === "album") {
      const value = this.parseAlbum(key, item);
      await kv.set(key, JSON.stringify(value));
      return value;
    }

    if (type === "track" && item.type === "track") {
      const value = this.parseTrack(key, item);
      await kv.set(key, JSON.stringify(value));
      return value;
    }

    return null;
  }

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

    const resource = await Deezer._getById(id, type, market);
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
