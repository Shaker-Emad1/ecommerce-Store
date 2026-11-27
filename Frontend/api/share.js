// Share landing page: serves product-specific Open Graph tags (for WhatsApp,
// Facebook, Telegram previews) and sends real visitors on to the product page.
const API = process.env.API_BASE_URL || "https://asbrandstore-api-production-4d64.up.railway.app/api";
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export default async function handler(req, res) {
  const id = parseInt(String(req.query.id || ""), 10);
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const origin = `https://${host}`;
  if (!Number.isInteger(id) || id <= 0) { res.statusCode = 302; res.setHeader("Location", origin); return res.end(); }
  const target = `${origin}/product/${id}`;
  let p = null;
  try {
    const r = await fetch(`${API}/products/${id}`);
    if (r.ok) p = await r.json();
  } catch { /* fall through to generic preview */ }
  const title = p ? `${p.name} | A.S Brand Store` : "A.S Brand Store";
  const price = p ? `${p.price} ج.م${p.originalPrice > p.price ? ` بدل ${p.originalPrice} ج.م` : ""}` : "";
  const desc = p ? `${price}${p.description ? " - " + String(p.description).slice(0, 120) : ""}` : "تسوق أحدث الإكسسوارات والإلكترونيات";
  let img = p?.image || `${origin}/logo.png`;
  if (img.includes("res.cloudinary.com") && img.includes("/image/upload/")) img = img.replace("/image/upload/", "/image/upload/f_jpg,q_auto,c_pad,b_white,w_1200,h_630/");
  const html = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="product"><meta property="og:site_name" content="A.S Brand Store">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(img)}"><meta property="og:url" content="${esc(target)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${esc(target)}">
<meta http-equiv="refresh" content="0;url=${esc(target)}"></head>
<body><a href="${esc(target)}">${esc(title)}</a></body></html>`;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  res.statusCode = 200;
  res.end(html);
}
