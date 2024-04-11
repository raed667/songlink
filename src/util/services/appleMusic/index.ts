import { kv } from "@vercel/kv";
import { ResourceType } from "@/util/validators/type";
import { backOff } from "exponential-backoff";
import { SearchParams, SearchResult } from "../type";

class AppleMusic {
  public static _name: "appleMusic";

  static async search(type: ResourceType, params: SearchParams, market = "US") {
    return await backOff(() => AppleMusic._search(type, params, market), {
      numOfAttempts: 5,
      maxDelay: 3500,
    });
  }

  static async _search(
    type: ResourceType,
    params: SearchParams,
    market = "US"
  ): Promise<SearchResult | null> {
    if (type === "artist" && params.artist_name != undefined) {
      return AppleMusic.search_artist(params.artist_name, market);
    }

    if (type === "album") {
      return AppleMusic.search_album(
        params.artist_name ?? "",
        params.album_name ?? "",
        market
      );
    }

    if (type === "track") {
      return AppleMusic.search_track(
        params.track_name ?? "",
        params.artist_name ?? "",
        params.album_name ?? "",
        market
      );
    }

    return null; // should never happen
  }

  static async search_track(
    track_name: string,
    artist_name: string,
    album_name: string,
    market = "US"
  ): Promise<SearchResult | null> {
    const params = new URLSearchParams();
    params.set("term", `${track_name} ${artist_name} ${album_name}`);
    params.set("entity", "musicTrack");
    params.set("country", market);
    params.set("media", "music");
    params.set("explicit", "Yes");

    const response = await fetch(
      `https://itunes.apple.com/search?${params.toString()}`
    );

    const data = await response.json();
    const item = data.results[0];
    const key = this.getKey(`${item.collectionId}`, "track");
    const value = this.parseTrack(key, item);
    await kv.set(key, JSON.stringify(value));
    return value;
  }

  static async search_album(
    artist_name: string,
    album_name: string,
    market = "US"
  ): Promise<SearchResult | null> {
    const params = new URLSearchParams();
    params.set("term", `${album_name} ${artist_name}`);
    params.set("entity", "album");
    params.set("country", market);
    params.set("media", "music");
    params.set("explicit", "Yes");

    const response = await fetch(
      `https://itunes.apple.com/search?${params.toString()}`
    );

    const data = await response.json();

    const item = data.results[0];
    const key = this.getKey(`${item.collectionId}`, "album");
    const value = this.parseAlbum(key, item);
    await kv.set(key, JSON.stringify(value));
    return value;
  }

  static async search_artist(
    artist_name: string,
    market = "US"
  ): Promise<SearchResult | null> {
    const params = new URLSearchParams();
    params.set("term", artist_name);
    params.set("entity", "musicArtist"); // musicTrack, album
    params.set("country", market);
    params.set("media", "music");
    params.set("explicit", "Yes");

    const response = await fetch(
      `https://itunes.apple.com/search?${params.toString()}`
    );

    const data = await response.json();

    const item = data.results[0];
    const key = this.getKey(`${item.artistId}`, "artist");
    const value = this.parseArtist(key, item);
    await kv.set(key, JSON.stringify(value));
    return value;
  }

  static getKey(id: string, type: ResourceType) {
    return `appleMusic_${type}_${id}`;
  }

  static async getById(
    id: string,
    type: ResourceType,
    market = "FR"
  ): Promise<SearchResult | null> {
    const key = this.getKey(id, type);
    const cached = await kv.get(key);
    if (cached) {
      // TODO validate cache
      return { ...cached, cache: true } as SearchResult;
    }
    const resource = await backOff(
      () => AppleMusic._getById(id, type, market),
      {
        maxDelay: 3500,
        numOfAttempts: 5,
      }
    );
    if (resource === null) return null;

    await kv.set(key, JSON.stringify(resource));
    return { ...resource, cache: false };
  }

  private static parseArtist(key: string, item: any): SearchResult {
    return {
      key,
      id: `${item.artistId}`,
      provider: "appleMusic",
      name: item.artistName,
      link: item.artistLinkUrl,
      cover: undefined,
    };
  }

  private static parseAlbum(key: string, item: any): SearchResult {
    return {
      key,
      id: `${item.collectionId}`,
      provider: "appleMusic",
      name: item.collectionName,
      link: item.collectionViewUrl,
      cover: item.artworkUrl100,
      artist: item.artistName,
    };
  }

  private static parseTrack(key: string, item: any): SearchResult {
    return {
      key,
      id: `${item.collectionId}`,
      provider: "appleMusic",
      name: item.trackName,
      link: item.trackViewUrl,
      cover: item.artworkUrl100,
      artist: item.artistName,
      album: item.collectionName,
      preview_url: item.previewUrl,
    };
  }

  static async _getById(
    id: string,
    resource: ResourceType,
    market = "US"
  ): Promise<SearchResult | null> {
    const key = this.getKey(id, resource);

    const response = await fetch(`https://itunes.apple.com/lookup?id=${id}`);
    const data = await response.json();

    if (data.errorMessage) {
      throw new Error(data.errorMessage);
    }

    if (
      data.resultCount < 1 ||
      !Array.isArray(data.results) ||
      data.results.length < 1
    ) {
      return null;
    }
    const item = data.results[0];

    if (resource === "artist" && item.wrapperType === "artist") {
      return this.parseArtist(key, item);
    }

    if (resource === "album" && item.collectionType === "Album") {
      return this.parseAlbum(key, item);
    }

    if (resource === "track" && item.wrapperType === "track") {
      return this.parseTrack(key, item);
    }

    return null;
  }
}

export default AppleMusic;
