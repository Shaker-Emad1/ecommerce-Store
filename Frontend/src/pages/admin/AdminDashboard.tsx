import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { usePageTitle } from "../../shared/usePageTitle";
import {
  BarChart2, Box, Settings, Package, LayoutGrid, Image as ImageIcon,
  LogOut, ArrowLeft, Menu, DollarSign, Users, Star, Edit, Trash, Eye, X,
  TrendingUp, Minus, Plus, Trash2, Check, Upload, AlertCircle
} from "lucide-react";
import { GOLD, LIGHT_GOLD, BG, CARD, DARK_BG } from "../../store/constants";
import { GoldBtn } from "../../components/shared/GoldBtn";
import { DashboardSkeleton, OrderSkeleton } from "../../components/shared/Skeleton";
import { dashboardService, DashboardStatsDto } from "../../services/dashboardService";
import { productService, ProductDto } from "../../services/productService";
import { categoryService, CategoryDto } from "../../services/categoryService";
import { bannerService, BannerDto } from "../../services/bannerService";
import { settingService, SettingDto } from "../../services/settingService";
import { orderService, OrderDto } from "../../services/orderService";
import { getIconComponent } from "../../store/iconMap";
import api, { API_BASE_URL } from "../../services/api";
import { toast } from "sonner";

const PREDEFINED_COLORS = [
  { name: "Black / أسود", hex: "#000000" },
  { name: "White / أبيض", hex: "#ffffff" },
  { name: "Red / أحمر", hex: "#ff0000" },
  { name: "Blue / أزرق", hex: "#0000ff" },
  { name: "Green / أخضر", hex: "#008000" },
  { name: "Yellow / أصفر", hex: "#ffff00" },
  { name: "Orange / برتقالي", hex: "#ffa500" },
  { name: "Purple / بنفسجي", hex: "#800080" },
  { name: "Pink / وردي", hex: "#ffc0cb" },
  { name: "Gray / رمادي", hex: "#808080" },
  { name: "Silver / فضي", hex: "#c0c0c0" },
  { name: "Gold / ذهبي", hex: "#ffd700" },
  { name: "Brown / بني", hex: "#a52a2a" },
  { name: "Beige / بيج", hex: "#f5f5dc" },
  { name: "Navy / كحلي", hex: "#000080" },
  { name: "Turquoise / تركواز", hex: "#40e0d0" },
];

// ─────────────────────────────────────────────────────────────
//  ImageUploader — reusable drag-and-drop upload widget
// ─────────────────────────────────────────────────────────────

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
  id?: string;
}

