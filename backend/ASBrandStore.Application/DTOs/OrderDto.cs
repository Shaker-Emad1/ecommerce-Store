using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ASBrandStore.Application.DTOs;

public record OrderItemDto(
    int ProductId,
    string ProductName,
    int Quantity,
    decimal UnitPrice,
    string ProductImage
);

public record OrderDto(
    int Id,
    string OrderNumber,
    string CustomerName,
    string CustomerPhone,
    string Governorate,
    string AddressDetails,
    string? Notes,
    decimal TotalPrice,
    decimal ShippingPrice,
    decimal GrandTotal,
    string Status,
    DateTime CreatedAt,
    List<OrderItemDto> Items
);

public record CreateOrderItemRequest(
    [Required] int ProductId,
    [Required]
    [Range(1, 1000, ErrorMessage = "الكمية يجب أن تكون بين 1 و 1000")]
    int Quantity
);

public record CreateOrderRequest(
    [Required(ErrorMessage = "الاسم مطلوب")]
    [StringLength(100, MinimumLength = 2)]
    string CustomerName,

    [Required(ErrorMessage = "رقم الهاتف مطلوب")]
    [Phone(ErrorMessage = "رقم الهاتف غير صالح")]
    [StringLength(20, MinimumLength = 5)]
    string CustomerPhone,

    [Required(ErrorMessage = "المحافظة مطلوبة")]
    [StringLength(100)]
    string Governorate,

    [Required(ErrorMessage = "العنوان مطلوب")]
    [StringLength(500, MinimumLength = 5)]
    string AddressDetails,

    [StringLength(1000)]
    string? Notes,

    [Required(ErrorMessage = "يجب إضافة منتجات على الأقل")]
    [MinLength(1, ErrorMessage = "يجب إضافة منتج واحد على الأقل")]
    List<CreateOrderItemRequest> Items
);

public record UpdateOrderStatusRequest(
    int OrderId,
    [Required(ErrorMessage = "حالة الطلب مطلوبة")]
    [StringLength(50)]
    string Status
);
