export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-200" />
            <div className="space-y-1.5">
              <div className="h-5 w-48 rounded-md bg-slate-200" />
              <div className="h-3 w-72 rounded-md bg-slate-100" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-32 rounded-lg bg-slate-200" />
            <div className="h-8 w-24 rounded-lg bg-slate-100" />
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-11 rounded-xl bg-slate-100 border border-slate-200/70"
            />
          ))}
        </div>
      </div>

      {/* Filter Bar Skeleton */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-[1600px] mx-auto space-y-3">
          <div className="h-10 w-full max-w-2xl rounded-xl bg-slate-100" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-7 w-28 rounded-full bg-slate-100" />
            ))}
          </div>
        </div>
      </div>

      {/* Split Workspace Skeleton */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex gap-6">
        <div className="hidden lg:block w-[360px] shrink-0 space-y-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-white border border-slate-200 p-4 space-y-2"
            >
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="h-4 w-48 rounded bg-slate-200" />
              <div className="h-3 w-full rounded bg-slate-100" />
            </div>
          ))}
        </div>
        <div className="flex-1 space-y-4">
          <div className="h-14 rounded-2xl bg-white border border-slate-200" />
          <div className="h-[680px] max-w-[210mm] mx-auto rounded-2xl bg-white border border-slate-200 p-8 space-y-5">
            <div className="h-8 w-2/3 rounded-lg bg-slate-200" />
            <div className="h-16 w-full rounded-xl bg-slate-100" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 w-full rounded-xl bg-slate-100" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
