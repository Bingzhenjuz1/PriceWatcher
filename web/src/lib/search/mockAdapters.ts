import type { ProductCandidate } from "@/lib/pricing/findLowestPrice";
import type { Platform } from "./types";

function createMockItems(
  platform: Platform,
  keyword: string,
  prices: number[],
): ProductCandidate[] {
  const encodedKeyword = encodeURIComponent(keyword);
  const platformSearchUrl: Record<Platform, string> = {
    taobao: `https://s.taobao.com/search?q=${encodedKeyword}`,
    jd: `https://search.jd.com/Search?keyword=${encodedKeyword}`,
    pdd: `https://mobile.yangkeduo.com/search_result.html?search_key=${encodedKeyword}`,
  };

  return prices.map((price, index) => ({
    platform,
    title: `${keyword} - ${platform.toUpperCase()} item ${index + 1}`,
    currentPrice: price,
    link: platformSearchUrl[platform],
  }));
}

export async function fetchTaobaoCandidates(
  keyword: string,
): Promise<ProductCandidate[]> {
  return createMockItems("taobao", keyword, [3299, 3199, 3399]);
}

export async function fetchJdCandidates(
  keyword: string,
): Promise<ProductCandidate[]> {
  return createMockItems("jd", keyword, [3259, 3188, 3350]);
}

export async function fetchPddCandidates(
  keyword: string,
): Promise<ProductCandidate[]> {
  return createMockItems("pdd", keyword, [3159, 3129, 3229]);
}
