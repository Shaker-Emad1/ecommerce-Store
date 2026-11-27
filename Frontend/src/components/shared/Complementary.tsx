import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { productService } from "../../services/productService";
import { Product, mapDtoToProduct } from "../../store/types";
import { useCart } from "../../store/cartContext";
import { ProductCard } from "./ProductCard";
import { SectionTitle } from "./SectionTitle";

// Pairs by existing category id: charger <-> cable, headphones/watch -> cable/charger, case -> accessories...
const PAIRS: Record<number, number[]> = {
  1: [3, 2], 2: [3, 6], 3: [2, 6], 5: [6, 1], 6: [1, 2, 3], 10: [5, 6, 2], 11: [2, 6], 12: [3, 6],
};

export function Complementary({ inCart, title = "يكمل مشترياتك", sub = "منتجات بتتشترى مع بعض" }: { inCart: Product[]; title?: string; sub?: string }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [items, setItems] = useState<Product[]>([]);
  const ids = useMemo(() => inCart.map((p) => p.id), [inCart]);
  const cats = useMemo(() => {
    const own = new Set(inCart.map((p) => p.categoryId));
    const out: number[] = [];
    inCart.forEach((p) => (PAIRS[p.categoryId] || []).forEach((c) => { if (!own.has(c) && !out.includes(c)) out.push(c); }));
    return out.slice(0, 3);
  }, [inCart]);
  const key = cats.join(",") + "|" + ids.join(",");

  useEffect(() => {
    let alive = true;
    if (!cats.length) { setItems([]); return; }
    Promise.all(cats.map((c) => productService.getProducts({ categoryId: c, pageSize: 4 }).then((r) => r.items.map(mapDtoToProduct)).catch(() => [] as Product[])))
      .then((lists) => {
        if (!alive) return;
        // interleave categories so each pairing shows up
        const mixed: Product[] = [];
        for (let i = 0; i < 4; i++) lists.forEach((l) => l[i] && mixed.push(l[i]));
        setItems(mixed.filter((p) => p.stock > 0 && !ids.includes(p.id)).slice(0, 4));
      });
    return () => { alive = false; };
  }, [key]);

  if (!items.length) return null;
  return (
    <section className="mt-12">
      <SectionTitle title={title} sub={sub} />
      <div className="stagger grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-4 items-start">
        {items.map((p) => <ProductCard key={p.id} p={p} onAdd={addToCart} onView={(x) => { navigate(`/product/${x.id}`); window.scrollTo(0, 0); }} />)}
      </div>
    </section>
  );
}
