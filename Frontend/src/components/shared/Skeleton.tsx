export function ProductSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse" style={{ background: "#1A1A1A" }}>
      <div style={{ height: 220, background: "#111" }} />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 rounded" style={{ background: "#222" }} />
        <div className="h-4 w-3/4 rounded" style={{ background: "#222" }} />
        <div className="flex gap-2">
          <div className="h-3 w-12 rounded" style={{ background: "#222" }} />
          <div className="h-3 w-8 rounded" style={{ background: "#222" }} />
        </div>
        <div className="h-5 w-20 rounded" style={{ background: "#222" }} />
        <div className="h-10 w-full rounded-xl" style={{ background: "#222" }} />
      </div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse" style={{ height: 148, background: "#1A1A1A" }}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <div className="w-10 h-10 rounded-xl" style={{ background: "#222" }} />
        <div className="h-4 w-20 rounded" style={{ background: "#222" }} />
        <div className="h-3 w-12 rounded" style={{ background: "#222" }} />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl p-5 animate-pulse" style={{ background: "rgba(26,26,26,0.8)" }}>
            <div className="flex justify-between mb-4">
              <div className="w-11 h-11 rounded-xl" style={{ background: "#222" }} />
              <div className="h-5 w-12 rounded-full" style={{ background: "#222" }} />
            </div>
            <div className="h-8 w-24 rounded mb-1" style={{ background: "#222" }} />
            <div className="h-3 w-16 rounded" style={{ background: "#222" }} />
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-6 animate-pulse" style={{ background: "rgba(26,26,26,0.8)" }}>
        <div className="h-5 w-32 rounded mb-5" style={{ background: "#222" }} />
        <div className="flex items-end gap-2" style={{ height: 160 }}>
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex-1 rounded-t-lg" style={{ background: "#222", height: `${30 + Math.random() * 70}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function OrderSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse" style={{ background: "rgba(26,26,26,0.8)" }}>
      <div className="p-5 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4 py-3" style={{ borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.03)" : "none" }}>
            <div className="h-4 w-20 rounded" style={{ background: "#222" }} />
            <div className="h-4 w-24 rounded" style={{ background: "#222" }} />
            <div className="h-4 w-16 rounded" style={{ background: "#222" }} />
            <div className="h-5 w-14 rounded-full" style={{ background: "#222" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
