// ─────────────────────────────────────────────
// DOMAIN TYPES — shared by store & administrator
// ─────────────────────────────────────────────
export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  categoryId: number;
  badge?: string;
  colors?: string[];
  description: string;
  specs: { label: string; value: string }[];
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export const GOVERNORATES = [
  "القاهرة", "الإسكندرية", "الجيزة", "الشرقية", "القليوبية",
  "المنوفية", "البحيرة", "الغربية", "الدقهلية", "دمياط",
  "الإسماعيلية", "السويس", "بورسعيد", "بني سويف", "الفيوم",
  "المنيا", "أسيوط", "سوهاج", "قنا", "الأقصر", "أسوان",
];