function ImageUploader({ value, onChange, label, required, id }: ImageUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("الملف المحدد ليس صورة.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("حجم الملف يتجاوز 5 ميجابايت.");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post<{ url: string }>("/images/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange(data.url);
    } catch (err: any) {
      setUploadError(err.message || "فشل رفع الصورة، حاول مجدداً.");
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // reset so re-selecting same file triggers onChange
    e.target.value = "";
  };

  const clearImage = (ev: React.MouseEvent) => {
    ev.stopPropagation();
    onChange("");
    setUploadError(null);
  };

  return (
    <div>
      {label && (
        <label className="text-xs text-gray-500 block mb-1.5">
          {label}{required && " *"}
        </label>
      )}

      {/* Drop zone */}
      <div
        id={id}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${dragging ? GOLD : "rgba(212,175,55,0.25)"}`,
          borderRadius: 12,
          background: dragging ? "rgba(212,175,55,0.06)" : "#111",
          transition: "all 0.2s",
          cursor: uploading ? "not-allowed" : "pointer",
          minHeight: 120,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Preview */}
        {value && !uploading && (
          <>
            <img
              src={value}
              alt="preview"
              style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 10 }}
            />
            <button
              type="button"
              onClick={clearImage}
              style={{
                position: "absolute", top: 6, left: 6,
                background: "rgba(0,0,0,0.75)", borderRadius: "50%",
                padding: 4, color: "#ef4444",
                display: "flex", alignItems: "center"
              }}
              title="إزالة الصورة"
            >
              <X size={14} />
            </button>
            {/* Re-upload overlay */}
            <div
              style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                background: "rgba(0,0,0,0.55)", padding: "4px 8px",
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 11, color: GOLD, justifyContent: "center"
              }}
            >
              <Upload size={11} /> انقر لتغيير الصورة
            </div>
          </>
        )}

        {/* Loading spinner */}
        {uploading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32, height: 32, borderRadius: "50%",
                border: `3px solid rgba(212,175,55,0.2)`,
                borderTopColor: GOLD,
                animation: "spin 0.8s linear infinite"
              }}
            />
            <span style={{ color: GOLD, fontSize: 12 }}>جاري الرفع إلى Cloudinary…</span>
          </div>
        )}

        {/* Empty state */}
        {!value && !uploading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <Upload size={26} style={{ color: "rgba(212,175,55,0.4)" }} />
            <span style={{ color: "rgba(212,175,55,0.7)", fontSize: 12, fontWeight: 600 }}>
              اسحب صورة هنا أو انقر للاختيار
            </span>
            <span style={{ color: "#555", fontSize: 11 }}>JPEG · PNG · WebP · GIF · حتى 5 MB</span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={onInputChange}
        />
      </div>

      {/* Error */}
      {uploadError && (
        <div
          style={{
            display: "flex", alignItems: "center", gap: 6, marginTop: 6,
            color: "#ef4444", fontSize: 11
          }}
        >
          <AlertCircle size={12} /> {uploadError}
        </div>
      )}

      {/* CSS keyframe for spinner injected once */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MultiImageUploader — for product gallery
// ─────────────────────────────────────────────────────────────

interface MultiImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  id?: string;
}

function MultiImageUploader({ value, onChange, label, id }: MultiImageUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("الملف المحدد ليس صورة.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("حجم الملف يتجاوز 5 ميجابايت.");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post<{ url: string }>("/images/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange([...value, data.url]);
    } catch (err: any) {
      setUploadError(err.message || "فشل رفع الصورة، حاول مجدداً.");
    } finally {
      setUploading(false);
    }
  }, [onChange, value]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  };

  const removeImage = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div id={id}>
      {label && <label className="text-xs text-gray-500 block mb-1.5">{label}</label>}

      {/* Thumbnails */}
      {value.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
          {value.map((url, idx) => (
            <div key={idx} style={{ position: "relative", width: 64, height: 64 }}>
              <img
                src={url}
                alt={`gallery-${idx}`}
                style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(212,175,55,0.2)" }}
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                style={{
                  position: "absolute", top: -6, left: -6,
                  background: "#ef4444", borderRadius: "50%", padding: 2,
                  color: "#fff", display: "flex", alignItems: "center"
                }}
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${dragging ? GOLD : "rgba(212,175,55,0.2)"}`,
          borderRadius: 10,
          background: dragging ? "rgba(212,175,55,0.06)" : "#111",
          padding: "14px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          cursor: uploading ? "not-allowed" : "pointer",
          transition: "all 0.2s",
        }}
      >
        {uploading ? (
          <>
            <div
              style={{
                width: 18, height: 18, borderRadius: "50%",
                border: `2px solid rgba(212,175,55,0.2)`,
                borderTopColor: GOLD,
                animation: "spin 0.8s linear infinite"
              }}
            />
            <span style={{ color: GOLD, fontSize: 12 }}>جاري الرفع…</span>
          </>
        ) : (
          <>
            <Plus size={16} style={{ color: GOLD }} />
            <span style={{ color: "rgba(212,175,55,0.7)", fontSize: 12 }}>
              إضافة صورة للمعرض
            </span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={onInputChange}
        />
      </div>

      {uploadError && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, color: "#ef4444", fontSize: 11 }}>
          <AlertCircle size={12} /> {uploadError}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Nav & status helpers (unchanged)
// ─────────────────────────────────────────────────────────────

const navItems = [
  { k: "overview",    l: "نظرة عامة",  Icon: BarChart2 },
  { k: "orders",      l: "الطلبات",    Icon: Package },
  { k: "products",    l: "المنتجات",   Icon: Box },
  { k: "categories",  l: "الفئات",     Icon: LayoutGrid },
  { k: "banners",     l: "البنرات",    Icon: ImageIcon },
  { k: "settings",    l: "الإعدادات",  Icon: Settings },
];

const statusColors: Record<string, string> = {
  "مكتمل": "#22c55e",    "Completed":  "#22c55e",
  "قيد التوصيل": "#3b82f6", "Shipped": "#3b82f6",
  "قيد المعالجة": GOLD,  "Pending":    GOLD,  "Processing": GOLD,
  "ملغي": "#ef4444",     "Cancelled":  "#ef4444",
};

// ─────────────────────────────────────────────────────────────
//  AdminDashboard
// ─────────────────────────────────────────────────────────────

export function AdminDashboard() {
  const navigate = useNavigate();
  const [sec, setSec] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  usePageTitle("Dashboard");

  const [statsData, setStatsData] = useState<DashboardStatsDto | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [banners, setBanners] = useState<BannerDto[]>([]);
  const [settings, setSettings] = useState<SettingDto | null>(null);
  const [orders, setOrders] = useState<OrderDto[]>([]);

  const [activeProduct, setActiveProduct] = useState<Partial<ProductDto> | null>(null);
  const [customColor, setCustomColor] = useState("#d4af37");
  const [showCustom, setShowCustom] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Partial<CategoryDto> | null>(null);
  const [activeBanner, setActiveBanner] = useState<Partial<BannerDto> | null>(null);
  const [activeOrder, setActiveOrder] = useState<OrderDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [crudError, setCrudError] = useState<string | null>(null);

  // Orders pagination
  const [orderPage, setOrderPage] = useState(1);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderSort, setOrderSort] = useState("newest");
  const pageSize = 10;

  const fetchData = async () => {
    setDashboardLoading(true);
    setDashboardError(null);

    const safeFetch = async <T,>(fetch: Promise<T>, fallback: T): Promise<T> => {
      try { return await fetch; }
      catch { return fallback; }
    };

    const [stats, prodList, catList, banList, setts, ords] = await Promise.all([
      safeFetch(dashboardService.getStats(), null),
      safeFetch(productService.getProducts({ pageSize: 100 }).then(r => r.items), []),
      safeFetch(categoryService.getAll(), []),
      safeFetch(bannerService.getAll(), []),
      safeFetch(settingService.getSettings(), null),
      safeFetch(orderService.getAllOrders(), []),
    ]);

    setStatsData(stats);
    setProducts(prodList);
    setCategories(catList);
    setBanners(banList);
    setSettings(setts);
    setOrders(ords);

    if (!stats && prodList.length === 0 && catList.length === 0) {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/administrator/login"); return; }
      setDashboardError(`تعذر تحميل البيانات — تأكد من أن الخادم الخلفي يعمل وأن عنوان API مضبوط بشكل صحيح (${API_BASE_URL})`);
    }

    setDashboardLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/administrator/login");
  };

  // Settings
  const handleUpdateSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setCrudError(null);
    try {
      const data = new FormData(e.currentTarget);
      const updated = await settingService.updateSettings({
        storeName:        data.get("storeName")        as string,
        contactPhone:     data.get("contactPhone")     as string,
        contactEmail:     data.get("contactEmail")     as string,
        address:          data.get("address")          as string,
        shippingThreshold: Number(data.get("shippingThreshold")) || 900,
        whatsappUrl:      data.get("whatsappUrl")      as string,
        instagramUrl:     data.get("instagramUrl")     as string,
      });
      setSettings(updated);
      toast.success("تم حفظ الإعدادات بنجاح");
    } catch (err: any) {
      setCrudError(err.message || "فشل تحديث الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  // Product CRUD
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    setSaving(true);
    setCrudError(null);
    try {
      if (activeProduct.id) await productService.update(activeProduct.id, activeProduct as any);
      else await productService.create(activeProduct as any);
      toast.success(activeProduct.id ? "تم تحديث المنتج" : "تم إضافة المنتج");
      setActiveProduct(null);
      await fetchData();
    } catch (err: any) {
      setCrudError(err.message || "فشل حفظ المنتج");
    } finally { setSaving(false); }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    try { await productService.delete(id); toast.success("تم حذف المنتج"); await fetchData(); }
    catch (err: any) { toast.error(err.message || "فشل حذف المنتج"); }
  };

  // Category CRUD
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCategory) return;
    setSaving(true);
    setCrudError(null);
    try {
      if (activeCategory.id) await categoryService.update(activeCategory.id, activeCategory as any);
      else await categoryService.create(activeCategory as any);
      toast.success(activeCategory.id ? "تم تحديث الفئة" : "تم إضافة الفئة");
      setActiveCategory(null);
      await fetchData();
    } catch (err: any) {
      setCrudError(err.message || "فشل حفظ الفئة");
    } finally { setSaving(false); }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه الفئة؟")) return;
    try { await categoryService.delete(id); toast.success("تم حذف الفئة"); await fetchData(); }
    catch (err: any) { toast.error(err.message || "فشل حذف الفئة"); }
  };

  // Banner CRUD
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBanner) return;
    setSaving(true);
    setCrudError(null);
    try {
      if (activeBanner.id) await bannerService.update(activeBanner.id, activeBanner as any);
      else await bannerService.create(activeBanner as any);
      toast.success(activeBanner.id ? "تم تحديث البنر" : "تم إضافة البنر");
      setActiveBanner(null);
      await fetchData();
    } catch (err: any) {
      setCrudError(err.message || "فشل حفظ البنر");
    } finally { setSaving(false); }
  };

  const handleDeleteBanner = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا البنر؟")) return;
    try { await bannerService.delete(id); toast.success("تم حذف البنر"); await fetchData(); }
    catch (err: any) { toast.error(err.message || "فشل حذف البنر"); }
  };

  // Order status
  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      await orderService.updateStatus(orderId, status);
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "فشل تحديث حالة الطلب");
    }
  };

  // Derived data
  const stats = [
    { l: "إجمالي المبيعات",  v: `${statsData?.totalSales || 0} ج.م`,                ch: "+12%", Icon: DollarSign, c: GOLD },
    { l: "الطلب اليوم",       v: `${statsData?.todayOrdersCount || 0}`,               ch: "+8%",  Icon: Package,    c: "#3b82f6" },
    { l: "العملاء النشطين",   v: `${statsData?.activeCustomersCount || 0}`,           ch: "+5%",  Icon: Users,      c: "#22c55e" },
    { l: "المنتجات المعروضة", v: `${statsData?.totalProductsCount || 0}`,             ch: "+2",   Icon: Box,        c: "#a855f7" },
  ];

  const salesHistory   = statsData?.salesHistory || [];
  const maxSaleAmount  = Math.max(...salesHistory.map(h => h.totalAmount), 1);
  const chartBars      = salesHistory.map(h => ({ day: h.dayName, h: Math.round((h.totalAmount / maxSaleAmount) * 100) }));
  const topCategories  = statsData?.topCategories || [];

  // Orders pagination
  const filteredOrders   = orders
    .filter(o => !orderSearch || o.customerName.includes(orderSearch) || o.orderNumber.includes(orderSearch))
    .sort((a, b) => orderSort === "newest"
      ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const totalOrderPages  = Math.ceil(filteredOrders.length / pageSize);
  const pagedOrders      = filteredOrders.slice((orderPage - 1) * pageSize, orderPage * pageSize);

  // ────────────────────────────────────────────────────────────
  //  Render
  // ────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: BG }}>
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 right-0 z-50 w-60 flex flex-col shrink-0 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`} style={{ background: DARK_BG, borderLeft: `1px solid rgba(212,175,55,0.08)` }}>
        <div className="p-5 border-b" style={{ borderColor: "rgba(212,175,55,0.08)" }}>
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="A.S Brand Store"
              style={{ height: 38, width: "auto", objectFit: "contain" }}
            />
            <div><div className="font-black text-white text-sm">A.S Brand</div><div className="text-xs" style={{ color: GOLD }}>لوحة التحكم</div></div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ k, l, Icon }) => (
            <button key={k} onClick={() => setSec(k)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-right transition-all" style={{ color: sec === k ? GOLD : "#777", background: sec === k ? "rgba(212,175,55,0.1)" : "transparent", borderLeft: sec === k ? `3px solid ${GOLD}` : "3px solid transparent" }}>
              <Icon size={17} /> {l}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t" style={{ borderColor: "rgba(212,175,55,0.08)" }}>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-right text-gray-600 hover:text-white transition-colors"><LogOut size={17} /> تسجيل الخروج</button>
          <button onClick={() => { navigate("/"); window.scrollTo(0, 0); }} className="w-full mt-1.5 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-right text-gray-600 hover:text-white transition-colors"><ArrowLeft size={17} /> خروج للمتجر</button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 px-4 lg:px-8 py-4 flex items-center justify-between" style={{ background: "rgba(15,15,15,0.97)", backdropFilter: "blur(20px)", borderBottom: `1px solid rgba(212,175,55,0.08)` }}>
          <button className="lg:hidden p-2 rounded-xl mr-2" style={{ color: GOLD, background: "rgba(212,175,55,0.08)" }} onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <div><h1 className="text-lg font-black text-white">{navItems.find(n => n.k === sec)?.l}</h1><p className="text-xs text-gray-600">لوحة تحكم المشرف</p></div>
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Admin"
              className="w-10 h-10 rounded-xl object-contain border"
              style={{ borderColor: "rgba(212,175,55,0.2)", background: "rgba(255,255,255,0.03)" }}
            />
          </div>
        </div>

        <div className="p-4 lg:p-8">
          {dashboardLoading ? (
            sec === "overview" ? <DashboardSkeleton /> : <OrderSkeleton />
          ) : dashboardError ? (
            <div className="text-center py-20 text-red-500">{dashboardError}</div>
          ) : (
            <>
              {/* ── Overview ── */}
              {sec === "overview" && (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                    {stats.map(({ l, v, ch, Icon, c }) => (
                      <div key={l} className="rounded-2xl p-5" style={{ background: "rgba(26,26,26,0.8)", border: `1px solid rgba(212,175,55,0.08)`, backdropFilter: "blur(12px)" }}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${c}18` }}><Icon size={19} style={{ color: c }} /></div>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>{ch}</span>
                        </div>
                        <div className="text-2xl font-black text-white mb-0.5">{v}</div>
                        <div className="text-xs text-gray-500">{l}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-8">
                    <div className="xl:col-span-2 rounded-2xl p-6" style={{ background: "rgba(26,26,26,0.8)", border: `1px solid rgba(212,175,55,0.08)` }}>
                      <h3 className="font-bold text-white mb-5 flex items-center gap-2"><TrendingUp size={16} style={{ color: GOLD }} /> إحصائيات المبيعات</h3>
                      {chartBars.length > 0 ? (
                        <div className="flex items-end gap-2" style={{ height: 160 }}>
                          {chartBars.map(({ day, h }, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                              <div className="w-full rounded-t-lg transition-all" style={{ height: `${Math.max(5, h)}%`, background: `linear-gradient(180deg, ${GOLD}, ${LIGHT_GOLD})` }} />
                              <span className="text-xs text-gray-600" style={{ fontSize: 10 }}>{day}</span>
                            </div>
                          ))}
                        </div>
                      ) : <div className="text-center py-10 text-gray-500 text-xs">لا توجد بيانات مبيعات كافية للرسم البياني</div>}
                    </div>
                    <div className="rounded-2xl p-6" style={{ background: "rgba(26,26,26,0.8)", border: `1px solid rgba(212,175,55,0.08)` }}>
                      <h3 className="font-bold text-white mb-5 text-sm">أفضل الفئات مبيعاً</h3>
                      <div className="space-y-4">
                        {topCategories.length > 0 ? topCategories.map(({ categoryName, percentage }) => (
                          <div key={categoryName}>
                            <div className="flex justify-between text-xs mb-1"><span className="text-gray-400">{categoryName}</span><span style={{ color: GOLD }}>{Math.round(percentage)}%</span></div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                              <div className="h-full rounded-full" style={{ width: `${percentage}%`, background: `linear-gradient(90deg, ${GOLD}, ${LIGHT_GOLD})` }} />
                            </div>
                          </div>
                        )) : <div className="text-center py-10 text-gray-500 text-xs">لا توجد بيانات مبيعات فئات متاحة</div>}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(26,26,26,0.8)", border: `1px solid rgba(212,175,55,0.08)` }}>
                    <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "rgba(212,175,55,0.06)" }}>
                      <h3 className="font-bold text-white text-sm">آخر الطلبات</h3>
                      <button onClick={() => setSec("orders")} className="text-xs font-semibold" style={{ color: GOLD }}>عرض الكل</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead><tr style={{ borderBottom: `1px solid rgba(212,175,55,0.06)` }}>
                          {["رقم الطلب", "العميل", "الإجمالي", "الحالة", "التاريخ"].map(h => <th key={h} className="text-right px-5 py-3 text-xs text-gray-600 font-semibold">{h}</th>)}
                        </tr></thead>
                        <tbody>
                          {statsData?.latestOrders?.length ? statsData.latestOrders.slice(0, 5).map((o, i) => (
                            <tr key={o.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: i < 4 ? `1px solid rgba(255,255,255,0.03)` : "none" }}>
                              <td className="px-5 py-3.5 text-sm font-bold" style={{ color: GOLD }}>{o.orderNumber}</td>
                              <td className="px-5 py-3.5 text-sm text-white">{o.customerName}</td>
                              <td className="px-5 py-3.5 text-sm text-white font-semibold">{o.grandTotal} ج.م</td>
                              <td className="px-5 py-3.5"><span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${statusColors[o.status] || GOLD}15`, color: statusColors[o.status] || GOLD }}>{o.status}</span></td>
                              <td className="px-5 py-3.5 text-xs text-gray-600" dir="ltr">{new Date(o.createdAt).toLocaleDateString("ar-EG")}</td>
                            </tr>
                          )) : <tr><td colSpan={5} className="text-center py-6 text-xs text-gray-500">لا توجد طلبات حديثة</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Orders ── */}
              {sec === "orders" && (
                <div>
                  <div className="flex flex-col sm:flex-row gap-3 mb-5 items-start sm:items-center justify-between">
                    <div className="flex gap-3 items-center">
                      <input type="text" placeholder="بحث برقم الطلب أو اسم العميل..." value={orderSearch} onChange={e => { setOrderSearch(e.target.value); setOrderPage(1); }} className="rounded-xl px-4 py-2 text-sm text-white outline-none placeholder-gray-600 w-64" style={{ background: "#111", border: `1px solid rgba(212,175,55,0.15)` }} />
                      <select value={orderSort} onChange={e => setOrderSort(e.target.value)} className="rounded-xl px-3 py-2 text-xs outline-none cursor-pointer" style={{ background: CARD, color: "#ccc", border: `1px solid rgba(212,175,55,0.18)` }}>
                        <option value="newest">الأحدث أولاً</option>
                        <option value="oldest">الأقدم أولاً</option>
                      </select>
                    </div>
                    <span className="text-xs text-gray-500">إجمالي: {filteredOrders.length} طلب</span>
                  </div>
                  <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(26,26,26,0.8)", border: `1px solid rgba(212,175,55,0.08)` }}>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead><tr style={{ borderBottom: `1px solid rgba(212,175,55,0.06)` }}>
                          {["رقم الطلب", "العميل", "المحافظة", "الإجمالي", "الحالة", "التاريخ", "إجراءات"].map(h => <th key={h} className="text-right px-5 py-3 text-xs text-gray-600 font-semibold">{h}</th>)}
                        </tr></thead>
                        <tbody>
                          {pagedOrders.length > 0 ? pagedOrders.map((o, i) => (
                            <tr key={o.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: i < pagedOrders.length - 1 ? `1px solid rgba(255,255,255,0.03)` : "none" }}>
                              <td className="px-5 py-3.5 text-sm font-bold" style={{ color: GOLD }}>{o.orderNumber}</td>
                              <td className="px-5 py-3.5 text-sm text-white">{o.customerName}</td>
                              <td className="px-5 py-3.5 text-sm text-gray-400">{o.governorate}</td>
                              <td className="px-5 py-3.5 text-sm text-white font-semibold">{o.grandTotal} ج.م</td>
                              <td className="px-5 py-3.5">
                                <select value={o.status} onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                  className="text-xs font-bold px-2 py-1 rounded-lg outline-none cursor-pointer"
                                  style={{ background: `${statusColors[o.status] || GOLD}15`, color: statusColors[o.status] || GOLD }}>
                                  <option value="Pending">قيد المعالجة</option>
                                  <option value="Processing">جاري التجهيز</option>
                                  <option value="Shipped">قيد التوصيل</option>
                                  <option value="Completed">مكتمل</option>
                                  <option value="Cancelled">ملغي</option>
                                </select>
                              </td>
                              <td className="px-5 py-3.5 text-xs text-gray-600" dir="ltr">{new Date(o.createdAt).toLocaleDateString("ar-EG")}</td>
                              <td className="px-5 py-3.5">
                                <button onClick={() => setActiveOrder(o)} className="text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1" style={{ background: "rgba(212,175,55,0.1)", color: GOLD }}>
                                  <Eye size={12} /> تفاصيل
                                </button>
                              </td>
                            </tr>
                          )) : <tr><td colSpan={7} className="text-center py-6 text-xs text-gray-500">لا توجد طلبات مطابقة</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {totalOrderPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-6">
                      <button disabled={orderPage === 1} onClick={() => setOrderPage(p => p - 1)} className="px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-30" style={{ background: "rgba(212,175,55,0.1)", color: GOLD, border: `1px solid ${GOLD}` }}>السابق</button>
                      <span className="text-xs text-gray-400">صفحة {orderPage} من {totalOrderPages}</span>
                      <button disabled={orderPage === totalOrderPages} onClick={() => setOrderPage(p => p + 1)} className="px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-30" style={{ background: "rgba(212,175,55,0.1)", color: GOLD, border: `1px solid ${GOLD}` }}>التالي</button>
                    </div>
                  )}
                </div>
              )}

              {/* ── Products ── */}
              {sec === "products" && (
                <div>
                  <div className="flex justify-between items-center mb-5">
                    <p className="text-gray-500 text-sm">إجمالي المنتجات: {products.length}</p>
                    <GoldBtn onClick={() => setActiveProduct({ name: "", price: 0, originalPrice: 0, image: "", categoryId: categories[0]?.id || 0, badge: "", description: "", stock: 10, isFeatured: false, isBestSeller: false, colors: [], images: [], specs: [] })} size="sm">+ إضافة منتج</GoldBtn>
                  </div>
                  <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(26,26,26,0.8)", border: `1px solid rgba(212,175,55,0.08)` }}>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead><tr style={{ borderBottom: `1px solid rgba(212,175,55,0.06)` }}>
                          {["المنتج", "الفئة", "السعر", "المخزون", "التقييم", "إجراءات"].map(h => <th key={h} className="text-right px-5 py-3 text-xs text-gray-600 font-semibold">{h}</th>)}
                        </tr></thead>
                        <tbody>
                          {products.map((p, i) => (
                            <tr key={p.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: i < products.length - 1 ? `1px solid rgba(255,255,255,0.03)` : "none" }}>
                              <td className="px-5 py-3.5"><div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0" style={{ background: "#111" }}><img loading="lazy" src={p.image} alt={p.name} className="w-full h-full object-cover" /></div>
                                <span className="text-sm text-white font-semibold">{p.name}</span>
                              </div></td>
                              <td className="px-5 py-3.5 text-sm text-gray-400">{p.categoryName}</td>
                              <td className="px-5 py-3.5 text-sm font-black" style={{ color: GOLD }}>{p.price} ج.م</td>
                              <td className="px-5 py-3.5 text-sm text-white">{p.stock}</td>
                              <td className="px-5 py-3.5"><div className="flex items-center gap-1.5"><Star size={12} fill={GOLD} stroke={GOLD} /><span className="text-sm text-white">{p.rating}</span></div></td>
                              <td className="px-5 py-3.5"><div className="flex gap-2">
                                <button onClick={() => setActiveProduct(p)} className="text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1" style={{ background: "rgba(212,175,55,0.1)", color: GOLD }}><Edit size={12} /> تعديل</button>
                                <button onClick={() => handleDeleteProduct(p.id)} className="text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}><Trash size={12} /> حذف</button>
                              </div></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Categories ── */}
              {sec === "categories" && (
                <div>
                  <div className="flex justify-between items-center mb-5">
                    <p className="text-gray-500 text-sm">إجمالي الفئات: {categories.length}</p>
                    <GoldBtn onClick={() => setActiveCategory({ name: "", icon: "LayoutGrid", imageUrl: "" })} size="sm">+ إضافة فئة</GoldBtn>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {categories.map(c => (
                      <div key={c.id} className="rounded-2xl overflow-hidden" style={{ background: "rgba(26,26,26,0.8)", border: `1px solid rgba(212,175,55,0.08)` }}>
                        <div style={{ height: 130, background: "#111" }}><img loading="lazy" src={c.imageUrl} alt={c.name} className="w-full h-full object-cover opacity-45" /></div>
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(212,175,55,0.1)" }}><span style={{ color: GOLD }}>{getIconComponent(c.icon, 20)}</span></div>
                            <div><p className="font-bold text-white text-sm">{c.name}</p><p className="text-xs text-gray-500">{c.productsCount} منتج</p></div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setActiveCategory(c)} className="text-xs px-2.5 py-1 rounded-lg" style={{ background: "rgba(212,175,55,0.1)", color: GOLD }}>تعديل</button>
                            <button onClick={() => handleDeleteCategory(c.id)} className="text-xs px-2.5 py-1 rounded-lg" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>حذف</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Banners ── */}
              {sec === "banners" && (
                <div>
                  <div className="flex justify-between items-center mb-5">
                    <p className="text-gray-500 text-sm">إجمالي البنرات: {banners.length}</p>
                    <GoldBtn onClick={() => setActiveBanner({ title: "", subtitle: "", ctaText: "تسوق الآن", imageUrl: "", badge: "", orderIndex: 0 })} size="sm">+ إضافة بنر</GoldBtn>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {banners.map(sl => (
                      <div key={sl.id} className="rounded-2xl overflow-hidden" style={{ background: "rgba(26,26,26,0.8)", border: `1px solid rgba(212,175,55,0.08)` }}>
                        <div style={{ height: 150, background: "#111" }}><img loading="lazy" src={sl.imageUrl} alt={sl.title} className="w-full h-full object-cover opacity-45" /></div>
                        <div className="p-4">
                          <p className="font-bold text-white text-sm mb-1">{sl.title}</p>
                          <p className="text-xs text-gray-500 mb-3">{sl.subtitle}</p>
                          <div className="flex gap-2">
                            <button onClick={() => setActiveBanner(sl)} className="text-xs px-2.5 py-1 rounded-lg" style={{ background: "rgba(212,175,55,0.1)", color: GOLD }}>تعديل</button>
                            <button onClick={() => handleDeleteBanner(sl.id)} className="text-xs px-2.5 py-1 rounded-lg" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>حذف</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Settings ── */}
              {sec === "settings" && settings && (
                <div className="max-w-2xl space-y-6">
                  <form onSubmit={handleUpdateSettings} className="rounded-2xl p-6" style={{ background: "rgba(26,26,26,0.8)", border: `1px solid rgba(212,175,55,0.08)` }}>
                    <h3 className="font-bold text-white mb-5">إعدادات المتجر</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                      {[
                        { k: "storeName",    l: "اسم المتجر",         v: settings.storeName },
                        { k: "contactPhone", l: "رقم التواصل",        v: settings.contactPhone },
                        { k: "contactEmail", l: "البريد الإلكتروني",  v: settings.contactEmail },
                        { k: "address",      l: "العنوان",             v: settings.address },
                        { k: "whatsappUrl",  l: "رابط الواتساب",      v: settings.whatsappUrl },
                        { k: "instagramUrl", l: "رابط الإنستجرام",    v: settings.instagramUrl },
                      ].map(({ k, l, v }) => (
                        <div key={k}><label className="text-xs text-gray-500 block mb-1.5">{l}</label>
                          <input required type="text" name={k} defaultValue={v} className="w-full rounded-xl px-4 py-2.5 text-white text-sm outline-none" style={{ background: "#111", border: `1px solid rgba(212,175,55,0.15)` }} /></div>
                      ))}
                    </div>

                    {/* ── Announcement Bar Settings ── */}
                    <div className="border-t pt-5 mt-2" style={{ borderColor: "rgba(212,175,55,0.1)" }}>
                      <h4 className="font-bold text-white mb-4 text-sm">إعدادات شريط الإعلانات</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                        <div>
                          <label className="text-xs text-gray-500 block mb-1.5">حد الشحن المجاني (ج.م)</label>
                          <input
                            required
                            type="number"
                            name="shippingThreshold"
                            min={0}
                            defaultValue={settings.shippingThreshold}
                            className="w-full rounded-xl px-4 py-2.5 text-white text-sm outline-none"
                            style={{ background: "#111", border: `1px solid rgba(212,175,55,0.15)` }}
                            onChange={(e) => {
                              const preview = document.getElementById("announcement-preview");
                              if (preview) {
                                const phoneInput = document.querySelector<HTMLInputElement>("input[name='contactPhone']");
                                preview.textContent = `🚚 شحن مجاني للطلبات فوق ${e.target.value || 900} ج.م | تواصل: ${phoneInput?.value || settings.contactPhone}`;
                              }
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block mb-1.5">رقم التواصل (يظهر في شريط الإعلانات)</label>
                          <input
                            disabled
                            type="text"
                            value={settings.contactPhone}
                            className="w-full rounded-xl px-4 py-2.5 text-gray-500 text-sm outline-none cursor-not-allowed"
                            style={{ background: "#0a0a0a", border: `1px solid rgba(212,175,55,0.08)` }}
                          />
                          <span className="text-[10px] text-gray-600 mt-1 block">يمكنك تعديل رقم التواصل من الحقل أعلاه</span>
                        </div>
                      </div>
                      <div className="rounded-xl p-3 text-center" style={{ background: "rgba(212,175,55,0.04)", border: `1px solid rgba(212,175,55,0.12)` }}>
                        <span className="text-[10px] text-gray-600 block mb-1">معاينة مباشرة</span>
                        <span id="announcement-preview" className="text-xs text-gray-400">
                          🚚 شحن مجاني للطلبات فوق {settings.shippingThreshold} ج.م | تواصل: {settings.contactPhone}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <GoldBtn type="submit" disabled={saving} size="md">{saving ? "جاري الحفظ..." : "حفظ الإعدادات"}</GoldBtn>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ═══════════════════ Product Modal ═══════════════════ */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleSaveProduct} className="w-full max-w-2xl rounded-2xl p-6 overflow-y-auto max-h-[90vh] space-y-4" style={{ background: CARD, border: `1px solid rgba(212,175,55,0.15)` }}>
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <h3 className="font-bold text-white text-lg">{activeProduct.id ? "تعديل المنتج" : "إضافة منتج جديد"}</h3>
              <button type="button" onClick={() => setActiveProduct(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>
            {crudError && <p className="text-xs text-red-500 py-1 text-center font-bold">{crudError}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div><label className="text-xs text-gray-500 block mb-1.5">اسم المنتج</label>
                <input required type="text" value={activeProduct.name} onChange={(e) => setActiveProduct({ ...activeProduct, name: e.target.value })} className="w-full rounded-xl px-4 py-2.5 text-white text-sm outline-none" style={{ background: "#111", border: `1px solid rgba(212,175,55,0.15)` }} /></div>

              {/* Category */}
              <div><label className="text-xs text-gray-500 block mb-1.5">الفئة</label>
                <select required value={activeProduct.categoryId} onChange={(e) => setActiveProduct({ ...activeProduct, categoryId: Number(e.target.value) })} className="w-full rounded-xl px-4 py-2.5 text-white text-sm outline-none" style={{ background: "#111", border: `1px solid rgba(212,175,55,0.15)` }}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select></div>

              {/* Price */}
              <div><label className="text-xs text-gray-500 block mb-1.5">السعر (ج.م)</label>
                <input required type="number" value={activeProduct.price} onChange={(e) => setActiveProduct({ ...activeProduct, price: Number(e.target.value) })} className="w-full rounded-xl px-4 py-2.5 text-white text-sm outline-none" style={{ background: "#111", border: `1px solid rgba(212,175,55,0.15)` }} /></div>

              {/* Original price */}
              <div><label className="text-xs text-gray-500 block mb-1.5">السعر الأصلي (ج.م)</label>
                <input required type="number" value={activeProduct.originalPrice} onChange={(e) => setActiveProduct({ ...activeProduct, originalPrice: Number(e.target.value) })} className="w-full rounded-xl px-4 py-2.5 text-white text-sm outline-none" style={{ background: "#111", border: `1px solid rgba(212,175,55,0.15)` }} /></div>

              {/* Stock */}
              <div><label className="text-xs text-gray-500 block mb-1.5">المخزون</label>
                <input required type="number" value={activeProduct.stock} onChange={(e) => setActiveProduct({ ...activeProduct, stock: Number(e.target.value) })} className="w-full rounded-xl px-4 py-2.5 text-white text-sm outline-none" style={{ background: "#111", border: `1px solid rgba(212,175,55,0.15)` }} /></div>

              {/* Badge */}
              <div><label className="text-xs text-gray-500 block mb-1.5">الشارة</label>
                <input type="text" value={activeProduct.badge || ""} onChange={(e) => setActiveProduct({ ...activeProduct, badge: e.target.value })} className="w-full rounded-xl px-4 py-2.5 text-white text-sm outline-none" style={{ background: "#111", border: `1px solid rgba(212,175,55,0.15)` }} /></div>

              {/* Main image — Cloudinary upload */}
              <div className="md:col-span-2">
                <ImageUploader
                  id="product-main-image-uploader"
                  label="الصورة الرئيسية *"
                  required
                  value={activeProduct.image || ""}
                  onChange={(url) => setActiveProduct({ ...activeProduct, image: url })}
                />
              </div>

              {/* Gallery images — Cloudinary multi-upload */}
              <div className="md:col-span-2">
                <MultiImageUploader
                  id="product-gallery-uploader"
                  label="صور المعرض (اختياري)"
                  value={activeProduct.images || []}
                  onChange={(urls) => setActiveProduct({ ...activeProduct, images: urls })}
                />
              </div>

              {/* Colors */}
              <div className="md:col-span-2 space-y-3.5">
                <label className="text-xs text-gray-500 block mb-1">ألوان المنتج المحددة:</label>
                
                {/* Selected Colors Pills */}
                <div className="flex flex-wrap gap-2 p-3 rounded-xl border min-h-[50px] items-center" style={{ background: "#111", borderColor: "rgba(212,175,55,0.15)" }}>
                  {(!activeProduct.colors || activeProduct.colors.length === 0) ? (
                    <span className="text-xs text-gray-600">لا توجد ألوان محددة للمنتج. اختر من القائمة أدناه أو أضف لوناً مخصصاً.</span>
                  ) : (
                    activeProduct.colors.map((hex) => {
                      const predefined = PREDEFINED_COLORS.find(c => c.hex.toLowerCase() === hex.toLowerCase());
                      const displayName = predefined ? predefined.name.split(" / ")[1] : hex;
                      return (
                        <div
                          key={hex}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold border text-white transition-all"
                          style={{ background: "#1a1a1a", borderColor: "rgba(212,175,55,0.25)" }}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20 block animate-pulse"
                            style={{ backgroundColor: hex }}
                          />
                          <span>{displayName}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = activeProduct.colors?.filter(c => c.toLowerCase() !== hex.toLowerCase()) || [];
                              setActiveProduct({ ...activeProduct, colors: updated });
                            }}
                            className="text-gray-500 hover:text-red-500 transition-colors mr-1 cursor-pointer font-black text-[10px]"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Predefined Colors Grid */}
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">اختر من الألوان الشائعة:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {PREDEFINED_COLORS.map((colorOption) => {
                      const isSelected = activeProduct.colors?.some(c => c.toLowerCase() === colorOption.hex.toLowerCase()) || false;
                      return (
                        <button
                          key={colorOption.hex}
                          type="button"
                          onClick={() => {
                            let updated = activeProduct.colors ? [...activeProduct.colors] : [];
                            if (isSelected) {
                              updated = updated.filter(c => c.toLowerCase() !== colorOption.hex.toLowerCase());
                            } else {
                              updated.push(colorOption.hex);
                            }
                            setActiveProduct({ ...activeProduct, colors: updated });
                          }}
                          className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-right transition-all border cursor-pointer hover:bg-white/[0.02]"
                          style={{
                            background: isSelected ? "rgba(212,175,55,0.08)" : "#151515",
                            borderColor: isSelected ? GOLD : "rgba(212,175,55,0.08)",
                            color: isSelected ? GOLD : "#aaa"
                          }}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/10 shrink-0 block"
                            style={{ backgroundColor: colorOption.hex }}
                          />
                          <span className="truncate">{colorOption.name.split(" / ")[1]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Color Mode Toggle */}
                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-400">
                    <input
                      type="checkbox"
                      checked={showCustom}
                      onChange={(e) => setShowCustom(e.target.checked)}
                    />
                    <span>تفعيل إضافة لون مخصص (Custom Color)</span>
                  </label>
                  
                  {showCustom && (
                    <div className="flex items-center gap-3 mt-3 p-3 rounded-xl border bg-[#151515]" style={{ borderColor: "rgba(212,175,55,0.1)" }}>
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="#HEX"
                          value={customColor}
                          onChange={(e) => setCustomColor(e.target.value)}
                          className="w-full rounded-xl px-3 py-2 text-white text-xs outline-none uppercase font-bold"
                          style={{ background: "#111", border: `1px solid rgba(212,175,55,0.15)` }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (/^#[0-9A-F]{6}$/i.test(customColor)) {
                            const updated = activeProduct.colors ? [...activeProduct.colors] : [];
                            if (!updated.some(c => c.toLowerCase() === customColor.toLowerCase())) {
                              updated.push(customColor);
                              setActiveProduct({ ...activeProduct, colors: updated });
                            }
                          }
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        style={{ background: GOLD, color: BG }}
                      >
                        إضافة
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2"><label className="text-xs text-gray-500 block mb-1.5">الوصف التفصيلي</label>
                <textarea required rows={4} value={activeProduct.description} onChange={(e) => setActiveProduct({ ...activeProduct, description: e.target.value })} className="w-full rounded-xl px-4 py-2.5 text-white text-sm outline-none resize-none" style={{ background: "#111", border: `1px solid rgba(212,175,55,0.15)` }} /></div>

              {/* Featured / Best-seller */}
              <div className="md:col-span-2 flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-400">
                  <input type="checkbox" checked={!!activeProduct.isFeatured} onChange={(e) => setActiveProduct({ ...activeProduct, isFeatured: e.target.checked })} /> منتج مميز
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-400">
                  <input type="checkbox" checked={!!activeProduct.isBestSeller} onChange={(e) => setActiveProduct({ ...activeProduct, isBestSeller: e.target.checked })} /> الأكثر مبيعاً
                </label>
              </div>

              {/* Specs */}
              <div className="md:col-span-2 border-t border-white/5 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-gray-400 font-bold">المواصفات الفنية</span>
                  <button type="button" onClick={() => setActiveProduct({ ...activeProduct, specs: [...(activeProduct.specs || []), { label: "", value: "" }] })} className="text-xs px-2.5 py-1 rounded-lg" style={{ background: "rgba(212,175,55,0.1)", color: GOLD }}>+ إضافة مواصفة</button>
                </div>
                <div className="space-y-2">
                  {activeProduct.specs?.map((spec, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input placeholder="المواصفة" value={spec.label} onChange={(e) => { const s = [...(activeProduct.specs || [])]; s[idx] = { ...s[idx], label: e.target.value }; setActiveProduct({ ...activeProduct, specs: s }); }} className="flex-1 rounded-xl px-3 py-2 text-white text-xs outline-none" style={{ background: "#111", border: `1px solid rgba(212,175,55,0.15)` }} />
                      <input placeholder="القيمة" value={spec.value} onChange={(e) => { const s = [...(activeProduct.specs || [])]; s[idx] = { ...s[idx], value: e.target.value }; setActiveProduct({ ...activeProduct, specs: s }); }} className="flex-1 rounded-xl px-3 py-2 text-white text-xs outline-none" style={{ background: "#111", border: `1px solid rgba(212,175,55,0.15)` }} />
                      <button type="button" onClick={() => setActiveProduct({ ...activeProduct, specs: (activeProduct.specs || []).filter((_, i) => i !== idx) })} className="p-2 text-red-500 hover:opacity-75"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-3 justify-end border-t border-white/5">
              <GoldBtn type="submit" disabled={saving} size="md">{saving ? "جاري الحفظ..." : "حفظ المنتج"}</GoldBtn>
              <button type="button" onClick={() => setActiveProduct(null)} className="px-6 py-3 rounded-xl font-bold text-sm text-gray-500 hover:text-white">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════════════════ Category Modal ═══════════════════ */}
      {activeCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleSaveCategory} className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background: CARD, border: `1px solid rgba(212,175,55,0.15)` }}>
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <h3 className="font-bold text-white text-lg">{activeCategory.id ? "تعديل الفئة" : "إضافة فئة جديدة"}</h3>
              <button type="button" onClick={() => setActiveCategory(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>
            {crudError && <p className="text-xs text-red-500 py-1 text-center font-bold">{crudError}</p>}

            <div className="space-y-3">
              {/* Category name */}
              <div><label className="text-xs text-gray-500 block mb-1.5">اسم الفئة</label>
                <input required type="text" value={activeCategory.name} onChange={(e) => setActiveCategory({ ...activeCategory, name: e.target.value })} className="w-full rounded-xl px-4 py-2.5 text-white text-sm outline-none" style={{ background: "#111", border: `1px solid rgba(212,175,55,0.15)` }} /></div>

              {/* Icon name */}
              <div><label className="text-xs text-gray-500 block mb-1.5">اسم الأيقونة (Headphones, Zap, etc)</label>
                <input required type="text" value={activeCategory.icon} onChange={(e) => setActiveCategory({ ...activeCategory, icon: e.target.value })} className="w-full rounded-xl px-4 py-2.5 text-white text-sm outline-none" style={{ background: "#111", border: `1px solid rgba(212,175,55,0.15)` }} /></div>

              {/* Category image — Cloudinary upload */}
              <ImageUploader
                id="category-image-uploader"
                label="صورة الفئة *"
                required
                value={activeCategory.imageUrl || ""}
                onChange={(url) => setActiveCategory({ ...activeCategory, imageUrl: url })}
              />
            </div>

            <div className="pt-4 flex gap-3 justify-end border-t border-white/5">
              <GoldBtn type="submit" disabled={saving} size="md">{saving ? "جاري الحفظ..." : "حفظ الفئة"}</GoldBtn>
              <button type="button" onClick={() => setActiveCategory(null)} className="px-6 py-3 rounded-xl font-bold text-sm text-gray-500 hover:text-white">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════════════════ Banner Modal ═══════════════════ */}
      {activeBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleSaveBanner} className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background: CARD, border: `1px solid rgba(212,175,55,0.15)` }}>
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <h3 className="font-bold text-white text-lg">{activeBanner.id ? "تعديل البنر" : "إضافة بنر جديد"}</h3>
              <button type="button" onClick={() => setActiveBanner(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>
            {crudError && <p className="text-xs text-red-500 py-1 text-center font-bold">{crudError}</p>}

            <div className="space-y-3">
              {/* Text fields */}
              {[
                { k: "title",    l: "العنوان الرئيسي",  v: activeBanner.title },
                { k: "subtitle", l: "العنوان الفرعي",   v: activeBanner.subtitle },
                { k: "ctaText",  l: "نص الزر (CTA)",    v: activeBanner.ctaText },
              ].map(({ k, l, v }) => (
                <div key={k}><label className="text-xs text-gray-500 block mb-1.5">{l}</label>
                  <input required type="text" value={v} onChange={(e) => setActiveBanner({ ...activeBanner, [k]: e.target.value })} className="w-full rounded-xl px-4 py-2.5 text-white text-sm outline-none" style={{ background: "#111", border: `1px solid rgba(212,175,55,0.15)` }} /></div>
              ))}

              {/* Banner image — Cloudinary upload */}
              <ImageUploader
                id="banner-image-uploader"
                label="صورة البنر *"
                required
                value={activeBanner.imageUrl || ""}
                onChange={(url) => setActiveBanner({ ...activeBanner, imageUrl: url })}
              />

              {/* Badge */}
              <div><label className="text-xs text-gray-500 block mb-1.5">الشارة (اختياري)</label>
                <input type="text" value={activeBanner.badge || ""} onChange={(e) => setActiveBanner({ ...activeBanner, badge: e.target.value })} className="w-full rounded-xl px-4 py-2.5 text-white text-sm outline-none" style={{ background: "#111", border: `1px solid rgba(212,175,55,0.15)` }} /></div>

              {/* Order index */}
              <div><label className="text-xs text-gray-500 block mb-1.5">مؤشر الترتيب</label>
                <input required type="number" value={activeBanner.orderIndex} onChange={(e) => setActiveBanner({ ...activeBanner, orderIndex: Number(e.target.value) })} className="w-full rounded-xl px-4 py-2.5 text-white text-sm outline-none" style={{ background: "#111", border: `1px solid rgba(212,175,55,0.15)` }} /></div>
            </div>

            <div className="pt-4 flex gap-3 justify-end border-t border-white/5">
              <GoldBtn type="submit" disabled={saving} size="md">{saving ? "جاري الحفظ..." : "حفظ البنر"}</GoldBtn>
              <button type="button" onClick={() => setActiveBanner(null)} className="px-6 py-3 rounded-xl font-bold text-sm text-gray-500 hover:text-white">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════════════════ Order Details Modal ═══════════════════ */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl p-6 space-y-4 text-right" style={{ background: CARD, border: `1px solid rgba(212,175,55,0.15)` }}>
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <h3 className="font-bold text-white text-lg">تفاصيل الطلب #{activeOrder.orderNumber}</h3>
              <button type="button" onClick={() => setActiveOrder(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-2 text-sm text-gray-300">
              <p><strong className="text-white">العميل:</strong> {activeOrder.customerName}</p>
              <p><strong className="text-white">الهاتف:</strong> {activeOrder.customerPhone}</p>
              <p><strong className="text-white">المحافظة:</strong> {activeOrder.governorate}</p>
              <p><strong className="text-white">العنوان:</strong> {activeOrder.addressDetails}</p>
              {activeOrder.notes && <p><strong className="text-white">ملاحظات:</strong> {activeOrder.notes}</p>}
              <p><strong className="text-white">الحالة:</strong> {activeOrder.status}</p>
              <p><strong className="text-white">التاريخ:</strong> {new Date(activeOrder.createdAt).toLocaleString("ar-EG")}</p>
            </div>
            <div className="border-t border-white/5 pt-3">
              <h4 className="font-bold text-white text-sm mb-2">العناصر المطلوبة</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {activeOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <img loading="lazy" src={item.productImage} className="w-11 h-11 rounded object-cover" alt="" />
                      <span className="text-gray-300 font-semibold">{item.productName} × {item.quantity}</span>
                    </div>
                    <span style={{ color: GOLD }}>{item.unitPrice * item.quantity} ج.م</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-white/5 pt-3 text-xs space-y-1 text-gray-400">
              <div className="flex justify-between"><span>المجموع الفرعي:</span><span>{activeOrder.totalPrice} ج.م</span></div>
              <div className="flex justify-between"><span>الشحن:</span><span>{activeOrder.shippingPrice === 0 ? "مجاني" : `${activeOrder.shippingPrice} ج.م`}</span></div>
              <div className="flex justify-between font-bold text-sm text-white mt-1"><span>الإجمالي الكلي:</span><span style={{ color: GOLD }}>{activeOrder.grandTotal} ج.م</span></div>
            </div>
            <div className="pt-4 flex justify-end border-t border-white/5">
              <button type="button" onClick={() => setActiveOrder(null)} className="px-6 py-2.5 rounded-xl font-bold text-sm bg-white/5 text-white hover:bg-white/10 transition-colors">إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
