import { kv } from "@vercel/kv";
import { backOff } from "exponential-backoff";
import YTMusic from "ytmusic-api";
import { SearchParams, SearchResult } from "../type";
import { ResourceType } from "@/util/validators/type";

class YoutubeMusic {
  public static _name: "youtubeMusic";

  static async search(type: ResourceType, params: SearchParams, market = "US") {
    return await backOff(() => YoutubeMusic._search(type, params, market), {
      numOfAttempts: 5,
      maxDelay: 3500,
    });
  }

  static async _search(
    type: ResourceType,
    params: SearchParams,
    market = "US"
  ): Promise<SearchResult | null> {
    let query = "";
    if (params.track_name) query += params.track_name;
    if (params.artist_name) query += " " + params.artist_name;
    if (params.album_name) query += " " + params.album_name;
    const api = new YTMusic();
    await api.initialize();

    if (type === "artist") {
      const results = await api.searchArtists(query);
      const item = results[0];
      if (!item) return null;

      const key = this.getKey(item.artistId, type);
      const value = this.parseArtist(key, item);
      await kv.set(key, JSON.stringify(value));
      return value;
    }

    if (type === "album") {
      const results = await api.searchAlbums(query);
      const item = results[0];
      if (!item) return null;

      const key = this.getKey(item.albumId, type);

      const value = this.parseAlbum(key, item);
      await kv.set(key, JSON.stringify(value));
      return value;
    }

    if (type === "track") {
      const results = await api.searchSongs(query);
      const item = results[0];
      if (!item) return null;

      const key = this.getKey(item.videoId, type);
      const value = this.parseTrack(key, item);
      await kv.set(key, JSON.stringify(value));
      return value;
    }

    return null;
  }

  static getKey(id: string, type: ResourceType) {
    return `youtubeMusic_${type}_${id}`;
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

    const resource = await backOff(
      () => YoutubeMusic._getById(id, type, market),
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
      id: item.artistId,
      provider: "youtubeMusic",
      name: item.name,
      cover: item.thumbnails.at(-1).url,
      link: `https://music.youtube.com/channel/${item.artistId}`,
    };
  }

  private static parseAlbum(key: string, item: any): SearchResult {
    return {
      key,
      id: item.playlistId,
      provider: "youtubeMusic",
      name: item.name,
      cover: item.thumbnails.at(-1).url,
      artist: item.artist.name,
      link: `https://music.youtube.com/playlist?list=${item.playlistId}`,
    };
  }

  private static parseTrack(key: string, item: any): SearchResult {
    return {
      key,
      id: item.videoId,
      provider: "youtubeMusic",
      name: item.name,
      cover: item.thumbnails.at(-1).url,
      artist: item.artist.name,
      link: `https://music.youtube.com/watch?v=${item.videoId}`,
      // item.duration (number in seconds)
      // album: item.album.name,
      // preview_url: item.preview,
    };
  }

  static async _getById(
    id: string,
    resource: ResourceType,
    market = "US"
  ): Promise<SearchResult | null> {
    const key = this.getKey(id, resource);

    const api = new YTMusic();
    await api.initialize();

    if (resource === "artist") {
      const item = await api.getArtist(id);
      return this.parseArtist(key, item);
    }

    // if (resource === "album") {
    //   console.log("album", id);
    //   const item = await api.getAlbum(id);
    //   console.log(item);
    //   return this.parseAlbum(key, item);
    // }

    if (resource === "track") {
      const item = await api.getSong(id);
      return this.parseTrack(key, item);
    }

    return null;
  }
}

export default YoutubeMusic;
