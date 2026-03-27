import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "price-watcher-web",
    timestamp: new Date().toISOString(),
  });
}
