import { useNavigate } from "react-router";
import { Heart } from "lucide-react";
import { useCatalog } from "../shared/useCatalog";
import { useWishlist } from "../shared/useWishlist";
import { useCart } from "../store/cartContext";
import { ProductCard } from "../components/shared/ProductCard";
import { ProductSkeleton } from "../components/shared/Skeleton";
import { GoldBtn } from "../components/shared/GoldBtn";
import { GOLD } from "../store/constants";
import { usePageMeta } from "../shared/usePageMeta";

export function WishlistPage() {
  usePageMeta({ title: "المفضلة", description: "المنتجات اللي حفظتها في المفضلة." });
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const ids = useWishlist();
  const { products, loading } = useCatalog();
  const list = products.filter((p) => ids.includes(Number(p.id)));
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">المفضلة</h1>
        <div className="h-0.5 w-14 rounded-full mt-2" style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
      </div>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 items-start">{[1, 2, 3, 4].map((i) => <ProductSkeleton key={i} />)}</div>
      ) : list.length === 0 ? (
        <div className="py-16 text-center">
          <Heart size={64} className="mx-auto mb-4 opacity-20 text-gray-400" />
          <p className="text-gray-400 mb-6">لسه ما حفظتش أي منتج. اضغط على القلب في أي منتج لحفظه.</p>
          <GoldBtn onClick={() => navigate("/products")} size="lg">تصفح المنتجات</GoldBtn>
        </div>
      ) : (
        <div className="stagger grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 items-start">
          {list.map((p) => <ProductCard key={p.id} p={p} onAdd={addToCart} onView={(x) => navigate(`/product/${x.id}`)} />)}
        </div>
      )}
    </div>
  );
}
