import { useRef, useState, useEffect } from "react";
import { Search } from "lucide-react";
import { ProductImage } from "./ProductImage";
import { optimizeImg } from "../../shared/img";
import { GOLD } from "../../store/constants";

/** Swipeable gallery (scroll-snap) with dots and thumbnails. Single image: plain button. */
export function ProductGallery({ images, name, active, onActive, onOpen }: { images: string[]; name: string; active: number; onActive: (i: number) => void; onOpen: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  const fromScroll = useRef(false);

  const onScroll = () => {
    const el = ref.current; if (!el || !el.clientWidth) return;
    const i = Math.round(Math.abs(el.scrollLeft) / el.clientWidth);
    if (i !== active && i >= 0 && i < images.length) { fromScroll.current = true; onActive(i); }
  };
  useEffect(() => {
    if (fromScroll.current) { fromScroll.current = false; return; }
    const el = ref.current; if (!el) return;
    (el.children[active] as HTMLElement | undefined)?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }, [active]);
  useEffect(() => { setW(ref.current?.clientWidth || 0); }, []);

  const zoom = (i: number) => (
    <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold text-white pointer-events-none"
      style={{ background: "rgba(21,18,16,0.76)", border: "1px solid rgba(201,162,74,0.18)", backdropFilter: "blur(14px)" }}>
      <Search size={13} style={{ color: GOLD }} /> تكبير الصورة
    </span>
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <div ref={ref} onScroll={onScroll} className="flex items-start overflow-x-auto rounded-2xl snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ border: "1px solid rgba(201,162,74,0.08)" }}>
          {images.map((img, i) => (
            <button key={i} type="button" onClick={() => onOpen(i)} aria-label={`عرض صورة ${name} ${i + 1} من ${images.length}`} className="relative block w-full shrink-0 snap-start snap-always text-right">
              <ProductImage src={img} alt={name} width={900} widths={[480, 900, 1200]} sizes="(max-width:1024px) 100vw, 50vw" eager={i === 0} />
              {i === active && zoom(i)}
            </button>
          ))}
        </div>
        {images.length > 1 && (
          <div className="pointer-events-none absolute bottom-3 inset-x-0 flex justify-center gap-1.5" aria-hidden="true">
            {images.map((_, i) => <span key={i} className="h-2 rounded-full transition-all" style={{ width: i === active ? 18 : 8, background: i === active ? GOLD : "rgba(255,255,255,0.45)" }} />)}
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button key={i} type="button" onClick={() => onActive(i)} aria-label={`الصورة ${i + 1}`} className="product-image-stage overflow-hidden rounded-xl" style={{ height: 64, border: `2px solid ${i === active ? GOLD : "rgba(201,162,74,0.1)"}` }}>
              <img loading="lazy" src={optimizeImg(img, 160)} alt="" className="product-image-stage__img" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
