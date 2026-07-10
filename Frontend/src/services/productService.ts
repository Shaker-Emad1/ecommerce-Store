import api from "./api";

export interface ProductSpecDto {
  label: string;
  value: string;
}

export interface ProductDto {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  image: string;
  categoryId: number;
  categoryName: string;
  badge: string | null;
  description: string;
  stock: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  colors: string[];
  images: string[];
  specs: ProductSpecDto[];
}

export interface PaginatedList<T> {
  items: T[];
  pageIndex: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GetProductsParams {
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  pageIndex?: number;
  pageSize?: number;
}

export interface CreateProductDto {
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  categoryId: number;
  badge?: string | null;
  description: string;
  stock: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  colors: string[];
  images: string[];
  specs: ProductSpecDto[];
}

export interface UpdateProductDto {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  categoryId: number;
  badge?: string | null;
  description: string;
  stock: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  colors: string[];
  images: string[];
  specs: ProductSpecDto[];
}

export const productService = {
  getProducts: async (params?: GetProductsParams): Promise<PaginatedList<ProductDto>> => {
    const response = await api.get<PaginatedList<ProductDto>>("/products", { params });
    return response.data;
  },

  getById: async (id: number): Promise<ProductDto> => {
    const response = await api.get<ProductDto>(`/products/${id}`);
    return response.data;
  },

  create: async (dto: CreateProductDto): Promise<ProductDto> => {
    const response = await api.post<ProductDto>("/products", dto);
    return response.data;
  },

  update: async (id: number, dto: UpdateProductDto): Promise<ProductDto> => {
    const response = await api.put<ProductDto>(`/products/${id}`, dto);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};
