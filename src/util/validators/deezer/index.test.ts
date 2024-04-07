import { expect, it, describe } from "vitest";

import DeezerValidator from ".";
import { NOT_VALID_LINK } from "../common";

describe("Deezer URL validator", () => {
  it.each(["track", "album", "artist"])(
    "should return true for valid %s link",
    (resource) => {
      expect(
        DeezerValidator.validate(`https://www.deezer.com/${resource}/123456789`)
      ).resolves.toStrictEqual({
        id: "123456789",
        isValid: true,
        provider: "deezer",
        type: resource,
      });
    }
  );

  it.each(["track", "album", "artist"])(
    "should return true for valid %s link (region)",
    (resource) => {
      expect(
        DeezerValidator.validate(
          `https://www.deezer.com/us/${resource}/123456789`
        )
      ).resolves.toStrictEqual({
        id: "123456789",
        isValid: true,
        provider: "deezer",
        type: resource,
      });
    }
  );

  it.each(["track", "album", "artist"])(
    "should return true for valid %s link (no http)",
    (resource) => {
      expect(
        DeezerValidator.validate(`deezer.com/us/${resource}/123456789`)
      ).resolves.toStrictEqual({
        id: "123456789",
        isValid: true,
        provider: "deezer",
        type: resource,
      });
    }
  );

  it("should return true for valid %s short link", () => {
    expect(
      DeezerValidator.validate(`https://deezer.page.link/YG38kCsqHRVU43V79`)
    ).resolves.toStrictEqual({
      id: "13191",
      isValid: true,
      provider: "deezer",
      type: "artist",
    });
  });

  it("should return false for invalid links", () => {
    expect(
      DeezerValidator.validate("http://example.com/foo/bar")
    ).resolves.toStrictEqual({
      isValid: false,
      provider: "deezer",
      error: NOT_VALID_LINK,
      matches: false,
    });
  });
});
