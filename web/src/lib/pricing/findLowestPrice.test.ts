import { describe, expect, it } from "vitest";
import { findLowestPrice, type ProductCandidate } from "./findLowestPrice";

describe("findLowestPrice", () => {
  it("returns null when candidates are empty", () => {
    expect(findLowestPrice([])).toBeNull();
  });

  it("returns the candidate with the smallest currentPrice", () => {
    const data: ProductCandidate[] = [
      {
        platform: "jd",
        title: "Phone A 256G",
        currentPrice: 5199,
        link: "https://example.com/jd/a",
      },
      {
        platform: "pdd",
        title: "Phone A 256G",
        currentPrice: 4999,
        link: "https://example.com/pdd/a",
      },
      {
        platform: "taobao",
        title: "Phone A 256G",
        currentPrice: 5099,
        link: "https://example.com/taobao/a",
      },
    ];

    expect(findLowestPrice(data)).toEqual(data[1]);
  });
});
