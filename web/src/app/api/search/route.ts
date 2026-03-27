import { NextResponse } from "next/server";
import { z } from "zod";
import { searchByKeyword } from "@/lib/search/searchService";

const searchRequestSchema = z.object({
  keyword: z.string().trim().min(1, "keyword is required"),
});

const RATE_WINDOW_MS = 60 * 1000;
const RATE_LIMIT = 10;
const REQUEST_LOG = new Map<string, number[]>();

function getClientKey(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  return "local";
}

function hitRateLimit(clientKey: string): boolean {
  const now = Date.now();
  const bucket = REQUEST_LOG.get(clientKey) ?? [];
  const recent = bucket.filter((ts) => now - ts <= RATE_WINDOW_MS);
  recent.push(now);
  REQUEST_LOG.set(clientKey, recent);
  return recent.length > RATE_LIMIT;
}

export async function POST(request: Request) {
  const clientKey = getClientKey(request);
  if (hitRateLimit(clientKey)) {
    return NextResponse.json(
      { ok: false, error: "请求过于频繁，请稍后再试" },
      { status: 429 },
    );
  }

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
