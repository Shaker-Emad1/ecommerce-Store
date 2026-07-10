import { useState } from "react";
import { Heart } from "lucide-react";
import { StarRating } from "./StarRating";
import { GOLD, LIGHT_GOLD, CARD, BG } from "../../store/constants";
import { Product } from "../../store/types";

export function ProductCard({ p, onAdd, onView }: { p: Product; onAdd: (p: Product) => void; onView: (p: Product) => void }) {
  const [wished, setWished] = useState(false);
  const discount = p.originalPrice > 0 ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;

  return (
    <div
      className="rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col"
      style={{ background: CARD, border: `1px solid rgba(212,175,55,0.1)`, boxShadow: "0 4px 24px rgba(0,0,0,0.35)" }}
    >
      <div className="relative overflow-hidden cursor-pointer" style={{ height: 220, background: "#111" }} onClick={() => onView(p)}>
        <img loading="lazy" src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }} />
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {p.badge && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: GOLD, color: BG }}>{p.badge}</span>
          )}
          {discount > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: "rgba(220,38,38,0.9)", color: "#fff" }}>-{discount}%</span>
          )}
        </div>
        <button
          className="absolute top-3 left-3 w-10 h-10 rounded-xl flex items-center justify-center transition-all"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
          onClick={(e) => { e.stopPropagation(); setWished(!wished); }}
        >
          <Heart size={15} fill={wished ? "#ef4444" : "transparent"} stroke={wished ? "#ef4444" : "#fff"} />
        </button>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-gray-500 mb-1">{p.category}</p>
        <h3 className="font-bold text-white text-sm leading-snug mb-2 cursor-pointer hover:text-yellow-400 transition-colors line-clamp-2" onClick={() => onView(p)}>{p.name}</h3>
        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={p.rating} />
          <span className="text-xs text-gray-500">({p.reviews})</span>
        </div>
        <div className="flex items-center gap-2 mb-4 mt-auto">
          <span className="font-black text-lg" style={{ color: GOLD }}>{p.price} ج.م</span>
          {p.originalPrice > p.price && (
            <span className="text-sm text-gray-500 line-through">{p.originalPrice} ج.م</span>
          )}
        </div>
        <button
          onClick={() => onAdd(p)}
          disabled={p.stock <= 0}
          className="w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-50"
          style={{ background: `linear-gradient(135deg, ${GOLD}, ${LIGHT_GOLD})`, color: BG }}
        >
          {p.stock > 0 ? "أضف إلى السلة" : "نفذت الكمية"}
        </button>
      </div>
    </div>
  );
}
