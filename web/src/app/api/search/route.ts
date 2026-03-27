import { NextResponse } from "next/server";
import { z } from "zod";
import { searchByKeyword } from "@/lib/search/searchService";

const searchRequestSchema = z.object({
  keyword: z.string().trim().min(1, "keyword is required"),
});

const RATE_WINDOW_MS = 60 * 1000;
const RATE_LIMIT = 30;
const REQUEST_LOG = new Map<string, number[]>();

function getClientKey(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  return "local";
}

function getRateLimitState(clientKey: string): {
  limited: boolean;
  retryAfterSec: number;
} {
  const now = Date.now();
  const bucket = REQUEST_LOG.get(clientKey) ?? [];
  const recent = bucket.filter((ts) => now - ts <= RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    const oldest = recent[0] ?? now;
    const retryAfterSec = Math.max(
      1,
      Math.ceil((RATE_WINDOW_MS - (now - oldest)) / 1000),
    );
    REQUEST_LOG.set(clientKey, recent);
    return { limited: true, retryAfterSec };
  }
  recent.push(now);
  REQUEST_LOG.set(clientKey, recent);
  return { limited: false, retryAfterSec: 0 };
}

export async function POST(request: Request) {
  const clientKey = getClientKey(request);
  const limitState = getRateLimitState(clientKey);
  if (limitState.limited) {
    return NextResponse.json(
      {
        ok: false,
        error: `请求过于频繁，请约 ${limitState.retryAfterSec} 秒后再试`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(limitState.retryAfterSec),
        },
      },
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
