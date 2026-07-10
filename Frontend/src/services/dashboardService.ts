import api from "./api";
import { OrderDto } from "./orderService";

export interface DailySaleDto {
  dayName: string;
  totalAmount: number;
}

export interface CategoryStatDto {
  categoryName: string;
  percentage: number;
}

export interface DashboardStatsDto {
  totalSales: number;
  todayOrdersCount: number;
  activeCustomersCount: number;
  totalProductsCount: number;
  salesHistory: DailySaleDto[];
  topCategories: CategoryStatDto[];
  latestOrders: OrderDto[];
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStatsDto> => {
    const response = await api.get<DashboardStatsDto>("/dashboard/stats");
    return response.data;
  },
};
