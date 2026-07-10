import api from "./api";

export interface SettingDto {
  id: number;
  storeName: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  shippingThreshold: number;
  whatsappUrl: string;
  instagramUrl: string;
}

export interface UpdateSettingDto {
  storeName: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  shippingThreshold: number;
  whatsappUrl: string;
  instagramUrl: string;
}

export const settingService = {
  getSettings: async (): Promise<SettingDto> => {
    const response = await api.get<SettingDto>("/settings");
    return response.data;
  },

  updateSettings: async (dto: UpdateSettingDto): Promise<SettingDto> => {
    const response = await api.put<SettingDto>("/settings", dto);
    return response.data;
  },
};
