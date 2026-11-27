import { useEffect } from "react";

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute("content", content);
}

/** Per-page title, description, canonical, Open Graph and optional JSON-LD. */
export function usePageMeta(opts: { title: string; description: string; image?: string; jsonLd?: object | null }) {
  const { title, description, image, jsonLd } = opts;
  const ld = jsonLd ? JSON.stringify(jsonLd) : "";
  useEffect(() => {
    const full = `${title} | A.S Brand Store`;
    document.title = full;
    setMeta("name", "description", description);
    setMeta("property", "og:title", full);
    setMeta("property", "og:description", description);
    if (image) setMeta("property", "og:image", image);
    const url = window.location.origin + window.location.pathname;
    setMeta("property", "og:url", url);
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); }
    link.href = url;
    let s = document.head.querySelector<HTMLScriptElement>('script[data-asb-jsonld]');
    if (ld) {
      if (!s) { s = document.createElement("script"); s.type = "application/ld+json"; s.setAttribute("data-asb-jsonld", ""); document.head.appendChild(s); }
      s.textContent = ld;
    } else if (s) s.remove();
    return () => { document.head.querySelector("script[data-asb-jsonld]")?.remove(); };
  }, [title, description, image, ld]);
}
