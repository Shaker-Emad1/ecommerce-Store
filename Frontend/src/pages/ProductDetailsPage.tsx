import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Minus, Plus, Search } from "lucide-react";
import { StarRating } from "../components/shared/StarRating";
import { GoldBtn } from "../components/shared/GoldBtn";
import { SectionTitle } from "../components/shared/SectionTitle";
import { ProductCard } from "../components/shared/ProductCard";
import { ProductImageViewer } from "../components/shared/ProductImageViewer";
import { useCart } from "../store/cartContext";
import { GOLD } from "../store/constants";
import { Product, mapDtoToProduct } from "../store/types";
import { productService } from "../services/productService";
import { usePageTitle } from "../shared/usePageTitle";

export function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState("");
  const [tab, setTab] = useState<"desc" | "specs">("desc");
  const [activeImg, setActiveImg] = useState(0);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [productImages, setProductImages] = useState<string[]>([]);

  usePageTitle(product?.name || "تفاصيل المنتج");

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
        setViewerIndex(null);
        setProductImages([detailed.image, ...(detailed.images || [])]);

        const related = await productService.getProducts({ categoryId: detailed.categoryId, pageSize: 5 });
        setRelatedProducts(related.items.filter((item) => item.id !== detailed.id).slice(0, 4).map(mapDtoToProduct));
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
          <button
            type="button"
            onClick={() => setViewerIndex(activeImg)}
            className="product-image-stage product-image-stage--featured relative block w-full overflow-hidden rounded-2xl text-right transition-transform hover:scale-[1.01]"
            style={{ height: "clamp(260px, 60vw, 420px)", border: "1px solid rgba(212,175,55,0.08)" }}
            aria-label={`عرض صورة ${product.name} بالحجم الكامل`}
          >
            <img loading="eager" src={productImages[activeImg]} alt={product.name} className="product-image-stage__img product-image-stage__img--featured" />
            <span
              className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold text-white transition-all duration-200 md:hover:scale-[1.03] md:hover:-translate-y-0.5 active:scale-95"
              style={{ background: "rgba(15,15,15,0.76)", border: "1px solid rgba(212,175,55,0.18)", boxShadow: "0 12px 28px rgba(0,0,0,0.24)", backdropFilter: "blur(14px)" }}
            >
              <Search size={13} style={{ color: GOLD }} />
              تكبير الصورة
            </span>
          </button>

          {productImages.length > 1 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {productImages.map((img, imageIndex) => (
                <div
                  key={imageIndex}
                  onClick={() => setActiveImg(imageIndex)}
                  className="product-image-stage cursor-pointer overflow-hidden rounded-xl transition-all"
                  style={{ height: 80, border: `2px solid ${imageIndex === activeImg ? GOLD : "rgba(212,175,55,0.1)"}` }}
                >
                  <img loading="lazy" src={img} alt="" className="product-image-stage__img" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-start justify-between">
            <span className="rounded-lg px-2.5 py-1 text-xs font-bold" style={{ background: "rgba(212,175,55,0.12)", color: GOLD }}>
              {product.category}
            </span>
            {product.badge && (
              <span className="rounded-lg px-2.5 py-1 text-xs font-bold" style={{ background: GOLD, color: "#0F0F0F" }}>
                {product.badge}
              </span>
            )}
          </div>

          <h1 className="mb-3 text-2xl leading-tight font-black text-white md:text-3xl">{product.name}</h1>

          <div className="mb-5 flex items-center gap-3">
            <StarRating rating={product.rating} size={17} />
            <span className="text-sm text-gray-500">({product.reviews} تقييم)</span>
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                background: product.stock > 0 ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                color: product.stock > 0 ? "#22c55e" : "#ef4444",
              }}
            >
              {product.stock > 0 ? "متوفر" : "غير متوفر"}
            </span>
          </div>

          <div className="mb-6 flex items-end gap-3">
            <span className="text-4xl font-black" style={{ color: GOLD }}>
              {product.price} ج.م
            </span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-xl text-gray-500 line-through">{product.originalPrice} ج.م</span>
                <span className="rounded-lg px-2 py-0.5 text-sm font-bold" style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>
                  وفر {discount}%
                </span>
              </>
            )}
          </div>

          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <p className="mb-2 text-sm text-gray-500">اللون</p>
              <div className="flex gap-3">
                {product.colors.map((swatch) => (
                  <button
                    key={swatch}
                    onClick={() => setColor(swatch)}
                    className="h-11 w-11 rounded-full transition-all"
                    style={{
                      background: swatch,
                      border: `3px solid ${color === swatch ? GOLD : "transparent"}`,
                      boxShadow: color === swatch ? "0 0 0 2px rgba(212,175,55,0.3)" : "none",
                      outline: "2px solid rgba(255,255,255,0.08)",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mb-8">
            <p className="mb-2 text-sm text-gray-500">الكمية</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center overflow-hidden rounded-xl" style={{ border: "1px solid rgba(212,175,55,0.2)", background: "#111" }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="flex h-11 w-11 items-center justify-center text-white transition-opacity hover:opacity-60">
                  <Minus size={15} />
                </button>
                <span className="w-10 text-center font-bold text-white">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="flex h-11 w-11 items-center justify-center text-white transition-opacity hover:opacity-60">
                  <Plus size={15} />
                </button>
              </div>
              <span className="text-xs text-gray-600">{product.stock} قطعة متاحة</span>
            </div>
          </div>

          <div className="mb-8 flex gap-3">
            <GoldBtn disabled={product.stock <= 0} onClick={() => { for (let i = 0; i < qty; i += 1) addToCart(product); }} size="lg" className="flex-1">
              أضف إلى السلة
            </GoldBtn>
            <GoldBtn
              disabled={product.stock <= 0}
              onClick={() => {
                addToCart(product);
                navigate("/cart");
              }}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              شراء الآن
            </GoldBtn>
          </div>

          <div className="overflow-hidden rounded-2xl" style={{ border: "1px solid rgba(212,175,55,0.1)" }}>
            <div className="flex" style={{ borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
              {[{ key: "desc" as const, label: "الوصف" }, { key: "specs" as const, label: "المواصفات" }].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className="flex-1 py-3 text-sm font-semibold transition-all"
                  style={{
                    color: tab === key ? GOLD : "#666",
                    background: tab === key ? "rgba(212,175,55,0.07)" : "transparent",
                    borderBottom: tab === key ? `2px solid ${GOLD}` : "2px solid transparent",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {tab === "desc" ? (
                <p className="text-sm leading-relaxed text-gray-300">{product.description}</p>
              ) : (
                <div className="space-y-2.5">
                  {product.specs && product.specs.length > 0 ? (
                    product.specs.map((spec) => (
                      <div key={spec.label} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <span className="text-sm text-gray-500">{spec.label}</span>
                        <span className="text-sm font-semibold text-white">{spec.value}</span>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-xs text-gray-500">لا توجد مواصفات فنية متوفرة</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SectionTitle title="منتجات مشابهة" sub="قد تعجبك أيضاً" />
      {relatedProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {relatedProducts.map((item) => (
            <ProductCard key={item.id} p={item} onAdd={addToCart} onView={(nextProduct) => navigate(`/product/${nextProduct.id}`)} />
          ))}
        </div>
      ) : (
        <div className="py-10 text-center text-xs text-gray-500">لا توجد منتجات مشابهة متوفرة</div>
      )}

      {viewerIndex !== null && (
        <ProductImageViewer
          images={productImages}
          index={viewerIndex}
          name={product.name}
          onClose={() => setViewerIndex(null)}
          onIndexChange={(nextIndex) => {
            setViewerIndex(nextIndex);
            setActiveImg(nextIndex);
          }}
        />
      )}
    </div>
  );
}
