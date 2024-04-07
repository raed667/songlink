import { Provider } from "../validators/type";

export type SearchParams = {
  track_name?: string;
  artist_name?: string;
  album_name?: string;
};

type BaseResource = {
  key: string;
  id: string;
  provider: Provider;
  name: string;
  link: string;
  cover?: string;
  cache?: boolean;
};

export type Track = BaseResource & {
  artist: string;
  album?: string;
  preview_url?: string;
};

export type Album = BaseResource & {
  artist: string;
};

export type Artist = BaseResource;

export type SearchResult = Track | Album | Artist;
