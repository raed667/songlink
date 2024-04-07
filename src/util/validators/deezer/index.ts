import { NOT_VALID_LINK } from "../common";
import { LinkValidation } from "../type";

type ResourceType = "artist" | "track" | "album";

class DeezerValidator {
  static async validate(url: string): Promise<LinkValidation> {
    try {
      url = url.trim();
      url = url.startsWith("http") ? url : `https://${url}`;
      let urlObj = new URL(url);
      let host = urlObj.host.toLowerCase().replace("www.", "");

      const isURLShortener = Boolean(host === "deezer.page.link");
      if (isURLShortener) {
        const redirectedUrl = await DeezerValidator.getRedirectedUrl(url);
        if (!redirectedUrl) {
          return {
            isValid: false,
            matches: true,
            error: "Unable to resolve URL shortener",
            provider: "deezer",
          };
        } else {
          url = redirectedUrl;
          urlObj = new URL(redirectedUrl);
          host = urlObj.host.toLowerCase().replace("www.", "");
        }
      }

      const isDeezer = Boolean(host === "deezer.com");

      if (!isDeezer) {
        return {
          isValid: false,
          matches: false,
          error: NOT_VALID_LINK,
          provider: "deezer",
        };
      }

      const type = DeezerValidator.extractResourceType(url);
      if (!DeezerValidator.isSupportedType(type)) {
        return {
          isValid: false,
          matches: true,
          error: `Deezer links of type "${type}" are not supported yet.`,
          provider: "deezer",
        };
      }
      const id = DeezerValidator.extractResourceId(url);
      return { isValid: true, type, id, provider: "deezer" };
    } catch (e: any) {
      return {
        isValid: false,
        matches: false,
        error: e.message ?? "Unknown error",
        provider: "deezer",
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
    const parts = path.split("/") as ResourceType[];

    if (DeezerValidator.isSupportedType(parts[1])) {
      return parts[1];
    }

    if (DeezerValidator.isSupportedType(parts[2])) {
      return parts[2];
    }
    throw new Error("Unable to extract resource type");
  }

  private static extractResourceId(url: string): string {
    const path = new URL(url).pathname;
    const id = path.split("/").at(-1);
    if (!id || String(id).length === 0) {
      throw new Error("Unable to extract resource id");
    }
    return id;
  }

  private static async getRedirectedUrl(url: string): Promise<string | null> {
    try {
      const response = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
      });
      return response.url;
    } catch (e) {
      return null;
    }
  }
}

export default DeezerValidator;
