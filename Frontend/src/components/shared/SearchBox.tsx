import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router";
import { GOLD } from "../../store/constants";
import { useCatalog } from "../../shared/useCatalog";
import { matchScore } from "../../shared/arabic";
import { optimizeImg } from "../../shared/img";

export function SearchBox({ placeholder = "ابحث عن منتج أو فئة...", onDone }: { placeholder?: string; onDone?: () => void }) {
  const navigate = useNavigate();
  const { products } = useCatalog();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const box = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (q.trim().length < 2) return [];
    return products
      .map((p) => ({ p, s: Math.max(matchScore(p.name, q), matchScore(p.category, q) * 0.5, matchScore(p.description || "", q) * 0.3) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 6)
      .map((x) => x.p);
  }, [q, products]);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const finish = () => { setOpen(false); onDone?.(); window.scrollTo(0, 0); };
  const submit = () => {
    if (hi >= 0 && results[hi]) { navigate(`/product/${results[hi].id}`); setQ(""); finish(); return; }
    const t = q.trim();
    navigate(t ? `/products?q=${encodeURIComponent(t)}` : "/products");
    finish();
  };

  return (
    <div ref={box} className="relative w-full" role="search">
      <input
        type="search"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); setHi(-1); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          else if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, results.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, -1)); }
          else if (e.key === "Escape") setOpen(false);
        }}
        placeholder={placeholder}
        aria-label="بحث في المتجر"
        className="w-full rounded-xl py-2.5 pl-10 pr-10 text-white text-sm outline-none placeholder-gray-500"
        style={{ background: "#111", border: "1px solid rgba(212,175,55,0.25)", minHeight: "2.75rem" }}
      />
      <button type="button" aria-label="بحث" onClick={submit} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: GOLD }}>
        <Search size={17} />
      </button>
      {q && (
        <button type="button" aria-label="مسح" onClick={() => { setQ(""); setOpen(false); }} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <X size={16} />
        </button>
      )}
      {open && q.trim().length >= 2 && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl shadow-2xl" style={{ background: "#1a1a1a", border: "1px solid rgba(212,175,55,0.25)" }}>
          {results.length === 0 ? (
            <div className="p-4 text-sm text-gray-400">مفيش نتائج لـ "{q}". جرّب كلمة تانية.</div>
          ) : (
            <>
              {results.map((p, i) => (
                <button key={p.id} type="button" onMouseEnter={() => setHi(i)}
                  onClick={() => { navigate(`/product/${p.id}`); setQ(""); finish(); }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-right"
                  style={{ background: hi === i ? "rgba(212,175,55,0.1)" : "transparent", minHeight: "3.25rem" }}>
                  <span className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-white">
                    <img src={optimizeImg(p.image, 96)} alt="" width={44} height={44} className="h-full w-full object-contain" loading="lazy" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-white">{p.name}</span>
                    <span className="block text-xs text-gray-400">{p.category}</span>
                  </span>
                  <span className="shrink-0 text-sm font-black text-white">{p.price} ج.م</span>
                </button>
              ))}
              <button type="button" onClick={submit} className="w-full px-3 py-2.5 text-sm font-bold" style={{ color: GOLD, borderTop: "1px solid rgba(212,175,55,0.15)" }}>
                عرض كل النتائج
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
