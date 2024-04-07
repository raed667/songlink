import { expect, it, describe } from "vitest";

import SpotifyValidator from ".";
import { NOT_VALID_LINK } from "../common";

describe("Spotify URL validator", () => {
  it.each(["track", "album", "artist"])(
    "should return true for valid %s link",
    (resource) => {
      expect(
        SpotifyValidator.validate(`https://open.spotify.com/${resource}/abc123`)
      ).resolves.toStrictEqual({
        id: "abc123",
        isValid: true,
        type: resource,
        provider: "spotify",
      });
    }
  );

  it.each(["track", "album", "artist"])(
    "should return true for valid %s link (no http)",
    (resource) => {
      expect(
        SpotifyValidator.validate(`open.spotify.com/${resource}/abc123`)
      ).resolves.toStrictEqual({
        id: "abc123",
        isValid: true,
        type: resource,
        provider: "spotify",
      });
    }
  );

  it.each(["track", "album", "artist"])(
    "should return true for valid %s link (www)",
    (resource) => {
      expect(
        SpotifyValidator.validate(
          `https://www.open.spotify.com/${resource}/abc123`
        )
      ).resolves.toStrictEqual({
        id: "abc123",
        isValid: true,
        type: resource,
        provider: "spotify",
      });
    }
  );

  it.each(["track", "album", "artist"])(
    "should return true for valid %s link (http)",
    (resource) => {
      expect(
        SpotifyValidator.validate(
          `http://www.open.spotify.com/${resource}/abc123`
        )
      ).resolves.toStrictEqual({
        id: "abc123",
        isValid: true,
        type: resource,
        provider: "spotify",
      });
    }
  );

  it("should return false for invalid links", () => {
    expect(
      SpotifyValidator.validate("http://example.com/foo/bar")
    ).resolves.toStrictEqual({
      isValid: false,
      error: NOT_VALID_LINK,
      provider: "spotify",
      matches: false,
    });
  });

  it.each(["user", "show", "playlist", "episode"])(
    "should return false for unsupported links",
    (resource) => {
      expect(
        SpotifyValidator.validate(`https://open.spotify.com/${resource}/abc123`)
      ).resolves.toStrictEqual({
        error: `Spotify links of type "${resource}" are not supported yet.`,
        isValid: false,
        provider: "spotify",
        matches: true,
      });
    }
  );
});
