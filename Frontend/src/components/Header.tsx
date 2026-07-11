import { useState } from "react";
import { ShoppingCart, Search, Menu, X } from "lucide-react";
import { GOLD, BG } from "../store/constants";
import { useCart } from "../store/cartContext";
import { useNavigate } from "react-router";
import { SettingDto } from "../services/settingService";

export function Header({ searchQuery, setSearchQuery, storeSettings }: { searchQuery: string; setSearchQuery: (q: string) => void; storeSettings?: SettingDto | null }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { cartCount } = useCart();

  const threshold = storeSettings?.shippingThreshold ?? 900;
  const phone = storeSettings?.contactPhone ?? "01275414542";

  const nav = [
    { label: "الرئيسية", p: "/" },
    { label: "الفئات", p: "/categories" },
    { label: "المنتجات", p: "/products" },
  ];

  const go = (p: string) => { navigate(p); setOpen(false); window.scrollTo(0, 0); };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      navigate("/products");
    }
  };

  return (
    <header className="sticky top-0 z-50" style={{ background: "rgba(15,15,15,0.97)", backdropFilter: "blur(24px)", borderBottom: `1px solid rgba(212,175,55,0.12)` }}>
      {/* Announcement bar — single inline line, wraps gracefully on mobile */}
      <div
        className="text-center py-1.5 text-xs text-gray-400 border-b px-3 leading-snug"
        style={{ borderColor: "rgba(212,175,55,0.08)", background: "rgba(212,175,55,0.03)" }}
      >
        🚚 شحن مجاني للطلبات فوق {threshold} ج.م &nbsp;|&nbsp; <span style={{ color: GOLD }}>تواصل: {phone}</span>
        <span style={{ color: "rgba(212,175,55,0.45)", fontSize: "0.6rem", letterSpacing: "0.02em" }}>
          &nbsp;|&nbsp;
        </span>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <button onClick={() => go("/")} className="flex items-center shrink-0">
          <img
            src="/logo.png"
            alt="A.S Brand Store"
            style={{ height: 44, width: "auto", objectFit: "contain" }}
            loading="eager"
          />
        </button>

        <div className="flex-1 hidden md:block mx-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ابحث عن منتج، فئة، أو ماركة..."
              className="w-full rounded-xl py-2.5 pl-4 pr-10 text-white text-sm outline-none placeholder-gray-600"
              style={{ background: "#111", border: `1px solid rgba(212,175,55,0.18)` }}
            />
            <Search size={17} onClick={() => navigate("/products")} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" style={{ color: GOLD }} />
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-6">
          {nav.map((n) => (
            <button key={n.p} onClick={() => go(n.p)} className="text-sm font-semibold transition-colors" style={{ color: location.pathname === n.p ? GOLD : "#aaa" }}>
              {n.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 mr-auto">
          <button onClick={() => go("/cart")} className="relative p-2 rounded-xl" style={{ background: "rgba(212,175,55,0.08)" }}>
            <ShoppingCart size={20} style={{ color: GOLD }} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-black" style={{ background: GOLD, color: BG }}>{cartCount}</span>
            )}
          </button>
          
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-white">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden px-4 pb-4 border-t" style={{ borderColor: "rgba(212,175,55,0.08)" }}>
          <div className="relative my-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ابحث..."
              className="w-full rounded-xl py-2.5 pl-4 pr-10 text-white text-sm outline-none"
              style={{ background: "#111", border: `1px solid rgba(212,175,55,0.18)` }}
            />
            <Search size={16} onClick={() => navigate("/products")} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" style={{ color: GOLD }} />
          </div>
          <div className="flex flex-col gap-1">
            {nav.map((n) => (
              <button key={n.p} onClick={() => go(n.p)} className="py-3 px-4 rounded-xl text-sm font-semibold text-right transition-all" style={{ color: location.pathname === n.p ? GOLD : "#aaa", background: location.pathname === n.p ? "rgba(212,175,55,0.08)" : "transparent" }}>{n.label}</button>
            ))}
            
          </div>
        </div>
      )}
    </header>
  );
}
