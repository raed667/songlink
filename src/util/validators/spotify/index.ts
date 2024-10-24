import { NOT_VALID_LINK } from "../common";
import { LinkValidation } from "../type";

type ResourceType =
  | "track"
  | "album"
  | "artist"
  // unsupported types
  | "user"
  | "show"
  | "playlist"
  | "episode";

class SpotifyValidator {
  static async validate(url: string): Promise<LinkValidation> {
    try {
      url = url.trim();
      url = url.startsWith("http") ? url : `https://${url}`;
      const urlObj = new URL(url);
      const host = urlObj.host.toLowerCase().replace("www.", "");

      const isSpotify = Boolean(
        host === "open.spotify.com" || host === "embed.spotify.com"
      );

      if (!isSpotify)
        return {
          isValid: false,
          matches: false,
          error: NOT_VALID_LINK,
          provider: "spotify",
        };

      url = url.replace(/\/intl-\w+\//, "/");

      const resourceType = SpotifyValidator.extractResourceType(url);
      if (!SpotifyValidator.isSupportedType(resourceType)) {
        return {
          isValid: false,
          matches: true,
          error: `Spotify links of type "${resourceType}" are not supported yet.`,
          provider: "spotify",
        };
      }

      const id = SpotifyValidator.extractResourceId(url);
      return { isValid: true, type: resourceType, id, provider: "spotify" };
    } catch (e: any) {
      return {
        isValid: false,
        matches: false,
        error: e.message ?? "Unknown error",
        provider: "spotify",
      };
    }
  }

  private static isSupportedType(
    type: string
  ): type is "track" | "album" | "artist" {
    return type === "track" || type === "album" || type === "artist";
  }

  private static extractResourceType(url: string): ResourceType {
    const path = new URL(url).pathname;
    const resourceType = path.split("/")[1];
    if (resourceType?.startsWith("intl-")) {
      return path.split("/")[2] as ResourceType;
    }
    return resourceType as ResourceType;
  }

  private static extractResourceId(url: string): string {
    const path = new URL(url).pathname;
    const id = path.split("/")[2];
    if (!id || String(id).length === 0) {
      throw new Error("Unable to extract resource id");
    }
    return id;
  }
}

export default SpotifyValidator;
