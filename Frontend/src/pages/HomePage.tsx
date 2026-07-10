import { Box, Users, LayoutGrid, Star, Truck, Shield, RefreshCw, Award } from "lucide-react";
import { GOLD } from "../store/constants";
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

  const onView = (p: any) => navigate(`/product/${p.id}`);

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-4">
        <HeroSlider banners={banners} setPage={(p) => navigate(p)} />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { v: "500+", l: "منتج متاح", Icon: Box },
            { v: "10,000+", l: "عميل سعيد", Icon: Users },
            { v: "20+", l: "فئة متنوعة", Icon: LayoutGrid },
            { v: "4.9 ★", l: "تقييم العملاء", Icon: Star },
          ].map(({ v, l, Icon }) => (
            <div key={l} className="rounded-2xl p-5 flex flex-col items-center text-center" style={{ background: "rgba(26,26,26,0.7)", border: `1px solid rgba(212,175,55,0.1)`, backdropFilter: "blur(12px)" }}>
              <Icon size={22} style={{ color: GOLD }} className="mb-2" />
              <div className="text-2xl font-black text-white">{v}</div>
              <div className="text-xs text-gray-500 mt-0.5">{l}</div>
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
            {categories.map((c) => (
              <button key={c.id} onClick={() => { navigate("/products"); window.scrollTo(0, 0); }} className="rounded-2xl overflow-hidden group relative" style={{ height: 148, background: "#111", border: `1px solid rgba(212,175,55,0.08)` }}>
                <img loading="lazy" src={c.imageUrl} alt={c.name} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-65 group-hover:scale-105 transition-all duration-500" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                  <div style={{ color: GOLD }}>{getIconComponent(c.icon)}</div>
                  <span className="text-white font-bold text-sm">{c.name}</span>
                  <span className="text-xs text-gray-400">{c.productsCount} منتج</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <SectionTitle title="الأكثر مبيعاً" sub="المنتجات الأعلى تقييماً من عملائنا" action="عرض الكل" onAction={() => { navigate("/products"); window.scrollTo(0, 0); }} />
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => <ProductSkeleton key={i} />)}
          </div>
        ) : bestSellers.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">لا توجد منتجات متاحة</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {bestSellers.slice(0, 4).map((p) => <ProductCard key={p.id} p={mapDtoToProduct(p)} onAdd={addToCart} onView={onView} />)}
          </div>
        )}
      </div>


      <div className="max-w-7xl mx-auto px-4 py-8">
        <SectionTitle title="أحدث المنتجات" sub="وصل حديثاً إلى متجرنا" action="عرض الكل" onAction={() => { navigate("/products"); window.scrollTo(0, 0); }} />
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => <ProductSkeleton key={i} />)}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">لا توجد منتجات متاحة</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
              <p className="text-xs text-gray-500 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
