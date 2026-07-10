import api from "./api";

export interface BannerDto {
  id: number;
  title: string;
  subtitle: string;
  ctaText: string;
  imageUrl: string;
  badge: string | null;
  orderIndex: number;
}

export interface CreateBannerDto {
  title: string;
  subtitle: string;
  ctaText: string;
  imageUrl: string;
  badge?: string | null;
  orderIndex: number;
}

export interface UpdateBannerDto {
  id: number;
  title: string;
  subtitle: string;
  ctaText: string;
  imageUrl: string;
  badge?: string | null;
  orderIndex: number;
}

export const bannerService = {
  getAll: async (): Promise<BannerDto[]> => {
    const response = await api.get<BannerDto[]>("/banners");
    return response.data;
  },

  getById: async (id: number): Promise<BannerDto> => {
    const response = await api.get<BannerDto>(`/banners/${id}`);
    return response.data;
  },

  create: async (dto: CreateBannerDto): Promise<BannerDto> => {
    const response = await api.post<BannerDto>("/banners", dto);
    return response.data;
  },

  update: async (id: number, dto: UpdateBannerDto): Promise<BannerDto> => {
    const response = await api.put<BannerDto>(`/banners/${id}`, dto);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/banners/${id}`);
  },
};
