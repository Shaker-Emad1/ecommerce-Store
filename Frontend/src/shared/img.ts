// Cloudinary delivery optimisation: auto format/quality and a sensible width.
// Non-Cloudinary URLs are returned unchanged.
export function optimizeImg(url: string | undefined | null, width = 600): string {
  if (!url) return "";
  const marker = "/image/upload/";
  if (!url.includes("res.cloudinary.com") || !url.includes(marker)) return url;
  const [head, tail] = url.split(marker);
  if (/^(f_|q_|w_|c_)/.test(tail)) return url; // already transformed
  return `${head}${marker}f_auto,q_auto,c_limit,w_${width}/${tail}`;
}

export function optimizeSrcSet(url: string | undefined | null, widths = [320, 640, 960]): string | undefined {
  if (!url || !url.includes("res.cloudinary.com")) return undefined;
  return widths.map((w) => `${optimizeImg(url, w)} ${w}w`).join(", ");
}
