const API = process.env.API_BASE_URL || "https://asbrandstore-api-production-4d64.up.railway.app/api";
export default async function handler(req, res) {
  const origin = `https://${req.headers["x-forwarded-host"] || req.headers.host}`;
  const urls = ["/", "/products", "/categories"];
  try {
    const [c, p] = await Promise.all([fetch(`${API}/categories`).then((r) => r.json()), fetch(`${API}/products?pageSize=500`).then((r) => r.json())]);
    for (const x of c) if (x.productsCount > 0) urls.push(`/category/${x.id}/${encodeURIComponent(String(x.name).trim().replace(/\s+/g, "-"))}`);
    for (const x of p.items || []) urls.push(`/product/${x.id}`);
  } catch { /* serve static urls only */ }
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.end(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${origin}${u}</loc></url>`).join("")}</urlset>`);
}
