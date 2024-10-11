import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { AxiomRequest, withAxiom } from "next-axiom";
import { getSourceItemByKey } from "@/util/services";

export const maxDuration = 60;

export const GET = withAxiom(async (req: AxiomRequest) => {
  try {
    const { rows } =
      await sql`SELECT * FROM relationship_cache WHERE spotify LIKE '%track%' OR deezer LIKE '%track%' OR applemusic LIKE '%track%' OR tidal LIKE '%track%' OR youtubemusic LIKE '%track%' ORDER BY created_at DESC LIMIT 50;`;

    const tracks = [];

    let keys: string[] = rows.map(
      (row) =>
        row.spotify ??
        row.appleMusic ??
        row.deezer ??
        row.youtubemusic ??
        row.tidal
    );

    keys = keys.sort(() => Math.random() - 0.5).slice(0, 20);

    const res = await Promise.allSettled(
      keys.map((key) => getSourceItemByKey(key))
    );

    for (let i = 0; i < res.length; i++) {
      const track = res[i];
      if (tracks.length >= 10) break;

      if (track.status === "fulfilled" && track.value != null) {
        tracks.push(track.value);
      }
    }

    return NextResponse.json({ tracks });
  } catch (error: any) {
    req.log.error("get new songs error", {
      error,
    });
    return NextResponse.json({ tracks: [], error: error.message });
  }
});
