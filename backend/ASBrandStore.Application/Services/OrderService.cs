using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using ASBrandStore.Application.Common.Interfaces;
using ASBrandStore.Application.DTOs;
using ASBrandStore.Domain.Entities;

namespace ASBrandStore.Application.Services;

public class OrderService : IOrderService
{
    private readonly IApplicationDbContext _context;
    private readonly IWhatsAppService _whatsAppService;
    private readonly IGoogleSheetsService _googleSheetsService;

    public OrderService(IApplicationDbContext context, IWhatsAppService whatsAppService, IGoogleSheetsService googleSheetsService)
    {
        _context = context;
        _whatsAppService = whatsAppService;
        _googleSheetsService = googleSheetsService;
    }

    public async Task<OrderDto> CreateOrderAsync(CreateOrderRequest request)
    {
        if (request.Items == null || !request.Items.Any())
        {
            throw new Exception("السلة فارغة، لا يمكن إتمام الطلب");
        }

        // Use a database transaction to ensure stock consistency
        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // Generate Order Number
            var random = new Random();
            var orderNumber = "ORD-" + random.Next(100000, 999999).ToString();

            var orderItems = new List<OrderItem>();
            decimal totalItemsPrice = 0;

            foreach (var itemReq in request.Items)
            {
                var product = await _context.Products.FindAsync(itemReq.ProductId);
                if (product == null)
                {
                    throw new Exception($"المنتج ذو الرقم {itemReq.ProductId} غير موجود");
                }

                if (product.Stock < itemReq.Quantity)
                {
                    throw new Exception($"عذراً، المخزون غير كافٍ للمنتج المطلوب");
                }

                // Deduct stock
                product.Stock -= itemReq.Quantity;

                var orderItem = new OrderItem
                {
                    ProductId = product.Id,
                    Product = product,
                    Quantity = itemReq.Quantity,
                    UnitPrice = product.Price
                };

                orderItems.Add(orderItem);
                totalItemsPrice += product.Price * itemReq.Quantity;
            }

            // Shipping logic matching frontend (Free above 500, otherwise 50)
            decimal shippingPrice = totalItemsPrice > 500 ? 0 : 50;
            decimal grandTotal = totalItemsPrice + shippingPrice;

            var order = new Order
            {
                OrderNumber = orderNumber,
                CustomerName = request.CustomerName,
                CustomerPhone = request.CustomerPhone,
                Governorate = request.Governorate,
                AddressDetails = request.AddressDetails,
                Notes = request.Notes,
                TotalPrice = totalItemsPrice,
                ShippingPrice = shippingPrice,
                GrandTotal = grandTotal,
                Status = "قيد المعالجة",
                OrderItems = orderItems
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            // Send WhatsApp Notification asynchronously (errors won't block checkout completion)
            try
            {
                await _whatsAppService.SendOrderNotificationAsync(order);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending WhatsApp notification: {ex.Message}");
            }

            // Send Google Sheets export asynchronously
            try
            {
                await _googleSheetsService.ExportOrderAsync(order);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error exporting order to Google Sheets: {ex.Message}");
            }

            return MapToDto(order);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<OrderDto?> GetOrderByIdAsync(int id)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return null;

        return MapToDto(order);
    }

    public async Task<List<OrderDto>> GetAllOrdersAsync()
    {
        var orders = await _context.Orders
            .AsNoTracking()
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return orders.Select(MapToDto).ToList();
    }

    public async Task<OrderDto> UpdateOrderStatusAsync(UpdateOrderStatusRequest request)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId);

        if (order == null) throw new Exception("الطلب غير موجود");

        order.Status = request.Status;
        await _context.SaveChangesAsync();

        // Optionally send a WhatsApp status update message
        try
        {
            string message = $"مرحباً {order.CustomerName}، تم تحديث حالة طلبك رقم {order.OrderNumber} إلى: ({order.Status})";
            await _whatsAppService.SendMessageAsync(order.CustomerPhone, message);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error sending WhatsApp status update: {ex.Message}");
        }

        return MapToDto(order);
    }

    private static OrderDto MapToDto(Order o)
    {
        return new OrderDto(
            o.Id,
            o.OrderNumber,
            o.CustomerName,
            o.CustomerPhone,
            o.Governorate,
            o.AddressDetails,
            o.Notes,
            o.TotalPrice,
            o.ShippingPrice,
            o.GrandTotal,
            o.Status,
            o.CreatedAt,
            o.OrderItems.Select(oi => new OrderItemDto(
                oi.ProductId,
                oi.Product?.Name ?? string.Empty,
                oi.Quantity,
                oi.UnitPrice,
                oi.Product?.Image ?? string.Empty
            )).ToList()
        );
    }
}
