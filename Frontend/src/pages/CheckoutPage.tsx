import { optimizeImg, optimizeSrcSet } from "../shared/img";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { GOLD, CARD, LIGHT_GOLD, BG } from "../store/constants";
import { useCart } from "../store/cartContext";
import { orderService, CreateOrderItemRequest } from "../services/orderService";
import { GOVERNORATES } from "../store/types";
import { usePageTitle } from "../shared/usePageTitle";

import { useOutletContext } from "react-router";
import { SettingDto } from "../services/settingService";

export function CheckoutPage() {
  usePageTitle("Checkout");
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const SAVED = "asb_checkout";
  const [f, setF] = useState(() => {
    try { return { name: "", phone: "", gov: "", address: "", ...JSON.parse(localStorage.getItem(SAVED) || "{}"), notes: "" }; }
    catch { return { name: "", phone: "", gov: "", address: "", notes: "" }; }
  });
  const [remember, setRemember] = useState(() => localStorage.getItem(SAVED) !== null || localStorage.getItem(SAVED + "_off") === null);
  const [showNotes, setShowNotes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { storeSettings } = useOutletContext<{ storeSettings: SettingDto | null }>();
  const threshold = storeSettings?.shippingThreshold ?? 3000;
  const total = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const shipping = total > threshold ? 0 : 50;
  const inputCls = "w-full rounded-xl px-4 py-3 text-white text-sm outline-none placeholder-gray-600";
  const inputStyle = { background: "#191614", border: `1px solid rgba(201,162,74,0.18)` };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const itemsPayload: CreateOrderItemRequest[] = cart.map(i => ({ productId: i.product.id, quantity: i.quantity }));
      const result = await orderService.createOrder({
        customerName: f.name, customerPhone: f.phone, governorate: f.gov,
        addressDetails: f.address, notes: f.notes || null, items: itemsPayload
      });
      try {
        if (remember) localStorage.setItem(SAVED, JSON.stringify({ name: f.name, phone: f.phone, gov: f.gov, address: f.address }));
        else { localStorage.removeItem(SAVED); localStorage.setItem(SAVED + "_off", "1"); }
      } catch { /* storage unavailable */ }
      clearCart();
      navigate(`/success?order=${result.orderNumber}`);
      window.scrollTo(0, 0);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">إتمام الطلب</h1>
        <div className="h-0.5 w-14 rounded-full mt-2" style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
      </div>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="p-4 mb-6 rounded-xl text-sm text-red-500 text-center" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid rgba(201,162,74,0.1)` }}>
              <h2 className="font-bold text-white mb-5">بيانات الشحن</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">الاسم الكامل *</label>
                  <input required type="text" autoComplete="name" placeholder="محمد أحمد" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">رقم الهاتف *</label>
                  <input required type="tel" inputMode="tel" autoComplete="tel" placeholder="01xxxxxxxxx" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className={inputCls} style={{ ...inputStyle, direction: "ltr", textAlign: "right" }} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">المحافظة *</label>
                  <select required autoComplete="address-level1" value={f.gov} onChange={(e) => setF({ ...f, gov: e.target.value })} className={inputCls} style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="">اختر المحافظة</option>
                    {GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">العنوان التفصيلي *</label>
                  <input required type="text" autoComplete="street-address" placeholder="الشارع، الحي، رقم المبنى" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} className={inputCls} style={inputStyle} />
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-[#C9A24A]" />
                    احفظ بياناتي للمرة الجاية على الجهاز ده
                  </label>
                  {showNotes ? (
                    <div>
                      <label className="text-xs text-gray-500 block mb-1.5">ملاحظات (اختياري)</label>
                      <textarea placeholder="أي تعليمات خاصة للتوصيل..." value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} rows={2} className={inputCls} style={{ ...inputStyle, resize: "none" }} />
                    </div>
                  ) : (
                    <button type="button" onClick={() => setShowNotes(true)} className="text-xs font-semibold" style={{ color: GOLD }}>+ إضافة ملاحظة للتوصيل</button>
                  )}
                </div>
              </div>
            </div>
            <div className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid rgba(201,162,74,0.1)` }}>
              <h2 className="font-bold text-white mb-4">طريقة الدفع</h2>
              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "rgba(201,162,74,0.07)", border: `1px solid rgba(201,162,74,0.18)` }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ border: `2px solid ${GOLD}` }}>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: GOLD }} />
                </div>
                <span className="text-white text-sm font-medium">الدفع عند الاستلام (كاش)</span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl p-6 h-fit" style={{ background: CARD, border: `1px solid rgba(201,162,74,0.1)` }}>
            <h2 className="font-bold text-white mb-5">ملخص الطلب</h2>
            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div key={item.product.id} className="flex gap-3">
                  <div className="product-image-stage w-11 h-11 rounded-xl overflow-hidden shrink-0">
                    <img loading="lazy" src={optimizeImg(item.product.image,200)} alt={item.product.name} className="product-image-stage__img" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white font-semibold truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-600">× {item.quantity}</p>
                  </div>
                  <span className="text-xs font-black" style={{ color: GOLD }}>{item.product.price * item.quantity} ج.م</span>
                </div>
              ))}
            </div>
            <div className="py-3 space-y-2" style={{ borderTop: `1px solid rgba(201,162,74,0.08)` }}>
              <div className="flex justify-between text-sm"><span className="text-gray-500">المجموع</span><span className="text-white">{total} ج.م</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">الشحن</span><span style={{ color: shipping === 0 ? "#22c55e" : "white" }}>{shipping === 0 ? "مجاني" : `${shipping} ج.م`}</span></div>
            </div>
            <div className="flex justify-between font-bold py-4 mb-5" style={{ borderTop: `1px solid rgba(201,162,74,0.08)` }}>
              <span className="text-white">الإجمالي</span>
              <span className="text-xl" style={{ color: GOLD }}>{total + shipping} ج.م</span>
            </div>
            <button disabled={submitting || cart.length === 0} type="submit"
              className="w-full py-4 rounded-xl font-black text-base active:scale-95 transition-all disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${GOLD}, ${LIGHT_GOLD})`, color: BG }}>
              {submitting ? "جاري إرسال الطلب..." : "تأكيد الطلب"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

