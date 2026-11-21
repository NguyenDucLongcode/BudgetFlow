export function WalletSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="rounded-3xl border border-slate-800 bg-[#111827]/70 p-6 space-y-4 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800" />
              <div className="space-y-1.5">
                <div className="h-4 w-28 rounded-md bg-slate-800" />
                <div className="h-3 w-16 rounded-md bg-slate-800/60" />
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-slate-800" />
          </div>

          <div className="pt-3 space-y-2">
            <div className="h-3 w-20 rounded bg-slate-800/50" />
            <div className="h-7 w-44 rounded-lg bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
