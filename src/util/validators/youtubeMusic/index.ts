import { NOT_VALID_LINK } from "../common";
import { LinkValidation } from "../type";

type ResourceType = "track" | "artist" | "playlist";

class YoutubeMusicValidator {
  static async validate(url: string): Promise<LinkValidation> {
    try {
      url = url.trim();
      url = url.startsWith("http") ? url : `https://${url}`;
      const urlObj = new URL(url);
      const host = urlObj.host.toLowerCase();
      const isYoutubeMusic = host === "music.youtube.com";

      if (!isYoutubeMusic) {
        return {
          isValid: false,
          matches: false,
          error: NOT_VALID_LINK,
          provider: "youtubeMusic",
        };
      }

      const type = YoutubeMusicValidator.extractResourceType(url);
      console.log(type);
      if (!YoutubeMusicValidator.isSupportedType(type)) {
        return {
          isValid: false,
          matches: true,
          error: `Youtube Music links of type "${type}" are not supported yet.`,
          provider: "youtubeMusic",
        };
      }

      const id = YoutubeMusicValidator.extractResourceId(url);
      return { isValid: true, type, id, provider: "youtubeMusic" };
    } catch (e: any) {
      return {
        isValid: false,
        matches: false,
        error: e.message ?? "Unknown error",
        provider: "youtubeMusic",
      };
    }
  }

  private static isSupportedType(type: string): type is "track" | "artist" {
    return type === "track" || type === "artist";
  }

  private static extractResourceType(url: string): ResourceType {
    const { pathname } = new URL(url);
    const parts = pathname.split("/");

    if (parts[1] === "channel") return "artist";

    if (parts[1] === "playlist") return "playlist";

    if (parts[1] === "watch") return "track";

    throw new Error("Unable to extract resource type");
  }

  private static extractResourceId(url: string): string {
    const { pathname, searchParams } = new URL(url);
    const parts = pathname.split("/");

    const resourceType = YoutubeMusicValidator.extractResourceType(url);

    // if (resourceType === "album" && searchParams.get("list")) {
    //   return searchParams.get("list") as string;
    // }

    if (resourceType === "track" && searchParams.get("v")) {
      return searchParams.get("v") as string;
    }

    if (resourceType === "artist" && parts[1] === "channel" && parts[2]) {
      return parts[2];
    }

    throw new Error(`Unable to extract id for resource type "${resourceType}"`);
  }
}

export default YoutubeMusicValidator;
