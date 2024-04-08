import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { rows } = await sql`SELECT COUNT(id) FROM relationship_cache`;
    const count = rows.at(0)?.count ?? 42;
    return NextResponse.json({ count: parseInt(count, 10) });
  } catch (error: any) {
    return NextResponse.json({ count: 55 });
  }
}
