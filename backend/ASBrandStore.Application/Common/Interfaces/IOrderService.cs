using System.Collections.Generic;
using System.Threading.Tasks;
using ASBrandStore.Application.DTOs;

namespace ASBrandStore.Application.Common.Interfaces;

public interface IOrderService
{
    Task<OrderDto> CreateOrderAsync(CreateOrderRequest request);
    Task<OrderDto?> GetOrderByIdAsync(int id);
    Task<List<OrderDto>> GetAllOrdersAsync();
    Task<OrderDto> UpdateOrderStatusAsync(UpdateOrderStatusRequest request);
}
