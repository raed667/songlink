import { LinkValidation, Provider, ResourceType } from "./type";

import spotify from "./spotify";
import appleMusic from "./appleMusic";
import deezer from "./deezer";
import tidal from "./tidal";
import youtubeMusic from "./youtubeMusic";

const providers = [spotify, appleMusic, deezer, tidal, youtubeMusic];
export const providersList: Provider[] = [
  "spotify",
  "appleMusic",
  "deezer",
  "tidal",
  "youtubeMusic",
] as const;

export const isSupportedProvider = (provider: string): provider is Provider =>
  ["spotify", "appleMusic", "deezer", "tidal", "youtubeMusic"].includes(
    provider
  );

export const isSupportedType = (type: string): type is ResourceType => {
  return type === "track" || type === "album" || type === "artist";
};

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

export const validateLink = async (url: string): Promise<LinkValidation> => {
  if (!isValidUrl(url)) {
    return {
      isValid: false,
      matches: false,
      error: "Invalid URL.",
      provider: null,
    };
  }

  for (const provider of providers) {
    const result = await provider.validate(url);
    if (result.isValid || result.matches) return result;
  }

  return {
    isValid: false,
    matches: false,
    error: "Did not match compatible services.",
    provider: null,
  };
};
