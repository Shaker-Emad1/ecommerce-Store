import { Star } from "lucide-react";
import { GOLD } from "../../store/constants";

export function StarRating({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5" style={{ direction: "ltr" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} fill={i <= Math.floor(rating) ? GOLD : "transparent"} stroke={i <= Math.floor(rating) ? GOLD : "#555"} />
      ))}
    </div>
  );
}
