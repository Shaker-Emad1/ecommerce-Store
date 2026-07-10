import { Instagram, Facebook, Twitter, Phone, MessageCircle, Mail, MapPin } from "lucide-react";
import { GOLD, DARK_BG } from "../store/constants";
import { useNavigate } from "react-router";

export function Footer() {
  const navigate = useNavigate();
  const go = (p: string) => { navigate(p); window.scrollTo(0, 0); };

  return (
    <footer style={{ background: DARK_BG, borderTop: `1px solid rgba(212,175,55,0.08)` }}>
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center mb-4">
            <img
              src="/logo.png"
              alt="A.S Brand Store"
              style={{ height: 52, width: "auto", objectFit: "contain" }}
              loading="lazy"
            />
          </div>
          <p className="text-sm text-gray-500 leading-relaxed mb-5">نقدم أفضل الإكسسوارات التقنية والإلكترونية بجودة عالية وأسعار منافسة في مصر.</p>
          <div className="flex gap-2.5">
            {[Instagram, Facebook, Twitter].map((Icon, i) => (
              <button key={i} className="w-11 h-11 rounded-xl flex items-center justify-center transition-opacity hover:opacity-70" style={{ background: "rgba(212,175,55,0.1)", border: `1px solid rgba(212,175,55,0.15)` }}>
                <Icon size={17} style={{ color: GOLD }} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-bold text-white mb-4 text-sm">روابط سريعة</h3>
          <div className="flex flex-col gap-2.5">
            {[{ l: "الرئيسية", p: "/" }, { l: "الفئات", p: "/categories" }, { l: "المنتجات", p: "/products" }, { l: "سلة التسوق", p: "/cart" }].map((item) => (
              <button key={item.p} onClick={() => go(item.p)} className="text-sm text-gray-500 hover:text-white transition-colors text-right">{item.l}</button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-bold text-white mb-4 text-sm">الفئات</h3>
          <div className="flex flex-col gap-2.5">
            {["سماعات", "شواحن", "كابلات", "بطاريات محمولة", "حافظات الهاتف"].map((c) => (
              <button key={c} onClick={() => go("/products")} className="text-sm text-gray-500 hover:text-white transition-colors text-right">{c}</button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-bold text-white mb-4 text-sm">تواصل معنا</h3>
          <div className="flex flex-col gap-3">
            {[
              { Icon: Phone, text: "01275414542", ltr: true },
              { Icon: MessageCircle, text: "واتساب: 01275414542", ltr: false },
              { Icon: Mail, text: "info@asbrand.com", ltr: true },
              { Icon: MapPin, text: "القاهرة، مصر", ltr: false },
            ].map(({ Icon, text, ltr }) => (
              <div key={text} className="flex items-center gap-3">
                <Icon size={15} style={{ color: GOLD, flexShrink: 0 }} />
                <span className="text-sm text-gray-500" dir={ltr ? "ltr" : "rtl"}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t py-5" style={{ borderColor: "rgba(212,175,55,0.06)" }}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-600">Designed &amp; Developed by Eng. Shaker Emad &copy; 2026</p>
          <div className="flex gap-5">
            <span className="text-xs text-gray-600 cursor-pointer hover:text-gray-400">سياسة الخصوصية</span>
            <span className="text-xs text-gray-600 cursor-pointer hover:text-gray-400">الشروط والأحكام</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
