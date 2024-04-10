import { kv } from "@vercel/kv";
import { ResourceType } from "@/util/validators/type";

import { SearchParams, SearchResult } from "../type";

class Tidal {
  public static _name: "tidal";

  static async search(
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
    q.set("query", query);
    q.set("countryCode", market);
    q.set("limit", "1");

    const response = await fetch(
      `https://openapi.tidal.com/search?${q.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/vnd.tidal.v1+json",
        },
      }
    );
    const result = await response.json();

    if (type === "artist" && result?.artists?.length > 0) {
      const item = result.artists[0]?.resource;
      const key = this.getKey(item.id, "artist");
      const value = this.parseArtist(key, item);
      await kv.set(key, JSON.stringify(value));
      return value;
    }

    if (type === "album" && result?.albums?.length > 0) {
      const item = result.albums[0]?.resource;
      const key = this.getKey(item.id, "album");
      const value = this.parseAlbum(key, item);
      await kv.set(key, JSON.stringify(value));
      return value;
    }

    if (type === "track" && result?.tracks?.length > 0) {
      const item = result.tracks[0]?.resource;
      const key = this.getKey(item.id, "track");
      const value = this.parseTrack(key, item);
      await kv.set(key, JSON.stringify(value));
      return value;
    }

    return null;
  }

  private static async getAuthToken(): Promise<string> {
    const token = await kv.get("tidal_access_token");
    if (token) return String(token);

    const response = await fetch("https://auth.tidal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.TIDAL_CLIENT_ID}:${process.env.TIDAL_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }),
    });
    if (response.status !== 200) {
      const error = await response.text();
      throw new Error("Failed to get tidal token: " + error);
    }
    const data = await response.json();

    await kv.set("tidal_access_token", data.access_token, {
      ex: data.expires_in ?? 3600,
    });

    return data.access_token;
  }

  static getKey(id: string, type: ResourceType) {
    return `tidal_${type}_${id}`;
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

    const resource = await Tidal._getById(id, type, market);
    if (resource === null) return null;

    await kv.set(key, JSON.stringify(resource));

    return { ...resource, cache: false };
  }

  private static parseArtist(key: string, item: any): SearchResult {
    return {
      key,
      id: item.id,
      provider: "tidal",
      name: item.name,
      link: item.tidalUrl,
      cover: item.picture[0]?.url,
    };
  }

  private static parseAlbum(key: string, item: any): SearchResult {
    return {
      key,
      id: item.id,
      provider: "tidal",
      name: item.title,
      link: item.tidalUrl,
      cover: item.imageCover[0]?.url,
      artist: item.artists[0].name,
    };
  }

  private static parseTrack(key: string, item: any): SearchResult {
    return {
      key,
      id: item.id,
      provider: "tidal",
      name: item.title,
      link: item.tidalUrl,
      cover: item.album.imageCover[0]?.url,
      artist: item.artists[0].name,
      album: item.album.title,
    };
  }

  private static async _getById(
    id: string,
    type: ResourceType,
    market = "US"
  ): Promise<SearchResult | null> {
    const token = await this.getAuthToken();

    const response = await fetch(
      `https://openapi.tidal.com/${type}s/${id}?countryCode=${market}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/vnd.tidal.v1+json",
        },
      }
    );

    const data = await response.json();
    const key = this.getKey(id, type);

    if (
      type === "artist" &&
      data.resource.name &&
      !data.resource.artifactType
    ) {
      return this.parseArtist(key, data.resource);
    }

    if (type === "album" && data.resource.type === "ALBUM") {
      return this.parseAlbum(key, data.resource);
    }

    if (type === "track" && data.resource.artifactType === "track") {
      return this.parseTrack(key, data.resource);
    }

    return null;
  }
}

export default Tidal;
