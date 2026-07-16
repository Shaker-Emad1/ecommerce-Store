import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Minus, Plus } from "lucide-react";
import { GOLD } from "../store/constants";
import { useCart } from "../store/cartContext";
import { StarRating } from "../components/shared/StarRating";
import { GoldBtn } from "../components/shared/GoldBtn";
import { SectionTitle } from "../components/shared/SectionTitle";
import { ProductCard } from "../components/shared/ProductCard";
import { productService } from "../services/productService";
import { Product, mapDtoToProduct } from "../store/types";
import { usePageTitle } from "../shared/usePageTitle";

export function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState("");
  
  usePageTitle(product?.name || "تفاصيل المنتج");
  const [tab, setTab] = useState<"desc" | "specs">("desc");
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [productImages, setProductImages] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const detailed = await productService.getById(Number(id));
        const mapped = mapDtoToProduct(detailed);
        setProduct(mapped);
        setColor(mapped.colors?.[0] ?? "");
        setQty(1);
        setActiveImg(0);
        setProductImages([detailed.image, ...(detailed.images || [])]);

        const related = await productService.getProducts({ categoryId: detailed.categoryId, pageSize: 5 });
        setRelatedProducts(related.items.filter((x) => x.id !== detailed.id).slice(0, 4).map(mapDtoToProduct));
      } catch (err: any) {
        setError(err.message || "حدث خطأ أثناء تحميل تفاصيل المنتج");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">جاري تحميل تفاصيل المنتج...</div>;
  }
  if (error || !product) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-red-500">{error || "المنتج غير موجود"}</div>;
  }

  const discount = product.originalPrice > 0 ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div className="space-y-4">
          <div className="product-image-stage rounded-2xl overflow-hidden" style={{ height: "clamp(260px, 60vw, 420px)", border: `1px solid rgba(212,175,55,0.08)` }}>
            <img loading="lazy" src={productImages[activeImg]} alt={product.name} className="product-image-stage__img" />
          </div>
          {productImages.length > 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {productImages.map((img, i) => (
                <div key={i} onClick={() => setActiveImg(i)} className="product-image-stage rounded-xl overflow-hidden cursor-pointer transition-all" style={{ height: 80, border: `2px solid ${i === activeImg ? GOLD : "rgba(212,175,55,0.1)"}` }}>
                  <img loading="lazy" src={img} alt="" className="product-image-stage__img" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: "rgba(212,175,55,0.12)", color: GOLD }}>{product.category}</span>
            {product.badge && <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: GOLD, color: "#0F0F0F" }}>{product.badge}</span>}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-3 leading-tight">{product.name}</h1>
          <div className="flex items-center gap-3 mb-5">
            <StarRating rating={product.rating} size={17} />
            <span className="text-sm text-gray-500">({product.reviews} تقييم)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ background: product.stock > 0 ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: product.stock > 0 ? "#22c55e" : "#ef4444" }}>
              {product.stock > 0 ? "متوفر" : "غير متوفر"}
            </span>
          </div>
          <div className="flex items-end gap-3 mb-6">
            <span className="text-4xl font-black" style={{ color: GOLD }}>{product.price} ج.م</span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-xl text-gray-500 line-through">{product.originalPrice} ج.م</span>
                <span className="text-sm font-bold px-2 py-0.5 rounded-lg" style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>وفر {discount}%</span>
              </>
            )}
          </div>
          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">اللون</p>
              <div className="flex gap-3">
                {product.colors.map((c) => (
                  <button key={c} onClick={() => setColor(c)} className="w-11 h-11 rounded-full transition-all" style={{ background: c, border: `3px solid ${color === c ? GOLD : "transparent"}`, boxShadow: color === c ? `0 0 0 2px rgba(212,175,55,0.3)` : "none", outline: `2px solid rgba(255,255,255,0.08)` }} />
                ))}
              </div>
            </div>
          )}
          <div className="mb-8">
            <p className="text-sm text-gray-500 mb-2">الكمية</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-xl overflow-hidden" style={{ border: `1px solid rgba(212,175,55,0.2)`, background: "#111" }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-11 h-11 flex items-center justify-center text-white hover:opacity-60 transition-opacity"><Minus size={15} /></button>
                <span className="w-10 text-center text-white font-bold">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-11 h-11 flex items-center justify-center text-white hover:opacity-60 transition-opacity"><Plus size={15} /></button>
              </div>
              <span className="text-xs text-gray-600">{product.stock} قطعة متاحة</span>
            </div>
          </div>
          <div className="flex gap-3 mb-8">
            <GoldBtn disabled={product.stock <= 0} onClick={() => { for (let i = 0; i < qty; i++) addToCart(product); }} size="lg" className="flex-1">أضف إلى السلة</GoldBtn>
            <GoldBtn disabled={product.stock <= 0} onClick={() => { addToCart(product); navigate("/cart"); }} variant="outline" size="lg" className="flex-1">شراء الآن</GoldBtn>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid rgba(212,175,55,0.1)` }}>
            <div className="flex" style={{ borderBottom: `1px solid rgba(212,175,55,0.1)` }}>
              {[{ k: "desc" as const, l: "الوصف" }, { k: "specs" as const, l: "المواصفات" }].map(({ k, l }) => (
                <button key={k} onClick={() => setTab(k)} className="flex-1 py-3 text-sm font-semibold transition-all" style={{ color: tab === k ? GOLD : "#666", background: tab === k ? "rgba(212,175,55,0.07)" : "transparent", borderBottom: tab === k ? `2px solid ${GOLD}` : "2px solid transparent" }}>{l}</button>
              ))}
            </div>
            <div className="p-5">
              {tab === "desc" ? (
                <p className="text-sm text-gray-300 leading-relaxed">{product.description}</p>
              ) : (
                <div className="space-y-2.5">
                  {product.specs && product.specs.length > 0 ? product.specs.map((s) => (
                    <div key={s.label} className="flex justify-between items-center py-2" style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                      <span className="text-sm text-gray-500">{s.label}</span>
                      <span className="text-sm text-white font-semibold">{s.value}</span>
                    </div>
                  )) : (
                    <div className="text-xs text-gray-500 text-center py-4">لا توجد مواصفات فنية متوفرة</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <SectionTitle title="منتجات مشابهة" sub="قد تعجبك أيضاً" />
      {relatedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {relatedProducts.map((p) => <ProductCard key={p.id} p={p} onAdd={addToCart} onView={(p) => navigate(`/product/${p.id}`)} />)}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500 text-xs">لا توجد منتجات مشابهة متوفرة</div>
      )}
    </div>
  );
}

