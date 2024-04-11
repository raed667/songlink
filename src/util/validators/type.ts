export type ResourceType = "track" | "album" | "artist";

type LinkValidationTrue = {
  isValid: true;
  id: string;
  type: ResourceType;
  provider: Provider;
};
type LinkValidationFalse = {
  isValid: false;
  error: string;
  matches: boolean;
  provider: Provider | null;
};

export type LinkValidation = LinkValidationTrue | LinkValidationFalse;

export type Provider =
  | "spotify"
  | "appleMusic"
  | "deezer"
  | "tidal"
  | "youtubeMusic";
