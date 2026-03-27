export type ProductCandidate = {
  platform: "taobao" | "jd" | "pdd";
  title: string;
  currentPrice: number;
  link: string;
};

export function findLowestPrice(
  candidates: ProductCandidate[],
): ProductCandidate | null {
  if (candidates.length === 0) {
    return null;
  }

  return candidates.reduce((lowest, item) => {
    return item.currentPrice < lowest.currentPrice ? item : lowest;
  });
}
