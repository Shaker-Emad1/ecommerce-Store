import { ProductDto } from "../services/productService";

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

export const mapDtoToProduct = (dto: ProductDto): Product => ({
  id: dto.id,
  name: dto.name,
  price: Number(dto.price),
  originalPrice: Number(dto.originalPrice),
  rating: dto.rating,
  reviews: dto.reviewsCount,
  image: dto.image,
  category: dto.categoryName,
  categoryId: dto.categoryId,
  badge: dto.badge || undefined,
  colors: dto.colors || [],
  description: dto.description,
  specs: dto.specs.map(s => ({ label: s.label, value: s.value })),
  stock: dto.stock,
});
