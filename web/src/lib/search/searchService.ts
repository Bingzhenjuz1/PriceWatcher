import {
  findLowestPrice,
  type ProductCandidate,
} from "../pricing/findLowestPrice";
import { fetchPlatformCandidates } from "./liveAdapters";
import type { SearchResult } from "./types";

function topThree(items: ProductCandidate[]): ProductCandidate[] {
  return [...items].sort((a, b) => a.currentPrice - b.currentPrice).slice(0, 3);
}

export async function searchByKeyword(keyword: string): Promise<SearchResult> {
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

  return {
    keyword,
    fetchedAt: new Date().toISOString(),
    lowest: findLowestPrice(merged),
    byPlatform,
    platformStatus,
    totalCandidates: merged.length,
  };
}
