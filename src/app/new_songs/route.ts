import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { AxiomRequest, withAxiom } from "next-axiom";
import { getSourceItemByKey } from "@/util/services";

export const maxDuration = 60;

export const GET = withAxiom(async (req: AxiomRequest) => {
  const type =
    req.nextUrl.searchParams.get("type") === "album" ? "%album%" : "%track%";
  try {
    const { rows } =
      await sql`SELECT * FROM relationship_cache WHERE spotify LIKE ${type} OR deezer LIKE ${type} OR applemusic LIKE ${type} OR tidal LIKE ${type} OR youtubemusic LIKE ${type} ORDER BY created_at DESC LIMIT 50;`;

    const results = [];

    let keys: string[] = rows.map(
      (row) =>
        row.spotify ??
        row.appleMusic ??
        row.deezer ??
        row.youtubemusic ??
        row.tidal
    );

    keys = keys.sort(() => Math.random() - 0.5);

    const res = await Promise.allSettled(
      keys.map((key) => getSourceItemByKey(key))
    );

    for (let i = 0; i < res.length; i++) {
      const result = res[i];
      if (results.length >= 20) break;

      if (result.status === "fulfilled" && result.value != null) {
        results.push(result.value);
      }
    }

    return NextResponse.json({ type: type.replaceAll("%", ""), results });
  } catch (error: any) {
    req.log.error("get new songs error", {
      error,
    });
    return NextResponse.json({ type, results: [], error: error.message });
  }
});
