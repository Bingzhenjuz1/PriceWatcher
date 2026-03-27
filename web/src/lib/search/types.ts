import type { ProductCandidate } from "@/lib/pricing/findLowestPrice";

export type Platform = ProductCandidate["platform"];

export type SearchRequest = {
  keyword: string;
};

export type PlatformFetchStatus = {
  status: "ok" | "empty" | "blocked" | "error";
  reason?: string;
};

export type SearchResult = {
  keyword: string;
  fetchedAt: string;
  source: "live" | "cache" | "stale-cache" | "mock";
  lowest: ProductCandidate | null;
  byPlatform: Record<Platform, ProductCandidate[]>;
  platformStatus: Record<Platform, PlatformFetchStatus>;
  totalCandidates: number;
};
