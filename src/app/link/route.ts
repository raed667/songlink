import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { AxiomRequest, withAxiom } from "next-axiom";
import { findRelatedItems, findSourceItem } from "@/util/services";
import { validateLink } from "@/util/validators";

export const maxDuration = 60;

export const GET = withAxiom(async (req: AxiomRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const link = searchParams.get("link");
    const details = searchParams.get("details");

    if (!link) {
      return NextResponse.json(
        {
          status: "error",
          error: "parameter 'link' is required",
        },
        { status: 400 }
      );
    }

    const validation = await validateLink(link);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          status: "error",
          error: validation.error,
        },
        { status: 400 }
      );
    }

    const source = await findSourceItem(
      validation.id,
      validation.type,
      validation.provider
    );

    if (!source) {
      return NextResponse.json(
        {
          status: "error",
          error: "source item not found",
          item: {
            ...validation,
            link,
          },
        },
        { status: 404 }
      );
    }
    const items = await findRelatedItems(source, validation.type);

    const payload: any = {
      status: "success",
      songLink: `https://songlink.cc/${validation.type}/${source.key}`,
    };

    if (details?.toLowerCase() === "true") {
      payload.source = source;
      payload.items = items
        .map((item) => {
          if (item.status === "fulfilled") {
            return item.value;
          }
        })
        .filter(Boolean);
    }

    return NextResponse.json(payload);
  } catch (error: any) {
    req.log.error("get new songs error", {
      error,
    });
    return NextResponse.json({ tracks: [], error: error.message });
  }
});
