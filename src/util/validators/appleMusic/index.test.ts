import { expect, it, describe } from "vitest";

import AppleMusicValidator from ".";
import { NOT_VALID_LINK } from "../common";

describe("Apple Music URL validator", () => {
  it.each(["song", "album", "artist"])(
    "should return true for valid %s link",
    (resource) => {
      expect(
        AppleMusicValidator.validate(
          `https://music.apple.com/${resource}/some-name/123456789`
        )
      ).resolves.toStrictEqual({
        id: "123456789",
        isValid: true,
        provider: "appleMusic",
        type: resource === "song" ? "track" : resource,
      });
    }
  );

  it.each(["song", "album", "artist"])(
    "should return true for valid %s link (embed)",
    (resource) => {
      expect(
        AppleMusicValidator.validate(
          `https://embed.music.apple.com/${resource}/some-name/123456789`
        )
      ).resolves.toStrictEqual({
        id: "123456789",
        isValid: true,
        provider: "appleMusic",
        type: resource === "song" ? "track" : resource,
      });
    }
  );

  it.each(["song", "album", "artist"])(
    "should return true for valid %s link (no http)",
    (resource) => {
      expect(
        AppleMusicValidator.validate(
          `music.apple.com/${resource}/some-name/123456789`
        )
      ).resolves.toStrictEqual({
        id: "123456789",
        isValid: true,
        provider: "appleMusic",
        type: resource === "song" ? "track" : resource,
      });
    }
  );

  it.each(["song", "album", "artist"])(
    "should return true for valid %s link (region)",
    (resource) => {
      expect(
        AppleMusicValidator.validate(
          `music.apple.com/xyz/${resource}/some-name/123456789`
        )
      ).resolves.toStrictEqual({
        id: "123456789",
        isValid: true,
        provider: "appleMusic",
        type: resource === "song" ? "track" : resource,
      });
    }
  );

  it("should return song id for album link with song id", () => {
    expect(
      AppleMusicValidator.validate(
        `https://music.apple.com/album/some-name/123456789?i=987654321`
      )
    ).resolves.toStrictEqual({
      id: "987654321",
      isValid: true,
      provider: "appleMusic",
      type: "track",
    });
  });

  it("should return false for invalid links", () => {
    expect(
      AppleMusicValidator.validate("http://example.com/foo/bar")
    ).resolves.toStrictEqual({
      isValid: false,
      provider: "appleMusic",
      error: NOT_VALID_LINK,
      matches: false,
    });
  });
});
