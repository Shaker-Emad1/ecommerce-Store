import { useRef, useState } from "react";
import { optimizeImg, optimizeSrcSet } from "../../shared/img";

type Props = {
  src: string;
  alt: string;
  width: number;          // requested delivery width
  widths?: number[];      // srcset widths
  sizes?: string;
  eager?: boolean;
  className?: string;     // classes for the <img>
};

// Photos keep their own proportions; only extreme shapes are boxed (and edge-filled) so nothing is cropped.
const MIN_RATIO = 0.75;
const MAX_RATIO = 1.8;

const rgb = (c: number[]) => `rgb(${c[0]},${c[1]},${c[2]})`;

/**
 * Shows the whole product photo (never cropped, so product text stays visible).
 * Any space left around it is filled with the photo's own edge colours, so no
 * grey or white bars show against the card.
 */
export function ProductImage({ src, alt, width, widths, sizes, eager, className = "" }: Props) {
  const [bg, setBg] = useState<string | null>(null);
  const [ratio, setRatio] = useState(1); // natural width / height
  const [cors, setCors] = useState<"anonymous" | undefined>("anonymous");
  const tried = useRef(false);

  const sample = (img: HTMLImageElement) => {
    try {
      const nw = img.naturalWidth, nh = img.naturalHeight;
      if (!nw || !nh) return;
      // Landscape photos would leave tall bars in a portrait card: fill the frame instead.
      setRatio(nw / nh);
      const c = document.createElement("canvas");
      c.width = 16; c.height = 16;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, 16, 16);
      const px = (x: number, y: number) => Array.from(ctx.getImageData(x, y, 1, 1).data).slice(0, 3);
      const avg = (pts: number[][]) => [0, 1, 2].map((i) => Math.round(pts.reduce((a, p) => a + p[i], 0) / pts.length));
      const stage = img.parentElement;
      const stageRatio = stage ? stage.clientWidth / (stage.clientHeight || 1) : 0.8;
      if (nw / nh < stageRatio) {
        // side bars: use the left/right edge colours at top, middle and bottom
        const at = (y: number) => avg([px(0, y), px(1, y), px(14, y), px(15, y)]);
        setBg(`linear-gradient(to bottom, ${rgb(at(1))}, ${rgb(at(8))}, ${rgb(at(14))})`);
      } else {
        const top = avg([0, 2, 4, 6, 8, 10, 12, 15].map((x) => px(x, 0)));
        const bot = avg([0, 2, 4, 6, 8, 10, 12, 15].map((x) => px(x, 15)));
        // top and bottom bars each take their own edge colour (hard split behind the photo)
        setBg(`linear-gradient(to bottom, ${rgb(top)} 0%, ${rgb(top)} 50%, ${rgb(bot)} 50%, ${rgb(bot)} 100%)`);
      }
    } catch {
      setBg(null); // canvas blocked: keep the neutral background
    }
  };

  return (
    <span className="product-image-frame" style={{ aspectRatio: String(Math.min(Math.max(ratio, MIN_RATIO), MAX_RATIO)), background: bg ?? "#161616" }}>
      <img
        key={cors ?? "plain"}
        src={optimizeImg(src, width)}
        srcSet={optimizeSrcSet(src, widths)}
        sizes={sizes}
        alt={alt}
        crossOrigin={cors}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        {...(eager ? { fetchPriority: "high" as const } : {})}
        onLoad={(e) => sample(e.currentTarget)}
        onError={() => { if (!tried.current && cors) { tried.current = true; setCors(undefined); } }}
                className={`product-image-frame__img ${className}`}
      />
    </span>
  );
}
