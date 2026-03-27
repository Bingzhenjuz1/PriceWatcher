"use client";

import { FormEvent, useMemo, useState } from "react";
import type { ProductCandidate } from "@/lib/pricing/findLowestPrice";
import type { Platform, SearchResult } from "@/lib/search/types";

type SearchApiResponse =
  | { ok: true; data: SearchResult }
  | { ok: false; error: string };

const PLATFORM_LABEL: Record<Platform, string> = {
  taobao: "淘宝/天猫",
  jd: "京东",
  pdd: "拼多多",
};

const PLATFORM_ORDER: Platform[] = ["taobao", "jd", "pdd"];

function CandidateCard({ item }: { item: ProductCandidate }) {
  return (
    <li className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="text-base font-medium text-zinc-500">
        {PLATFORM_LABEL[item.platform]}
      </div>
      <div className="mt-2 text-lg text-zinc-900">{item.title}</div>
      <div className="mt-3 text-2xl font-semibold text-emerald-700">
        CNY {item.currentPrice}
      </div>
      <a
        className="mt-4 inline-block text-base text-blue-600 hover:underline"
        href={item.link}
        rel="noreferrer"
        target="_blank"
      >
        打开商品链接
      </a>
    </li>
  );
}

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);

  const platformCards = useMemo(() => {
    if (!result) {
      return [];
    }
    return PLATFORM_ORDER.flatMap((platform) => result.byPlatform[platform]);
  }, [result]);

  async function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = keyword.trim();
    if (!trimmed) {
      setError("请输入关键词后再搜索。");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: trimmed }),
      });
      const data = (await response.json()) as SearchApiResponse;

      if (!response.ok || !data.ok) {
        setResult(null);
        setError(
          data.ok ? "搜索失败，请稍后重试。" : (data.error ?? "搜索失败"),
        );
        return;
      }

      setResult(data.data);
    } catch {
      setResult(null);
      setError("网络异常，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full bg-zinc-50 px-4 py-12">
      <main className="mx-auto w-full max-w-5xl">
        <h1 className="text-4xl font-semibold text-zinc-900 sm:text-5xl">
          PriceWatcher
        </h1>
        <p className="mt-3 text-lg text-zinc-600 sm:text-xl">
          输入关键词，查看淘宝/天猫、京东、拼多多的当前候选价格与最低价。
        </p>

        <form
          className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
          onSubmit={onSearch}
        >
          <label className="mb-3 block text-base font-medium text-zinc-700 sm:text-lg">
            商品关键词
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-base outline-none focus:border-zinc-500 sm:text-lg"
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="例如：iPhone 16 256G"
              value={keyword}
            />
            <button
              className="rounded-lg bg-zinc-900 px-6 py-3 text-base font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 sm:text-lg"
              disabled={loading}
              type="submit"
            >
              {loading ? "搜索中..." : "开始比价"}
            </button>
          </div>
          {error ? <p className="mt-4 text-base text-red-600">{error}</p> : null}
        </form>

        {result ? (
          <section className="mt-8 space-y-5">
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5 sm:p-6">
              <div className="text-base text-emerald-700 sm:text-lg">当前最低价</div>
              {result.lowest ? (
                <>
                  <div className="mt-2 text-2xl font-semibold text-emerald-900 sm:text-3xl">
                    {PLATFORM_LABEL[result.lowest.platform]} - CNY{" "}
                    {result.lowest.currentPrice}
                  </div>
                  <div className="mt-2 text-base text-emerald-800 sm:text-lg">
                    {result.lowest.title}
                  </div>
                </>
              ) : (
                <div className="mt-2 text-base text-emerald-800">
                  当前没有可用候选结果。
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {platformCards.map((item) => (
                <CandidateCard
                  item={item}
                  key={`${item.platform}-${item.link}-${item.currentPrice}`}
                />
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
