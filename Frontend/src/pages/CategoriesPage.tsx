import { useState } from "react";
import { usePageTitle } from "../shared/usePageTitle";

import { Search } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router";
import { GOLD, CARD } from "../store/constants";
import { getIconComponent } from "../store/iconMap";
import { CategoryDto } from "../services/categoryService";

export function CategoriesPage() {
  usePageTitle("Categories");
  const navigate = useNavigate();
  const { categories, loading, error } = useOutletContext<{ categories: CategoryDto[]; loading: boolean; error: string | null }>();
  const [q, setQ] = useState("");
  const filtered = categories.filter((c) => c.name.includes(q) || q === "");

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">الفئات</h1>
        <div className="h-0.5 w-14 rounded-full mt-2" style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-60 shrink-0 rounded-2xl p-5 h-fit" style={{ background: CARD, border: `1px solid rgba(212,175,55,0.1)` }}>
          <h3 className="font-bold text-white mb-3 text-sm">البحث والفلترة</h3>
          <div className="relative mb-4">
            <input type="text" placeholder="ابحث في الفئات..." value={q} onChange={(e) => setQ(e.target.value)} className="w-full rounded-xl pl-4 pr-9 py-2.5 text-white text-sm outline-none placeholder-gray-600" style={{ background: "#111", border: `1px solid rgba(212,175,55,0.15)` }} />
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: GOLD }} />
          </div>
          <div className="space-y-1.5">
            {loading ? (
              <div className="text-gray-500 text-xs py-2 text-center">جاري التحميل...</div>
            ) : error ? (
              <div className="text-red-500 text-xs py-2 text-center">{error}</div>
            ) : (
              categories.map((c) => (
                <button key={c.id} onClick={() => { navigate("/products"); window.scrollTo(0, 0); }} className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-sm transition-all hover:opacity-80 text-right" style={{ background: "rgba(212,175,55,0.05)", border: `1px solid rgba(212,175,55,0.06)` }}>
                  <span className="flex items-center gap-2">
                    <span style={{ color: GOLD }}>{getIconComponent(c.icon, 18)}</span>
                    <span className="text-gray-300">{c.name}</span>
                  </span>
                  <span className="text-xs text-gray-600">{c.productsCount}</span>
                </button>
              ))
            )}
          </div>
        </aside>

        <div className="flex-1">
          {loading ? (
            <div className="text-center py-20 text-gray-500">جاري تحميل الفئات...</div>
          ) : error ? (
            <div className="text-center py-20 text-red-500">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-500">لا توجد فئات مطابقة للبحث</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((c) => (
                <button key={c.id} onClick={() => { navigate("/products"); window.scrollTo(0, 0); }} className="rounded-2xl overflow-hidden group relative text-right w-full" style={{ height: 220, background: "#111", border: `1px solid rgba(212,175,55,0.1)` }}>
                  <img loading="lazy" src={c.imageUrl} alt={c.name} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15,15,15,0.95) 30%, transparent)" }} />
                  <div className="absolute bottom-0 right-0 left-0 p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(212,175,55,0.18)" }}>
                        <span style={{ color: GOLD }}>{getIconComponent(c.icon, 20)}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{c.name}</h3>
                        <p className="text-xs text-gray-400">{c.productsCount} منتج</p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
