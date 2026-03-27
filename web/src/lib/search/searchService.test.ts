import { describe, expect, it } from "vitest";
import { searchByKeyword } from "./searchService";

describe("searchByKeyword", () => {
  it("returns top 3 candidates for each platform and lowest price result", async () => {
    const result = await searchByKeyword("iphone");

    expect(result.keyword).toBe("iphone");
    expect(result.byPlatform.taobao).toHaveLength(3);
    expect(result.byPlatform.jd).toHaveLength(3);
    expect(result.byPlatform.pdd).toHaveLength(3);
    expect(result.totalCandidates).toBe(9);

    expect(result.lowest).not.toBeNull();
    expect(result.lowest?.platform).toBe("pdd");
    expect(result.lowest?.currentPrice).toBe(3129);
  });
});

