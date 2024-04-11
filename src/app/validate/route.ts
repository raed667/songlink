import { findSourceItem } from "@/util/services";
import { SearchResult } from "@/util/services/type";
import { validateLink } from "@/util/validators";
import { LinkValidation } from "@/util/validators/type";
import { NextResponse } from "next/server";
import { withAxiom, AxiomRequest } from "next-axiom";

export const POST = withAxiom(async (req: AxiomRequest) => {
  const body = await req.json();
  const { link } = body;
  if (!link) {
    return NextResponse.json({ error: "'link' is required" }, { status: 400 });
  }

  req.log.info("validate link", {
    link,
  });

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
      if (!source) {
        return NextResponse.json(
          { error: "Sorry, we didn't find the item you're looking for." },
          { status: 404 }
        );
      }
      result.source = source;
    } catch (error: any) {
      req.log.error("validate link error", {
        error,
      });

      return NextResponse.json(
        { error: error.message ?? "Unexpected error occurred" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(result);
});
