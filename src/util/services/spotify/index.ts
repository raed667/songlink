import { kv } from "@vercel/kv";
import { backOff } from "exponential-backoff";
import { SearchParams, SearchResult } from "../type";
import { ResourceType } from "@/util/validators/type";

class Spotify {
  public static _name: "spotify";

  static async search(type: ResourceType, params: SearchParams, market = "US") {
    return await backOff(() => Spotify._search(type, params, market), {
      numOfAttempts: 5,
      maxDelay: 3500,
    });
  }

  static async _search(
    type: ResourceType,
    params: SearchParams,
    market = "US"
  ): Promise<SearchResult | null> {
    const token = await this.getAuthToken();
    const q = new URLSearchParams();
    let query = "";
    if (params.track_name) query += params.track_name;
    if (params.artist_name) query += " " + params.artist_name;
    if (params.album_name) query += " " + params.album_name;
    q.set("q", query);
    q.set("type", type);
    q.set("market", market);
    q.set("limit", "1");
    q.set("include_external", "audio");

    const response = await fetch(
      `https://api.spotify.com/v1/search?${q.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const result = await response.json();

    if (type === "artist" && result?.artists?.items.length > 0) {
      const item = result.artists.items[0];
      const key = this.getKey(item.id, "artist");
      const value = this.parseArtist(key, item);
      await kv.set(key, JSON.stringify(value));
      return value;
    }

    if (type === "album" && result?.albums?.items?.length > 0) {
      const item = result.albums.items[0];
      const key = this.getKey(item.id, "album");
      const value = this.parseAlbum(key, item);
      await kv.set(key, JSON.stringify(value));
      return value;
    }
    if (type === "track" && result?.tracks?.items?.length > 0) {
      const item = result.tracks.items[0];
      const key = this.getKey(item.id, "track");
      const value = this.parseTrack(key, item);
      await kv.set(key, JSON.stringify(value));
      return value;
    }

    return null;
  }

  private static async getAuthToken(): Promise<string> {
    const token = await kv.get("spotify_access_token");
    if (token) return String(token);

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }),
    });
    if (response.status !== 200) {
      const error = await response.text();
      throw new Error("Failed to get Spotify token: " + error);
    }
    const data = await response.json();

    await kv.setex(
      "spotify_access_token",
      data.expires_in - 1,
      data.access_token
    );

    return data.access_token as string;
  }

  static getKey(id: string, type: ResourceType) {
    return `spotify_${type}_${id}`;
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

    const resource = await backOff(() => Spotify._getById(id, type, market), {
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
      provider: "spotify",
      name: item.name,
      link: item.external_urls.spotify,
      cover: item.images[0]?.url,
    };
  }

  private static parseAlbum(key: string, item: any): SearchResult {
    return {
      key,
      id: item.id,
      provider: "spotify",
      name: item.name,
      link: item.external_urls.spotify,
      cover: item.images[0]?.url,
      artist: item.artists[0].name,
    };
  }

  private static parseTrack(key: string, item: any): SearchResult {
    return {
      key,
      id: item.id,
      provider: "spotify",
      name: item.name,
      link: item.external_urls.spotify,
      cover: item.album.images[0]?.url,
      artist: item.artists[0].name,
      album: item.album.name,
      preview_url: item.preview_url,
    };
  }

  private static async _getById(
    id: string,
    type: ResourceType,
    market = "US"
  ): Promise<SearchResult | null> {
    const token = await this.getAuthToken();
    const response = await fetch(
      `https://api.spotify.com/v1/${type}s/${id}?market=${market}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const key = this.getKey(id, type);

    const data = await response.json();
    if (type === "artist" && data.type === "artist") {
      return this.parseArtist(key, data);
    }

    if (type === "album" && data.type === "album") {
      return this.parseAlbum(key, data);
    }

    if (type === "track" && data.type === "track") {
      return this.parseTrack(key, data);
    }

    return null;
  }
}

export default Spotify;
