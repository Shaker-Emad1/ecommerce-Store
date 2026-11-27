import { ProductImage } from "./ProductImage";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { StarRating } from "./StarRating";
import { GOLD, CARD, CTA_GOLD, BG } from "../../store/constants";
import { Product } from "../../store/types";

export function ProductCard({ p, onAdd, onView }: { p: Product; onAdd: (p: Product) => void; onView: (p: Product) => void }) {
  const WK = "asb_wishlist";
  const readWish = () => { try { return (JSON.parse(localStorage.getItem(WK) || "[]") as number[]).includes(Number(p.id)); } catch { return false; } };
  const [wished, setWished] = useState(readWish);
  useEffect(() => { setWished(readWish()); }, [p.id]);
  const toggleWish = () => {
    try {
      const list = JSON.parse(localStorage.getItem(WK) || "[]") as number[];
      const id = Number(p.id);
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
      localStorage.setItem(WK, JSON.stringify(next));
    } catch { /* ignore storage errors */ }
    window.dispatchEvent(new Event("asb-wishlist"));
    setWished(!wished);
  };
  const lowStock = p.stock > 0 && p.stock <= 5;
  const discount = p.originalPrice > 0 ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;

  return (
    <div
      className="product-card-mobile rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col self-start w-full"
      style={{ background: CARD, border: `1px solid rgba(201,162,74,0.1)`, boxShadow: "0 4px 24px rgba(0,0,0,0.35)" }}
    >
      <div className="product-card-mobile__image relative overflow-hidden cursor-pointer" onClick={() => onView(p)}>
        <ProductImage src={p.image} alt={p.name} width={480} widths={[240, 480, 720]} sizes="(max-width:640px) 50vw, 25vw" />
                <div className="absolute top-2 right-2 flex flex-col gap-1">
          {p.badge && (
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: GOLD, color: BG }}>{p.badge}</span>
          )}
          {discount > 0 && (
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: "rgba(220,38,38,0.92)", color: "#fff" }}>-{discount}%</span>
          )}
        </div>
        <button
          className="product-card-mobile__wishlist absolute top-3 left-3 rounded-xl flex items-center justify-center transition-all"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
          aria-label={wished ? "إزالة من المفضلة" : "إضافة للمفضلة"} aria-pressed={wished}
          onClick={(e) => { e.stopPropagation(); toggleWish(); }}
        >
          <Heart size={14} fill={wished ? "#ef4444" : "transparent"} stroke={wished ? "#ef4444" : "#fff"} />
        </button>
      </div>
      <div className="product-card-mobile__body flex flex-col flex-1">
        <p className="text-xs text-gray-400 mb-1">{p.category}</p>
        <h3 className="product-card-mobile__title font-bold text-white leading-snug mb-2 cursor-pointer hover:text-yellow-400 transition-colors line-clamp-2" onClick={() => onView(p)}>{p.name}</h3>
        <div className="product-card-mobile__rating flex items-center gap-2 mb-3" style={{ minHeight: "1.25rem" }}>
          {p.reviews > 0 ? (
            <>
              <StarRating rating={p.rating} />
              <span className="text-xs text-gray-500">({p.reviews})</span>
            </>
          ) : lowStock ? (
            <span className="text-xs font-bold" style={{ color: "#f87171" }}>باقي {p.stock} قطع فقط</span>
          ) : (
            <span className="text-xs text-gray-500">متوفر للتوصيل</span>
          )}
        </div>
        <div className="product-card-mobile__price flex items-center gap-2 mb-4 mt-auto">
          <span className="font-black text-lg text-white">{p.price} ج.م</span>
          {p.originalPrice > p.price && (
            <span className="text-sm text-gray-400 line-through">{p.originalPrice} ج.م</span>
          )}
        </div>
        <button
          onClick={() => onAdd(p)}
          disabled={p.stock <= 0}
          className="product-card-mobile__cta w-full rounded-xl text-sm font-bold transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-50"
          style={{ background: CTA_GOLD, color: "#1a1306" }}
        >
          {p.stock > 0 ? "أضف إلى السلة" : "نفذت الكمية"}
        </button>
      </div>
    </div>
  );
}

