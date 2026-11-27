import { Home, LayoutGrid, Heart, ShoppingCart } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { GOLD, BG } from "../store/constants";
import { useCart } from "../store/cartContext";
import { useWishlist } from "../shared/useWishlist";

export function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const wish = useWishlist().length;
  const items = [
    { label: "الرئيسية", p: "/", Icon: Home, n: 0 },
    { label: "الفئات", p: "/categories", Icon: LayoutGrid, n: 0 },
    { label: "المفضلة", p: "/wishlist", Icon: Heart, n: wish },
    { label: "السلة", p: "/cart", Icon: ShoppingCart, n: cartCount },
  ];
  return (
    <nav aria-label="التنقل السريع" className="fixed inset-x-0 bottom-0 z-50 flex md:hidden"
      style={{ background: "rgba(21,18,16,0.98)", borderTop: "1px solid rgba(201,162,74,0.2)", backdropFilter: "blur(12px)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      {items.map(({ label, p, Icon, n }) => {
        const active = p === "/" ? pathname === "/" : pathname.startsWith(p);
        return (
          <button key={p} onClick={() => { navigate(p); window.scrollTo(0, 0); }} className="relative flex h-14 flex-1 flex-col items-center justify-center gap-0.5" style={{ color: active ? GOLD : "#9ca3af" }} aria-current={active ? "page" : undefined}>
            <span className="relative">
              <Icon size={21} />
              {n > 0 && <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-black" style={{ background: GOLD, color: BG }}>{n}</span>}
            </span>
            <span className="text-[11px] font-semibold">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
