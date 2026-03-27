import type { ProductCandidate } from "@/lib/pricing/findLowestPrice";

export type Platform = ProductCandidate["platform"];

export type SearchRequest = {
  keyword: string;
};

export type SearchResult = {
  keyword: string;
  fetchedAt: string;
  lowest: ProductCandidate | null;
  byPlatform: Record<Platform, ProductCandidate[]>;
  totalCandidates: number;
};

