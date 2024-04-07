import { findSourceItem } from "@/util/services";
import AppleMusic from "@/util/services/appleMusic";
import { SearchResult } from "@/util/services/type";
import { validateLink } from "@/util/validators";
import { LinkValidation } from "@/util/validators/type";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { link } = body;
  if (!link) {
    return NextResponse.json({ error: "'link' is required" }, { status: 400 });
  }
  const result: {
    validation: LinkValidation | null;
    source: SearchResult | null;
  } = {
    validation: null,
    source: null,
  };
  const validation = await validateLink(link);
  result.validation = validation;

  if (validation.isValid) {
    try {
      const source = await findSourceItem(
        validation.id,
        validation.type,
        validation.provider
      );
      result.source = source;
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message ?? "Unexpected error occurred" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(result);
}
