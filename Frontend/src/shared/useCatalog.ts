import { useEffect, useState } from "react";
import { productService } from "../services/productService";
import { Product, mapDtoToProduct } from "../store/types";

let cache: Product[] | null = null;
let inflight: Promise<Product[]> | null = null;

function load(): Promise<Product[]> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = productService
      .getProducts({ pageIndex: 1, pageSize: 500 })
      .then((r) => { cache = r.items.map(mapDtoToProduct); return cache; })
      .finally(() => { inflight = null; });
  }
  return inflight;
}

/** Whole catalogue, fetched once and shared (small store: fast client-side filtering and search). */
export function useCatalog(enabled = true) {
  const [products, setProducts] = useState<Product[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    if (!cache && enabled) {
      load().then((p) => alive && (setProducts(p), setLoading(false)))
        .catch((e) => alive && (setError(e?.message || "حدث خطأ أثناء تحميل المنتجات"), setLoading(false)));
    }
    return () => { alive = false; };
  }, [enabled]);
  return { products, loading: enabled ? loading : false, error };
}
