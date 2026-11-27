import { useState } from "react";
import { ShoppingCart, Menu, X, Truck } from "lucide-react";
import { GOLD, BG } from "../store/constants";
import { useCart } from "../store/cartContext";
import { useNavigate } from "react-router";
import { SearchBox } from "./shared/SearchBox";
import { getContact } from "../shared/contact";
import { SettingDto } from "../services/settingService";

export function Header({ searchQuery, setSearchQuery, storeSettings }: { searchQuery: string; setSearchQuery: (q: string) => void; storeSettings?: SettingDto | null }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { cartCount } = useCart();

  const threshold = storeSettings?.shippingThreshold ?? 3000;
  const phone = getContact(storeSettings).phone;

  const nav = [
    { label: "الرئيسية", p: "/" },
    { label: "الفئات", p: "/categories" },
    { label: "المنتجات", p: "/products" },
  ];

  const go = (p: string) => { navigate(p); setOpen(false); window.scrollTo(0, 0); };


  return (
    <header className="sticky top-0 z-50" style={{ background: "rgba(15,15,15,0.97)", backdropFilter: "blur(24px)", borderBottom: `1px solid rgba(212,175,55,0.12)` }}>
      {/* Announcement bar */}
      <div
        className="text-center py-1.5 text-xs text-gray-300 border-b px-3 leading-snug"
        style={{ borderColor: "rgba(212,175,55,0.08)", background: "rgba(212,175,55,0.03)" }}
      >
        <Truck size={13} className="inline -mt-0.5 ml-1" aria-hidden="true" /> شحن مجاني للطلبات فوق {threshold} ج.م &nbsp;|&nbsp; <span style={{ color: GOLD }}>تواصل: {phone}</span>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <button onClick={() => go("/")} className="flex items-center shrink-0">
          <img
            src="/logo.png" width={62} height={44}
            alt="A.S Brand Store"
            style={{ height: 44, width: "auto", objectFit: "contain" }}
            loading="eager"
          />
        </button>

        <div className="flex-1 hidden md:block mx-4">
          <SearchBox />
        </div>

        <nav className="hidden lg:flex items-center gap-6">
          {nav.map((n) => (
            <button key={n.p} onClick={() => go(n.p)} className="text-sm font-semibold transition-colors" style={{ color: location.pathname === n.p ? GOLD : "#aaa" }}>
              {n.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 mr-auto">
          <button onClick={() => go("/cart")} aria-label="السلة" className="relative p-2 rounded-xl" style={{ background: "rgba(212,175,55,0.08)" }}>
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
          <div className="my-3"><SearchBox placeholder="ابحث..." onDone={() => setOpen(false)} /></div>
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
