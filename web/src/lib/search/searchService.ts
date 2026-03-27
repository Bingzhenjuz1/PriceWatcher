import {
  findLowestPrice,
  type ProductCandidate,
} from "../pricing/findLowestPrice";
import { fetchPlatformCandidates } from "./liveAdapters";
import type { SearchResult } from "./types";

const CACHE_TTL_MS = 2 * 60 * 1000;
const STALE_TTL_MS = 30 * 60 * 1000;
type CacheEntry = { data: SearchResult; createdAt: number };
const SEARCH_CACHE = new Map<string, CacheEntry>();

function topThree(items: ProductCandidate[]): ProductCandidate[] {
  return [...items].sort((a, b) => a.currentPrice - b.currentPrice).slice(0, 3);
}

export async function searchByKeyword(keyword: string): Promise<SearchResult> {
  const cacheKey = keyword.trim().toLowerCase();
  const now = Date.now();
  const cached = SEARCH_CACHE.get(cacheKey);
  if (cached && now - cached.createdAt <= CACHE_TTL_MS) {
    return {
      ...cached.data,
      source: "cache",
      fetchedAt: new Date().toISOString(),
    };
  }

  const [taobaoResult, jdResult, pddResult] = await Promise.all([
    fetchPlatformCandidates("taobao", keyword),
    fetchPlatformCandidates("jd", keyword),
    fetchPlatformCandidates("pdd", keyword),
  ]);

  const byPlatform = {
    taobao: topThree(taobaoResult.items),
    jd: topThree(jdResult.items),
    pdd: topThree(pddResult.items),
  };

  const platformStatus = {
    taobao: taobaoResult.status,
    jd: jdResult.status,
    pdd: pddResult.status,
  };

  const merged = [...byPlatform.taobao, ...byPlatform.jd, ...byPlatform.pdd];
  const source =
    process.env.NODE_ENV === "test" || process.env.SEARCH_DATA_MODE === "mock"
      ? "mock"
      : "live";
  const liveResult: SearchResult = {
    keyword,
    fetchedAt: new Date().toISOString(),
    source,
    lowest: findLowestPrice(merged),
    byPlatform,
    platformStatus,
    totalCandidates: merged.length,
  };

  if (liveResult.totalCandidates > 0) {
    SEARCH_CACHE.set(cacheKey, { data: liveResult, createdAt: now });
    return liveResult;
  }

  if (cached && now - cached.createdAt <= STALE_TTL_MS) {
    return {
      ...cached.data,
      source: "stale-cache",
      fetchedAt: new Date().toISOString(),
      platformStatus: {
        taobao: { status: "blocked", reason: "实时抓取失败，已回退到缓存结果" },
        jd: { status: "blocked", reason: "实时抓取失败，已回退到缓存结果" },
        pdd: { status: "blocked", reason: "实时抓取失败，已回退到缓存结果" },
      },
    };
  }

  return liveResult;
}
