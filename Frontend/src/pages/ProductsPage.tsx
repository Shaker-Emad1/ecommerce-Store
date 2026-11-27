import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useOutletContext, useParams, useSearchParams, Link } from "react-router";
import { Check, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { GOLD, CARD } from "../store/constants";
import { useCart } from "../store/cartContext";
import { ProductCard } from "../components/shared/ProductCard";
import { ProductSkeleton } from "../components/shared/Skeleton";
import { CategoryDto } from "../services/categoryService";
import { useCatalog } from "../shared/useCatalog";
import { matchScore } from "../shared/arabic";
import { usePageMeta } from "../shared/usePageMeta";
import { categoryPath } from "../shared/slug";

const PAGE_SIZE = 12;
const chip = (on: boolean): React.CSSProperties => ({
  background: on ? GOLD : "rgba(255,255,255,0.05)",
  color: on ? "#0F0F0F" : "#d4d4d4",
  border: `1px solid ${on ? "transparent" : "rgba(212,175,55,0.2)"}`,
  minHeight: "2.5rem",
});

export function ProductsPage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { categories } = useOutletContext<{ categories: CategoryDto[] }>();
  const { products, loading, error } = useCatalog();
  const { id: catParam } = useParams();
  const [sp, setSp] = useSearchParams();

  const catId = catParam ? Number(catParam) : null;
  const category = catId ? categories.find((c) => c.id === catId) : undefined;
  const q = sp.get("q") || sp.get("search") || "";
  const sort = sp.get("sort") || "default";
  const inStock = sp.get("stock") === "1";
  const onSale = sp.get("sale") === "1";
  const minP = sp.get("min") || "";
  const maxP = sp.get("max") || "";
  const [page, setPage] = useState(1);
  const [panel, setPanel] = useState(false);

  const setParam = (k: string, v: string | null) => {
    const n = new URLSearchParams(sp);
    if (v === null || v === "") n.delete(k); else n.set(k, v);
    setSp(n, { replace: true });
  };
  useEffect(() => { setPage(1); window.scrollTo({ top: 0 }); }, [catId, q, sort, inStock, onSale, minP, maxP]);

  const base = useMemo(() => (catId ? products.filter((p) => p.categoryId === catId) : products), [products, catId]);
  const priceBounds = useMemo(() => {
    const prices = base.map((p) => p.price);
    return prices.length ? [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))] : [0, 0];
  }, [base]);

  const list = useMemo(() => {
    let r = base.map((p) => ({ p, s: q ? Math.max(matchScore(p.name, q), matchScore(p.category, q) * 0.5, matchScore(p.description || "", q) * 0.3) : 1 }));
    if (q) r = r.filter((x) => x.s > 0);
    if (inStock) r = r.filter((x) => x.p.stock > 0);
    if (onSale) r = r.filter((x) => x.p.originalPrice > x.p.price);
    if (minP) r = r.filter((x) => x.p.price >= Number(minP));
    if (maxP) r = r.filter((x) => x.p.price <= Number(maxP));
    const sorted = [...r];
    if (sort === "price-asc") sorted.sort((a, b) => a.p.price - b.p.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.p.price - a.p.price);
    else if (sort === "discount") sorted.sort((a, b) => (b.p.originalPrice - b.p.price) / (b.p.originalPrice || 1) - (a.p.originalPrice - a.p.price) / (a.p.originalPrice || 1));
    else if (sort === "rating") sorted.sort((a, b) => b.p.rating - a.p.rating);
    else if (q) sorted.sort((a, b) => b.s - a.s);
    return sorted.map((x) => x.p);
  }, [base, q, inStock, onSale, minP, maxP, sort]);

  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const shown = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeFilters = [inStock, onSale, !!minP, !!maxP].filter(Boolean).length;
  const clearAll = () => { const n = new URLSearchParams(); if (q) n.set("q", q); setSp(n, { replace: true }); };

  const heading = category ? `${category.name} في مصر` : q ? `نتائج البحث عن "${q}"` : "كل المنتجات";
  const lowest = base.length ? Math.min(...base.map((p) => p.price)) : 0;
  const desc = category
    ? `تسوق ${category.name} الأصلية من A.S Brand Store. ${base.length} منتج${lowest ? ` بدءًا من ${lowest} ج.م` : ""}، دفع عند الاستلام وشحن لكل محافظات مصر.`
    : "تسوق أحدث إكسسوارات وإلكترونيات الموبايل بأسعار تنافسية من A.S Brand Store. دفع عند الاستلام وشحن لكل محافظات مصر.";
  usePageMeta({
    title: category ? `${category.name} بأفضل سعر في مصر` : q ? `بحث: ${q}` : "المنتجات",
    description: desc,
    jsonLd: category && base.length ? {
      "@context": "https://schema.org", "@type": "CollectionPage", name: heading, description: desc,
      mainEntity: { "@type": "ItemList", itemListElement: base.slice(0, 20).map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${window.location.origin}/product/${p.id}`, name: p.name })) },
    } : null,
  });

  const visibleCats = categories.filter((c) => c.productsCount > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav aria-label="مسار التنقل" className="mb-3 text-xs text-gray-400">
        <Link to="/" className="hover:text-white">الرئيسية</Link> / <Link to="/products" className="hover:text-white">المنتجات</Link>
        {category && <> / <span className="text-gray-200">{category.name}</span></>}
      </nav>
      <h1 className="text-2xl sm:text-3xl font-black text-white">{heading}</h1>
      {category && <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-400">{desc}</p>}

      {/* Category chips: one swipeable row */}
      <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-2" style={{ scrollbarWidth: "none" }}>
        <button onClick={() => navigate(q ? `/products?q=${encodeURIComponent(q)}` : "/products")} className="shrink-0 rounded-xl px-4 text-sm font-bold" style={chip(!catId)}>الكل</button>
        {visibleCats.map((c) => (
          <button key={c.id} onClick={() => navigate(categoryPath(c))} className="shrink-0 rounded-xl px-4 text-sm font-bold" style={chip(catId === c.id)}>
            {c.name} <span className="opacity-60">({c.productsCount})</span>
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button onClick={() => setPanel((o) => !o)} className="flex items-center gap-2 rounded-xl px-4 text-sm font-bold text-white" style={{ ...chip(activeFilters > 0 && false), minHeight: "2.75rem" }} aria-expanded={panel}>
          <SlidersHorizontal size={16} /> فلتر{activeFilters > 0 ? ` (${activeFilters})` : ""}
        </button>
        <SortMenu value={sort} onChange={(v) => setParam("sort", v === "default" ? null : v)} />
        <span className="text-sm text-gray-400">{loading ? "" : `${list.length} منتج`}</span>
        {(activeFilters > 0 || q) && (
          <button onClick={clearAll} className="flex items-center gap-1 text-sm font-bold" style={{ color: GOLD }}><X size={14} /> مسح الفلاتر</button>
        )}
      </div>

      {panel && (
        <div className="mt-3 grid gap-4 rounded-2xl p-4 sm:grid-cols-2" style={{ background: CARD, border: "1px solid rgba(212,175,55,0.2)" }}>
          <div>
            <p className="mb-2 text-sm font-bold text-white">السعر (ج.م)</p>
            <div className="flex items-center gap-2">
              <input inputMode="numeric" placeholder={`من ${priceBounds[0]}`} value={minP} onChange={(e) => setParam("min", e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-xl bg-black px-3 text-sm text-white outline-none" style={{ border: "1px solid rgba(212,175,55,0.25)", minHeight: "2.75rem" }} aria-label="أقل سعر" />
              <span className="text-gray-500">-</span>
              <input inputMode="numeric" placeholder={`إلى ${priceBounds[1]}`} value={maxP} onChange={(e) => setParam("max", e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-xl bg-black px-3 text-sm text-white outline-none" style={{ border: "1px solid rgba(212,175,55,0.25)", minHeight: "2.75rem" }} aria-label="أعلى سعر" />
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <button onClick={() => setParam("stock", inStock ? null : "1")} className="rounded-xl px-4 text-sm font-bold" style={chip(inStock)} aria-pressed={inStock}>متوفر فقط</button>
            <button onClick={() => setParam("sale", onSale ? null : "1")} className="rounded-xl px-4 text-sm font-bold" style={chip(onSale)} aria-pressed={onSale}>عليه خصم</button>
          </div>
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 items-start">{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <ProductSkeleton key={i} />)}</div>
        ) : error ? (
          <div className="py-20 text-center text-red-400">{error}</div>
        ) : list.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-300">مفيش منتجات مطابقة{q ? ` لـ "${q}"` : ""}.</p>
            <button onClick={clearAll} className="mt-4 rounded-xl px-5 text-sm font-bold text-black" style={{ background: GOLD, minHeight: "2.75rem" }}>عرض كل المنتجات</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 items-start">
              {shown.map((p) => <ProductCard key={p.id} p={p} onAdd={addToCart} onView={(x) => navigate(`/product/${x.id}`)} />)}
            </div>
            {pages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-4">
                <button disabled={page === 1} onClick={() => { setPage((p) => p - 1); window.scrollTo({ top: 0 }); }} className="rounded-xl px-5 text-sm font-bold disabled:opacity-30" style={{ ...chip(false), color: GOLD }}>السابق</button>
                <span className="text-sm text-gray-300">صفحة {page} من {pages}</span>
                <button disabled={page === pages} onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0 }); }} className="rounded-xl px-5 text-sm font-bold disabled:opacity-30" style={{ ...chip(false), color: GOLD }}>التالي</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const SORTS: [string, string][] = [
  ["default", "الأنسب"],
  ["price-asc", "السعر: الأقل أولاً"],
  ["price-desc", "السعر: الأعلى أولاً"],
  ["discount", "الأعلى خصمًا"],
  ["rating", "الأعلى تقييماً"],
];

function SortMenu({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent | TouchEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close); document.addEventListener("touchstart", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("touchstart", close); };
  }, []);
  const label = SORTS.find(([v]) => v === value)?.[1] ?? SORTS[0][1];
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open}
        className="flex items-center gap-2 rounded-xl px-4 text-sm font-bold text-white" style={{ background: CARD, border: "1px solid rgba(212,175,55,0.3)", minHeight: "2.75rem" }}>
        {label} <ChevronDown size={16} style={{ color: GOLD }} />
      </button>
      {open && (
        <ul role="listbox" className="absolute z-30 mt-2 w-60 overflow-hidden rounded-xl py-1 shadow-2xl" style={{ background: "#1a1a1a", border: "1px solid rgba(212,175,55,0.3)", insetInlineStart: 0 }}>
          {SORTS.map(([v, l]) => (
            <li key={v} role="option" aria-selected={value === v}>
              <button type="button" onClick={() => { onChange(v); setOpen(false); }}
                className="flex w-full items-center justify-between px-4 text-sm" style={{ minHeight: "2.75rem", color: value === v ? GOLD : "#e5e5e5", background: value === v ? "rgba(212,175,55,0.1)" : "transparent", fontWeight: value === v ? 800 : 500 }}>
                {l} {value === v && <Check size={16} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
