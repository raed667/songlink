import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { AxiomRequest, withAxiom } from "next-axiom";

export const GET = withAxiom(async (req: AxiomRequest) => {
  try {
    const { rows } = await sql`SELECT COUNT(id) FROM relationship_cache`;
    const count = rows.at(0)?.count ?? 42;
    return NextResponse.json({ count: parseInt(count, 10) });
  } catch (error: any) {
    req.log.error("get count error", {
      error,
    });
    return NextResponse.json({ count: 55 });
  }
});
