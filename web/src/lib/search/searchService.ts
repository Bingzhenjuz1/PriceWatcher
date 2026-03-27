import {
  findLowestPrice,
  type ProductCandidate,
} from "../pricing/findLowestPrice";
import {
  fetchJdCandidates,
  fetchPddCandidates,
  fetchTaobaoCandidates,
} from "./mockAdapters";
import type { SearchResult } from "./types";

function topThree(items: ProductCandidate[]): ProductCandidate[] {
  return [...items].sort((a, b) => a.currentPrice - b.currentPrice).slice(0, 3);
}

export async function searchByKeyword(keyword: string): Promise<SearchResult> {
  const [taobaoRaw, jdRaw, pddRaw] = await Promise.all([
    fetchTaobaoCandidates(keyword),
    fetchJdCandidates(keyword),
    fetchPddCandidates(keyword),
  ]);

  const byPlatform = {
    taobao: topThree(taobaoRaw),
    jd: topThree(jdRaw),
    pdd: topThree(pddRaw),
  };

  const merged = [...byPlatform.taobao, ...byPlatform.jd, ...byPlatform.pdd];

  return {
    keyword,
    fetchedAt: new Date().toISOString(),
    lowest: findLowestPrice(merged),
    byPlatform,
    totalCandidates: merged.length,
  };
}
