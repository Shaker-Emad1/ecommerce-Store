import api from "./api";

export interface CategoryDto {
  id: number;
  name: string;
  icon: string;
  imageUrl: string;
  productsCount: number;
}

export interface CreateCategoryDto {
  name: string;
  icon: string;
  imageUrl: string;
}

export interface UpdateCategoryDto {
  id: number;
  name: string;
  icon: string;
  imageUrl: string;
}

export const categoryService = {
  getAll: async (): Promise<CategoryDto[]> => {
    const response = await api.get<CategoryDto[]>("/categories");
    return response.data;
  },

  getById: async (id: number): Promise<CategoryDto> => {
    const response = await api.get<CategoryDto>(`/categories/${id}`);
    return response.data;
  },

  create: async (dto: CreateCategoryDto): Promise<CategoryDto> => {
    const response = await api.post<CategoryDto>("/categories", dto);
    return response.data;
  },

  update: async (id: number, dto: UpdateCategoryDto): Promise<CategoryDto> => {
    const response = await api.put<CategoryDto>(`/categories/${id}`, dto);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
