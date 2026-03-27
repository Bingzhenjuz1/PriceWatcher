import type { ProductCandidate } from "@/lib/pricing/findLowestPrice";
import { chromium } from "playwright-core";
import type { Platform, PlatformFetchStatus } from "./types";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const FETCH_TIMEOUT_MS = 20_000;
const MAX_ATTEMPTS = 2;

type FetchResult = {
  items: ProductCandidate[];
  status: PlatformFetchStatus;
};

function normalizePrice(input: string): number | null {
  const cleaned = input.replace(/[^\d.]/g, "");
  if (!cleaned) {
    return null;
  }
  const value = Number.parseFloat(cleaned);
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }
  return Math.round(value * 100) / 100;
}

function dedupe(items: ProductCandidate[]): ProductCandidate[] {
  const seen = new Set<string>();
  const result: ProductCandidate[] = [];
  for (const item of items) {
    const key = `${item.platform}|${item.link}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeLink(platform: Platform, href: string, keyword: string): string {
  if (!href) {
    return mapFallbackSearchLink(platform, keyword);
  }
  const normalized = href.startsWith("//") ? `https:${href}` : href;
  try {
    const url = new URL(normalized);
    const host = url.hostname.toLowerCase();
    if (platform === "taobao" && /taobao\.com|tmall\.com/.test(host)) return url.toString();
    if (platform === "jd" && /jd\.com/.test(host)) return url.toString();
    if (platform === "pdd" && /pinduoduo\.com|yangkeduo\.com/.test(host)) return url.toString();
    return mapFallbackSearchLink(platform, keyword);
  } catch {
    return mapFallbackSearchLink(platform, keyword);
  }
}

function mapPlatformUrl(platform: Platform, keyword: string): string {
  const encoded = encodeURIComponent(keyword);
  if (platform === "taobao") {
    return `https://s.taobao.com/search?q=${encoded}`;
  }
  if (platform === "jd") {
    return `https://search.jd.com/Search?keyword=${encoded}`;
  }
  return `https://mobile.yangkeduo.com/search_result.html?search_key=${encoded}`;
}

function mapFallbackSearchLink(platform: Platform, keyword: string): string {
  const encoded = encodeURIComponent(keyword);
  if (platform === "taobao") {
    return `https://s.taobao.com/search?q=${encoded}`;
  }
  if (platform === "jd") {
    return `https://search.jd.com/Search?keyword=${encoded}`;
  }
  return `https://mobile.yangkeduo.com/search_result.html?search_key=${encoded}`;
}

async function scrapeByPlaywright(
  platform: Platform,
  keyword: string,
): Promise<FetchResult> {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  try {
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      locale: "zh-CN",
    });
    const page = await context.newPage();
    await page.goto(mapPlatformUrl(platform, keyword), {
      waitUntil: "domcontentloaded",
      timeout: FETCH_TIMEOUT_MS,
    });
    await page.waitForTimeout(2500);

    const pageTitle = await page.title();
    const currentUrl = page.url();
    if (
      /(验证|登录|captcha|risk)/i.test(pageTitle) ||
      /passport|login|verify|captcha/.test(currentUrl)
    ) {
      return {
        items: [],
        status: { status: "blocked", reason: `页面风控或登录拦截: ${pageTitle}` },
      };
    }

    const extracted = await page.evaluate(
      ({ platform, keyword }) => {
        const results: Array<{
          title: string;
          link: string;
          priceText: string;
        }> = [];

        const extractors: Record<string, () => void> = {
          taobao: () => {
            const anchors = Array.from(
              document.querySelectorAll<HTMLAnchorElement>(
                'a[href*="item.taobao.com"], a[href*="detail.tmall.com"]',
              ),
            );
            for (const a of anchors) {
              const card = a.closest("li,div");
              const text = card?.textContent?.replace(/\s+/g, " ") ?? "";
              const priceText =
                text.match(/(?:¥|￥)\s*\d+(?:\.\d{1,2})?/)?.[0] ?? "";
              const title = a.textContent?.trim() ?? "";
              const link = a.href ?? "";
              if (title.length >= 4 && link) {
                results.push({ title, link, priceText });
              }
            }
          },
          jd: () => {
            const anchors = Array.from(
              document.querySelectorAll<HTMLAnchorElement>(
                'a[href*="item.jd.com/"]',
              ),
            );
            for (const a of anchors) {
              const card = a.closest("li,div");
              const text = card?.textContent?.replace(/\s+/g, " ") ?? "";
              const priceText =
                text.match(/(?:¥|￥)\s*\d+(?:\.\d{1,2})?/)?.[0] ?? "";
              const title = a.textContent?.trim() ?? "";
              const link = a.href ?? "";
              if (title.length >= 4 && link) {
                results.push({ title, link, priceText });
              }
            }
          },
          pdd: () => {
            const anchors = Array.from(
              document.querySelectorAll<HTMLAnchorElement>(
                'a[href*="goods.html?goods_id="]',
              ),
            );
            for (const a of anchors) {
              const card = a.closest("li,div");
              const text = card?.textContent?.replace(/\s+/g, " ") ?? "";
              const priceText =
                text.match(/(?:¥|￥)\s*\d+(?:\.\d{1,2})?/)?.[0] ?? "";
              const title = a.textContent?.trim() ?? "";
              const link = a.href ?? "";
              if (title.length >= 4 && link) {
                results.push({ title, link, priceText });
              }
            }
          },
        };

        (extractors[platform] ?? (() => {}))();

        return results.slice(0, 30).map((r) => ({
          ...r,
          keyword,
        }));
      },
      { platform, keyword },
    );

    const mapped = dedupe(
      extracted
        .map((item) => {
          const price = normalizePrice(item.priceText);
          if (price == null) return null;
          return {
            platform,
            title: item.title,
            currentPrice: price,
            link: normalizeLink(platform, item.link, keyword),
          } satisfies ProductCandidate;
        })
        .filter((item): item is ProductCandidate => item != null),
    ).slice(0, 3);

    if (mapped.length === 0) {
      return {
        items: [],
        status: { status: "empty", reason: "未提取到可校验价格" },
      };
    }

    return {
      items: mapped,
      status: { status: "ok" },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return {
      items: [],
      status: { status: "error", reason: message },
    };
  } finally {
    await browser.close();
  }
}

function mockForTest(platform: Platform, keyword: string): FetchResult {
  const searchLink = mapFallbackSearchLink(platform, keyword);
  const basePrice =
    platform === "taobao" ? 3299 : platform === "jd" ? 3259 : 3159;
  const items: ProductCandidate[] = [0, 1, 2].map((index) => ({
    platform,
    title: `${keyword} - ${platform.toUpperCase()} item ${index + 1}`,
    currentPrice: basePrice + index * 30,
    link: searchLink,
  }));
  return {
    items,
    status: { status: "ok", reason: "test-mode mock data" },
  };
}

export async function fetchPlatformCandidates(
  platform: Platform,
  keyword: string,
): Promise<FetchResult> {
  if (process.env.NODE_ENV === "test" || process.env.SEARCH_DATA_MODE === "mock") {
    return mockForTest(platform, keyword);
  }
  let last: FetchResult = { items: [], status: { status: "error", reason: "unknown" } };
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const result = await scrapeByPlaywright(platform, keyword);
    last = result;
    if (result.items.length > 0 || result.status.status === "blocked") {
      return result;
    }
    if (attempt < MAX_ATTEMPTS) {
      await sleep(600 + Math.floor(Math.random() * 700));
    }
  }
  return last;
}
