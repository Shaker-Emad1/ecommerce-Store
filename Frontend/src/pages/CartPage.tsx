import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import { usePageTitle } from "../shared/usePageTitle";

import { useNavigate } from "react-router";
import { GOLD, CARD } from "../store/constants";
import { useCart } from "../store/cartContext";
import { GoldBtn } from "../components/shared/GoldBtn";

import { useOutletContext } from "react-router";
import { SettingDto } from "../services/settingService";

export function CartPage() {
  usePageTitle("Shopping Cart");
  const navigate = useNavigate();
  const { cart, setCart } = useCart();
  const { storeSettings } = useOutletContext<{ storeSettings: SettingDto | null }>();
  const threshold = storeSettings?.shippingThreshold ?? 900;
  const total = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const shipping = total > threshold ? 0 : 50;

  const updateQty = (id: number, d: number) =>
    setCart((prev) => prev.map((i) => i.product.id === id ? { ...i, quantity: Math.max(1, i.quantity + d) } : i));
  const remove = (id: number) => setCart((prev) => prev.filter((i) => i.product.id !== id));

  if (cart.length === 0)
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingCart size={72} className="mx-auto mb-5 opacity-15 text-gray-400" />
        <h2 className="text-2xl font-black text-white mb-2">سلة التسوق فارغة</h2>
        <p className="text-gray-500 mb-8">لم تضف أي منتجات بعد</p>
        <GoldBtn onClick={() => { navigate("/products"); window.scrollTo(0, 0); }} size="lg">تصفح المنتجات</GoldBtn>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">سلة التسوق</h1>
        <div className="h-0.5 w-14 rounded-full mt-2" style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.product.id} className="rounded-2xl p-4 flex gap-4" style={{ background: CARD, border: `1px solid rgba(212,175,55,0.08)` }}>
              <div className="product-image-stage w-24 h-24 rounded-xl overflow-hidden shrink-0">
                <img loading="lazy" src={item.product.image} alt={item.product.name} className="product-image-stage__img" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-white text-sm leading-snug line-clamp-2">{item.product.name}</h3>
                  <button onClick={() => remove(item.product.id)} className="text-gray-600 hover:text-red-400 transition-colors p-0.5 shrink-0"><Trash2 size={15} /></button>
                </div>
                <p className="text-xs text-gray-500 mb-3">{item.product.category}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-xl overflow-hidden" style={{ border: `1px solid rgba(212,175,55,0.2)`, background: "#111" }}>
                    <button onClick={() => updateQty(item.product.id, -1)} className="w-10 h-10 flex items-center justify-center text-white hover:opacity-60"><Minus size={14} /></button>
                    <span className="w-8 text-center text-white text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => updateQty(item.product.id, 1)} className="w-10 h-10 flex items-center justify-center text-white hover:opacity-60"><Plus size={14} /></button>
                  </div>
                  <span className="font-black text-base" style={{ color: GOLD }}>{item.product.price * item.quantity} ج.م</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl p-6 h-fit" style={{ background: CARD, border: `1px solid rgba(212,175,55,0.1)` }}>
          <h2 className="font-bold text-white text-lg mb-5">ملخص الطلب</h2>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">المجموع الفرعي</span>
              <span className="text-white">{total} ج.م</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">الشحن</span>
              <span style={{ color: shipping === 0 ? "#22c55e" : "white" }}>{shipping === 0 ? "مجاني" : `${shipping} ج.م`}</span>
            </div>
            {total < threshold && <p className="text-xs" style={{ color: GOLD }}>أضف {threshold - total} ج.م للحصول على شحن مجاني</p>}
          </div>
          <div className="py-4 mb-5" style={{ borderTop: `1px solid rgba(212,175,55,0.08)`, borderBottom: `1px solid rgba(212,175,55,0.08)` }}>
            <div className="flex justify-between font-bold">
              <span className="text-white">الإجمالي</span>
              <span className="text-xl" style={{ color: GOLD }}>{total + shipping} ج.م</span>
            </div>
          </div>
          <GoldBtn onClick={() => { navigate("/checkout"); window.scrollTo(0, 0); }} size="lg" className="w-full">إتمام الطلب</GoldBtn>
          <button onClick={() => { navigate("/products"); window.scrollTo(0, 0); }} className="w-full mt-3 py-2.5 text-sm font-semibold" style={{ color: GOLD }}>مواصلة التسوق</button>
        </div>
      </div>
    </div>
  );
}

