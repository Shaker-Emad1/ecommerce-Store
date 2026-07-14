import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { GOLD } from "../../store/constants";
import { GoldBtn } from "./GoldBtn";
import { BannerDto } from "../../services/bannerService";

export function HeroSlider({ banners, setPage }: { banners: BannerDto[]; setPage?: (p: string) => void }) {
  const [cur, setCur] = useState(0);
  useEffect(() => {
    if (banners.length === 0) return;
    const t = setInterval(() => setCur((c) => (c + 1) % banners.length), 4500);
    return () => clearInterval(t);
  }, [banners]);

  if (banners.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl animate-pulse" style={{ height: "clamp(320px, 50vw, 500px)", background: "#111" }} />
    );
  }

  const s = banners[cur];

  return (
    <div className="relative overflow-hidden rounded-2xl" style={{ height: "clamp(260px, 50vw, 500px)", background: "#111" }}>
      {banners.map((sl, i) => (
        <div key={sl.id} className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: i === cur ? 1 : 0 }}>
          <img src={sl.imageUrl} alt={sl.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(15,15,15,0.96) 35%, rgba(15,15,15,0.2) 100%)" }} />
        </div>
      ))}

      <div className="absolute inset-0 flex items-center">
        <div className="px-4 sm:px-8 md:px-14 max-w-lg">
          {s.badge && (
            <span className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4" style={{ background: "rgba(212,175,55,0.18)", color: GOLD, border: `1px solid rgba(212,175,55,0.3)` }}>{s.badge}</span>
          )}
          <h1 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight">{s.title}</h1>
          <p className="text-gray-300 mb-5 sm:mb-8 text-base md:text-lg">{s.subtitle}</p>
          <GoldBtn className="hero-slider-cta" onClick={() => { setPage?.("products"); window.scrollTo(0, 0); }} size="lg">{s.ctaText}</GoldBtn>
        </div>
      </div>

      <div className="hero-slider-dots absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, i) => (
          <button key={i} onClick={() => setCur(i)} className="rounded-full transition-all duration-300" style={{ width: i === cur ? 28 : 12, height: 12, background: i === cur ? GOLD : "rgba(255,255,255,0.25)" }} />
        ))}
      </div>

      <button onClick={() => setCur((c) => (c - 1 + banners.length) % banners.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}>
        <ChevronRight size={18} className="text-white" />
      </button>
      <button onClick={() => setCur((c) => (c + 1) % banners.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}>
        <ChevronLeft size={18} className="text-white" />
      </button>
    </div>
  );
}
