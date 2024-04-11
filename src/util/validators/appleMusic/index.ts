import { NOT_VALID_LINK } from "../common";
import { LinkValidation } from "../type";

type ResourceType = "album" | "song" | "artist";

class AppleMusicValidator {
  static async validate(url: string): Promise<LinkValidation> {
    try {
      url = url.trim();
      url = url.startsWith("http") ? url : `https://${url}`;
      const urlObj = new URL(url);
      const host = urlObj.host.toLowerCase();

      const isAppleMusic =
        host === "music.apple.com" || host === "embed.music.apple.com";

      if (!isAppleMusic)
        return {
          isValid: false,
          matches: false,
          error: NOT_VALID_LINK,
          provider: "appleMusic",
        };

      const resourceType = AppleMusicValidator.extractResourceType(url);
      if (!AppleMusicValidator.isSupportedType(resourceType)) {
        return {
          isValid: false,
          matches: true,
          error: `Apple Music links of type "${resourceType}" are not supported yet.`,
          provider: "appleMusic",
        };
      }

      const id = AppleMusicValidator.extractResourceId(url);
      const type = resourceType === "song" ? "track" : resourceType;

      if (type === "album" && urlObj.searchParams.get("i")) {
        const songId = urlObj.searchParams.get("i");
        if (songId) {
          return {
            isValid: true,
            type: "track",
            id: songId,
            provider: "appleMusic",
          };
        } else {
          return {
            isValid: false,
            matches: true,
            error: "Unable to extract song id",
            provider: "appleMusic",
          };
        }
      }

      return { isValid: true, type, id, provider: "appleMusic" };
    } catch (e: any) {
      return {
        isValid: false,
        matches: false,
        error: e.message ?? "Unknown error",
        provider: "appleMusic",
      };
    }
  }

  private static isSupportedType(
    type: string
  ): type is "album" | "song" | "artist" {
    return type === "album" || type === "song" || type === "artist";
  }

  private static extractResourceType(url: string): ResourceType | "" {
    const path = new URL(url).pathname;
    const parts = path.split("/") as ResourceType[];

    if (AppleMusicValidator.isSupportedType(parts[1])) {
      return parts[1];
    }

    if (AppleMusicValidator.isSupportedType(parts[2])) {
      return parts[2];
    }

    return parts[2];
  }

  private static extractResourceId(url: string): string {
    const path = new URL(url).pathname;
    const id = path.split("/").pop();
    return id ?? "";
  }
}

export default AppleMusicValidator;
