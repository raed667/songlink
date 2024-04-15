import { describe, expect, it } from "vitest";

import { validateLink } from ".";

describe("URL validator", () => {
  it("should return true for valid %s link", (resource) => {
    expect(
      validateLink(`https://music.apple.com/artist/some-name/123456789`)
    ).resolves.toStrictEqual({
      id: "123456789",
      isValid: true,
      provider: "appleMusic",
      type: "artist",
    });
  });
});
