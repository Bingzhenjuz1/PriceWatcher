export default function Home() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50">
      <main className="w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white px-8 py-12 shadow-sm">
        <h1 className="text-3xl font-semibold text-zinc-900">Price Watcher</h1>
        <p className="mt-3 text-zinc-600">
          MVP scaffold is ready. Next step is to implement keyword search and
          multi-platform price aggregation.
        </p>
        <div className="mt-6 rounded-lg bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
          Health API: <code>/api/health</code>
        </div>
      </main>
    </div>
  );
}
