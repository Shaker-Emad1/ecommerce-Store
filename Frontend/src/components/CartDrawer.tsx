import { useEffect } from "react";
import { useNavigate } from "react-router";
import { X, Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useCart } from "../store/cartContext";
import { GOLD, CARD } from "../store/constants";
import { optimizeImg } from "../shared/img";
import { GoldBtn } from "./shared/GoldBtn";
import { FreeShippingBar } from "./shared/FreeShippingBar";

export function CartDrawer({ threshold }: { threshold: number }) {
  const { cart, setCart, drawerOpen, setDrawerOpen } = useCart();
  const navigate = useNavigate();
  const total = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const close = () => setDrawerOpen(false);
  const go = (p: string) => { close(); navigate(p); window.scrollTo(0, 0); };

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [drawerOpen]);

  const upd = (id: number, d: number) => setCart((p) => p.map((i) => i.product.id === id ? { ...i, quantity: Math.max(1, i.quantity + d) } : i));
  const rm = (id: number) => setCart((p) => p.filter((i) => i.product.id !== id));

  return (
    <div className={`fixed inset-0 z-[60] ${drawerOpen ? "" : "pointer-events-none"}`} aria-hidden={!drawerOpen}>
      <div onClick={close} className="absolute inset-0 transition-opacity duration-300" style={{ background: "rgba(0,0,0,0.6)", opacity: drawerOpen ? 1 : 0 }} />
      <aside
        role="dialog" aria-modal="true" aria-label="سلة التسوق"
        className="absolute top-0 bottom-0 left-0 flex w-[88%] max-w-sm flex-col transition-transform duration-300 ease-out"
        style={{ background: "#121212", borderRight: "1px solid rgba(212,175,55,0.2)", transform: drawerOpen ? "translateX(0)" : "translateX(-105%)" }}
      >
        <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
          <h2 className="font-black text-white text-lg">سلة التسوق</h2>
          <button onClick={close} aria-label="إغلاق" className="flex h-11 w-11 items-center justify-center rounded-xl text-white"><X size={20} /></button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-gray-500">
            <ShoppingCart size={56} className="opacity-20" />
            <p>السلة فارغة</p>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              <FreeShippingBar total={total} threshold={threshold} />
              {cart.map((item) => (
                <div key={item.product.id} className="flex gap-3 rounded-xl p-3" style={{ background: CARD, border: "1px solid rgba(212,175,55,0.08)" }}>
                  <img src={optimizeImg(item.product.image, 160)} alt={item.product.name} className="h-16 w-16 shrink-0 rounded-lg object-contain" style={{ background: "#0d0d0d" }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-sm font-bold leading-snug text-white">{item.product.name}</p>
                      <button onClick={() => rm(item.product.id)} aria-label="حذف" className="flex h-8 w-8 shrink-0 items-center justify-center text-gray-500 hover:text-red-400"><Trash2 size={15} /></button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center overflow-hidden rounded-lg" style={{ border: "1px solid rgba(212,175,55,0.2)", background: "#111" }}>
                        <button onClick={() => upd(item.product.id, -1)} aria-label="تقليل" className="flex h-9 w-9 items-center justify-center text-white"><Minus size={13} /></button>
                        <span className="w-7 text-center text-sm font-bold text-white">{item.quantity}</span>
                        <button onClick={() => upd(item.product.id, 1)} aria-label="زيادة" className="flex h-9 w-9 items-center justify-center text-white"><Plus size={13} /></button>
                      </div>
                      <span className="text-sm font-black" style={{ color: GOLD }}>{item.product.price * item.quantity} ج.م</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3 px-4 py-4" style={{ borderTop: "1px solid rgba(212,175,55,0.1)", paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
              <div className="flex justify-between font-bold"><span className="text-white">المجموع</span><span className="text-lg" style={{ color: GOLD }}>{total} ج.م</span></div>
              <GoldBtn size="lg" className="w-full" onClick={() => go("/checkout")}>إتمام الطلب</GoldBtn>
              <button onClick={() => go("/cart")} className="w-full py-2 text-sm font-semibold" style={{ color: GOLD }}>عرض السلة</button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
