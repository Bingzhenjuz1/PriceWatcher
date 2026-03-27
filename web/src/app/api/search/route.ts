import { NextResponse } from "next/server";
import { z } from "zod";
import { searchByKeyword } from "@/lib/search/searchService";

const searchRequestSchema = z.object({
  keyword: z.string().trim().min(1, "keyword is required"),
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = searchRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "invalid request",
      },
      { status: 400 },
    );
  }

  const result = await searchByKeyword(parsed.data.keyword);
  return NextResponse.json({
    ok: true,
    data: result,
  });
}

