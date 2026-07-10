import api from "./api";

export interface OrderItemDto {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  productImage: string;
}

export interface OrderDto {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  governorate: string;
  addressDetails: string;
  notes: string | null;
  totalPrice: number;
  shippingPrice: number;
  grandTotal: number;
  status: string;
  createdAt: string;
  items: OrderItemDto[];
}

export interface CreateOrderItemRequest {
  productId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  customerName: string;
  customerPhone: string;
  governorate: string;
  addressDetails: string;
  notes?: string | null;
  items: CreateOrderItemRequest[];
}

export const orderService = {
  createOrder: async (request: CreateOrderRequest): Promise<OrderDto> => {
    const response = await api.post<OrderDto>("/orders", request);
    return response.data;
  },

  getOrderById: async (id: number): Promise<OrderDto> => {
    const response = await api.get<OrderDto>(`/orders/${id}`);
    return response.data;
  },

  getAllOrders: async (): Promise<OrderDto[]> => {
    const response = await api.get<OrderDto[]>("/orders");
    return response.data;
  },

  updateStatus: async (id: number, status: string): Promise<OrderDto> => {
    const response = await api.put<OrderDto>(`/orders/${id}/status`, JSON.stringify(status), {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },
};
