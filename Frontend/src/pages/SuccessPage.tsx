import { useEffect, useState } from "react";
import { Check, MessageCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { GOLD, CARD } from "../store/constants";
import { GoldBtn } from "../components/shared/GoldBtn";
import { settingService } from "../services/settingService";
import { usePageTitle } from "../shared/usePageTitle";

export function SuccessPage() {
  usePageTitle("تم الطلب بنجاح");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderNum = searchParams.get("order") || "";
  const [whatsappUrl, setWhatsappUrl] = useState<string>("");

  useEffect(() => {
    settingService
      .getSettings()
      .then((s) => setWhatsappUrl(s.whatsappUrl || ""))
      .catch(() => setWhatsappUrl(""));
  }, []);

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8" style={{ background: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.25)" }}>
        <Check size={42} color="#22c55e" />
      </div>
      <h1 className="text-4xl font-black text-white mb-3">تم استلام طلبك! 🎉</h1>
      <p className="text-gray-400 mb-8 text-base">شكراً لثقتك بـ A.S Brand Store</p>
      <div className="rounded-2xl p-6 mb-8 text-right" style={{ background: CARD, border: `1px solid rgba(212,175,55,0.15)` }}>
        {[
          { l: "رقم الطلب", v: `#${orderNum}`, gold: true },
          { l: "حالة الطلب", v: "قيد المعالجة", green: true },
          { l: "التوصيل المتوقع", v: "خلال 24-48 ساعة" },
          { l: "طريقة الدفع", v: "الدفع عند الاستلام" },
        ].map(({ l, v, gold, green }: any, i) => (
          <div key={l} className="flex justify-between items-center py-3" style={{ borderBottom: i < 3 ? `1px solid rgba(255,255,255,0.04)` : "none" }}>
            <span className="text-gray-500 text-sm">{l}</span>
            <span className="font-bold text-sm" style={{ color: gold ? GOLD : green ? "#22c55e" : "white" }}>{v}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {whatsappUrl && (
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90" style={{ background: "#25D366" }}>
            <MessageCircle size={18} /> تواصل عبر واتساب
          </a>
        )}
        <GoldBtn onClick={() => { navigate("/"); window.scrollTo(0, 0); }} size="md">العودة للرئيسية</GoldBtn>
      </div>
    </div>
  );
}
