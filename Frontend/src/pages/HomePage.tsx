import { optimizeImg, optimizeSrcSet } from "../shared/img";
import { Truck, Shield, RefreshCw, Award, Banknote, MessageCircle } from "lucide-react";
import { GOLD } from "../store/constants";
import { categoryPath } from "../shared/slug";
import { usePageTitle } from "../shared/usePageTitle";

import { useOutletContext, useNavigate } from "react-router";
import { useCart } from "../store/cartContext";
import { SectionTitle } from "../components/shared/SectionTitle";
import { ProductCard } from "../components/shared/ProductCard";
import { HeroSlider } from "../components/shared/HeroSlider";
import { getIconComponent } from "../store/iconMap";
import { mapDtoToProduct } from "../store/types";
import { ProductSkeleton, CategorySkeleton } from "../components/shared/Skeleton";
import { CategoryDto } from "../services/categoryService";
import { BannerDto } from "../services/bannerService";
import { ProductDto } from "../services/productService";
import { SettingDto } from "../services/settingService";

interface HomeContext {
  categories: CategoryDto[];
  banners: BannerDto[];
  featuredProducts: ProductDto[];
  bestSellers: ProductDto[];
  storeSettings: SettingDto | null;
  loading: boolean;
  error: string | null;
}

export function HomePage() {
  usePageTitle();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { categories, banners, featuredProducts, bestSellers, loading, error } = useOutletContext<HomeContext>();

  const deal = [...bestSellers, ...featuredProducts].map(mapDtoToProduct).filter((p) => p.originalPrice > p.price && p.stock > 0).sort((a, b) => (1 - b.price / b.originalPrice) - (1 - a.price / a.originalPrice))[0];

  const onView = (p: any) => navigate(`/product/${p.id}`);

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-4">
        <HeroSlider banners={banners} setPage={(p) => navigate(p)} />
      </div>

      {deal && (
        <div className="max-w-7xl mx-auto px-4 pt-2 pb-4">
          <button onClick={() => { navigate(`/product/${deal.id}`); window.scrollTo(0, 0); }} className="flex w-full items-center gap-4 rounded-2xl p-3 text-right" style={{ background: "#1A1A1A", border: "1px solid rgba(212,175,55,0.3)" }}>
            <span className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-white sm:h-28 sm:w-28">
              <img src={optimizeImg(deal.image, 240)} alt={deal.name} width={112} height={112} className="h-full w-full object-contain p-1" decoding="async" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="mb-1 inline-block rounded-md px-2 py-0.5 text-xs font-bold text-white" style={{ background: "#dc2626" }}>أعلى خصم الآن -{Math.round((1 - deal.price / deal.originalPrice) * 100)}%</span>
              <span className="block truncate text-base font-bold text-white sm:text-lg">{deal.name}</span>
              <span className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-black text-white">{deal.price} ج.م</span>
                <span className="text-sm text-gray-400 line-through">{deal.originalPrice} ج.م</span>
              </span>
            </span>
            <span className="hidden shrink-0 rounded-xl px-5 py-3 text-sm font-bold text-black sm:block" style={{ background: GOLD }}>اشتري الآن</span>
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { l: "الدفع عند الاستلام", Icon: Banknote },
            { l: "شحن لكل المحافظات", Icon: Truck },
            { l: "منتجات أصلية", Icon: Shield },
            { l: "تواصل واتساب سريع", Icon: MessageCircle },
          ].map(({ l, Icon }) => (
            <div key={l} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Icon size={20} className="shrink-0 text-gray-300" />
              <span className="text-sm font-semibold text-gray-200">{l}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <SectionTitle title="تسوق حسب الفئة" sub="اختر من بين تشكيلة واسعة من الفئات" action="عرض الكل" onAction={() => { navigate("/categories"); window.scrollTo(0, 0); }} />
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => <CategorySkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500 text-sm">{error}</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">لا توجد فئات متاحة حالياً</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.filter((c) => c.productsCount > 0).map((c) => (
              <button key={c.id} onClick={() => { navigate(categoryPath(c)); window.scrollTo(0, 0); }} className="flex flex-col items-center justify-center gap-2 rounded-2xl py-5 transition-colors hover:bg-white/10" style={{ minHeight: 112, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212,175,55,0.2)" }}>
                <span style={{ color: GOLD }}>{getIconComponent(c.icon)}</span>
                <span className="text-sm font-bold text-white">{c.name}</span>
                <span className="text-xs text-gray-400">{c.productsCount} منتج</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <SectionTitle title="الأكثر مبيعاً" sub="المنتجات الأعلى تقييماً من عملائنا" action="عرض الكل" onAction={() => { navigate("/products"); window.scrollTo(0, 0); }} />
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {[1, 2, 3, 4].map((i) => <ProductSkeleton key={i} />)}
          </div>
        ) : bestSellers.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">لا توجد منتجات متاحة</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {bestSellers.slice(0, 4).map((p) => <ProductCard key={p.id} p={mapDtoToProduct(p)} onAdd={addToCart} onView={onView} />)}
          </div>
        )}
      </div>


      <div className="max-w-7xl mx-auto px-4 py-8">
        <SectionTitle title="أحدث المنتجات" sub="وصل حديثاً إلى متجرنا" action="عرض الكل" onAction={() => { navigate("/products"); window.scrollTo(0, 0); }} />
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {[1, 2, 3, 4].map((i) => <ProductSkeleton key={i} />)}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">لا توجد منتجات متاحة</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {featuredProducts.slice(0, 4).map((p) => <ProductCard key={p.id} p={mapDtoToProduct(p)} onAdd={addToCart} onView={onView} />)}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <SectionTitle title="لماذا تختار A.S Brand؟" sub="نضمن لك تجربة تسوق استثنائية" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { Icon: Truck, t: "شحن سريع", d: "توصيل خلال 24-48 ساعة لجميع أنحاء مصر" },
            { Icon: Shield, t: "ضمان الجودة", d: "جميع منتجاتنا مضمونة ومعتمدة رسمياً" },
            { Icon: RefreshCw, t: "إرجاع مجاني", d: "سياسة إرجاع مريحة خلال 14 يوم" },
            { Icon: Award, t: "أسعار تنافسية", d: "أفضل الأسعار مقارنة بجميع المتاجر" },
          ].map(({ Icon, t, d }) => (
            <div key={t} className="rounded-2xl p-6 text-center" style={{ background: "rgba(26,26,26,0.6)", border: `1px solid rgba(212,175,55,0.08)`, backdropFilter: "blur(12px)" }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(212,175,55,0.1)" }}>
                <Icon size={24} style={{ color: GOLD }} />
              </div>
              <h3 className="font-bold text-white mb-2 text-sm">{t}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
