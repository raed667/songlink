import { NOT_VALID_LINK } from "../common";
import { LinkValidation } from "../type";

type ResourceType = "album" | "song" | "artist";

class TidalValidator {
  static async validate(url: string): Promise<LinkValidation> {
    try {
      url = url.trim();
      url = url.startsWith("http") ? url : `https://${url}`;
      const urlObj = new URL(url);
      const host = urlObj.host.toLowerCase();
      const isTidal =
        host === "tidal.com" ||
        host === "listen.tidal.com" ||
        host === "embed.tidal.com";

      if (!isTidal)
        return {
          isValid: false,
          matches: false,
          error: NOT_VALID_LINK,
          provider: "tidal",
        };

      const type = TidalValidator.extractResourceType(url);
      if (!TidalValidator.isSupportedType(type)) {
        return {
          isValid: false,
          matches: true,
          error: `Tidal links of type "${type}" are not supported yet.`,
          provider: "tidal",
        };
      }

      const id = TidalValidator.extractResourceId(url);
      return { isValid: true, type, id, provider: "tidal" };
    } catch (e: any) {
      return {
        isValid: false,
        matches: false,
        error: e.message ?? "Unknown error",
        provider: "tidal",
      };
    }
  }

  private static isSupportedType(
    type: string
  ): type is "album" | "track" | "artist" {
    return type === "album" || type === "track" || type === "artist";
  }

  private static extractResourceType(url: string): ResourceType {
    const { pathname, host } = new URL(url);
    const parts = pathname.split("/") as ResourceType[];

    if (host === "embed.tidal.com") {
      const type = parts[1].endsWith("s") ? parts[1].slice(0, -1) : parts[1];
      if (TidalValidator.isSupportedType(type)) {
        return type as ResourceType;
      }
    }

    if (
      (parts[1] as string) === "browse" &&
      TidalValidator.isSupportedType(parts[2])
    ) {
      return parts[2];
    }

    if (TidalValidator.isSupportedType(parts[1])) {
      return parts[1];
    }

    if (TidalValidator.isSupportedType(parts[2])) {
      return parts[2];
    }

    throw new Error("Unable to extract resource type");
  }

  private static extractResourceId(url: string): string {
    const path = new URL(url).pathname;
    const id = path.split("/").pop();
    return id ?? "";
  }
}

export default TidalValidator;
