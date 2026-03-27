import type { ProductCandidate } from "@/lib/pricing/findLowestPrice";
import type { Platform } from "./types";

function createMockItems(
  platform: Platform,
  keyword: string,
  prices: number[],
): ProductCandidate[] {
  return prices.map((price, index) => ({
    platform,
    title: `${keyword} - ${platform.toUpperCase()} item ${index + 1}`,
    currentPrice: price,
    link: `https://example.com/${platform}/${encodeURIComponent(keyword)}/${index + 1}`,
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

