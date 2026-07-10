import { useState, useEffect } from "react";
import { Outlet } from "react-router";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { categoryService, CategoryDto } from "../../services/categoryService";
import { bannerService, BannerDto } from "../../services/bannerService";
import { productService, ProductDto } from "../../services/productService";
import { settingService, SettingDto } from "../../services/settingService";
import { mapDtoToProduct } from "../../store/types";
import { BG } from "../../store/constants";
import { Toaster } from "sonner";

export function StoreLayout() {
  const [searchQuery, setSearchQuery] = useState("");

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [banners, setBanners] = useState<BannerDto[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductDto[]>([]);
  const [bestSellers, setBestSellers] = useState<ProductDto[]>([]);
  const [storeSettings, setStoreSettings] = useState<SettingDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHomeData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, bans, feat, best, settings] = await Promise.all([
        categoryService.getAll(),
        bannerService.getAll(),
        productService.getProducts({ isFeatured: true, pageSize: 8 }),
        productService.getProducts({ isBestSeller: true, pageSize: 8 }),
        settingService.getSettings()
      ]);
      setCategories(cats);
      setBanners(bans);
      setFeaturedProducts(feat.items);
      setBestSellers(best.items);
      setStoreSettings(settings);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  return (
    <div dir="rtl" className="min-h-screen" style={{ background: BG, fontFamily: "'Cairo', 'Tajawal', sans-serif" }}>
      <style>{`
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.25); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(212,175,55,0.45); }
        * { scrollbar-width: thin; scrollbar-color: rgba(212,175,55,0.25) transparent; }
        select option { background: #1A1A1A; color: #F8F8F8; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>

      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        storeSettings={storeSettings}
      />

      <main>
        <Outlet context={{ categories, banners, featuredProducts, bestSellers, storeSettings, loading, error, searchQuery, setSearchQuery }} />
      </main>

      <Footer />
      <Toaster richColors theme="dark" />
    </div>
  );
}
