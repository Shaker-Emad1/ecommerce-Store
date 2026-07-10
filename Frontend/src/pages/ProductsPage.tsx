import { useState, useEffect } from "react";
import { usePageTitle } from "../shared/usePageTitle";

import { useNavigate, useOutletContext } from "react-router";
import { GOLD, CARD } from "../store/constants";
import { useCart } from "../store/cartContext";
import { ProductCard } from "../components/shared/ProductCard";
import { ProductSkeleton } from "../components/shared/Skeleton";
import { productService } from "../services/productService";
import { CategoryDto } from "../services/categoryService";
import { Product, mapDtoToProduct } from "../store/types";
import { LIGHT_GOLD } from "../store/constants";

export function ProductsPage() {
  usePageTitle("Products");
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { categories } = useOutletContext<{ categories: CategoryDto[] }>();

  const [sort, setSort] = useState("default");
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(window.location.search);
      const search = params.get("search") || undefined;
      const response = await productService.getProducts({
        search,
        categoryId: selectedCatId !== null ? selectedCatId : undefined,
        sortBy: sort !== "default" ? sort : undefined,
        pageIndex,
        pageSize: 8,
      });
      setProductsList(response.items.map(mapDtoToProduct));
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء تحميل المنتجات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [selectedCatId, sort, pageIndex]);
  useEffect(() => { setPageIndex(1); }, [selectedCatId, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">المنتجات</h1>
        <div className="h-0.5 w-14 rounded-full mt-2" style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
      </div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setSelectedCatId(null)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: selectedCatId === null ? `linear-gradient(135deg, ${GOLD}, ${LIGHT_GOLD})` : "rgba(212,175,55,0.07)", color: selectedCatId === null ? "#0F0F0F" : "#aaa", border: `1px solid ${selectedCatId === null ? "transparent" : "rgba(212,175,55,0.12)"}` }}>
            الكل
          </button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setSelectedCatId(c.id)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: selectedCatId === c.id ? `linear-gradient(135deg, ${GOLD}, ${LIGHT_GOLD})` : "rgba(212,175,55,0.07)", color: selectedCatId === c.id ? "#0F0F0F" : "#aaa", border: `1px solid ${selectedCatId === c.id ? "transparent" : "rgba(212,175,55,0.12)"}` }}>
              {c.name}
            </button>
          ))}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full sm:w-auto rounded-xl px-4 py-2 text-sm outline-none cursor-pointer" style={{ background: CARD, color: "#ccc", border: `1px solid rgba(212,175,55,0.18)` }}>
          <option value="default">الترتيب الافتراضي</option>
          <option value="price-asc">السعر: الأقل أولاً</option>
          <option value="price-desc">السعر: الأعلى أولاً</option>
          <option value="rating">الأعلى تقييماً</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <ProductSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-500">{error}</div>
      ) : productsList.length === 0 ? (
        <div className="text-center py-20 text-gray-500">لا توجد منتجات مطابقة حالياً</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productsList.map((p) => <ProductCard key={p.id} p={p} onAdd={addToCart} onView={(p) => navigate(`/product/${p.id}`)} />)}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <button disabled={pageIndex === 1} onClick={() => setPageIndex((p) => p - 1)}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: "rgba(212,175,55,0.1)", color: GOLD, border: `1px solid ${GOLD}` }}>السابق</button>
              <span className="text-xs text-gray-400">صفحة {pageIndex} من {totalPages}</span>
              <button disabled={pageIndex === totalPages} onClick={() => setPageIndex((p) => p + 1)}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: "rgba(212,175,55,0.1)", color: GOLD, border: `1px solid ${GOLD}` }}>التالي</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
