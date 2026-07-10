using System;
using System.Collections.Generic;

namespace ASBrandStore.Domain.Entities;

public class Order
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty; // e.g. ORD-001 or numeric code
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string Governorate { get; set; } = string.Empty;
    public string AddressDetails { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public decimal TotalPrice { get; set; } // Items total
    public decimal ShippingPrice { get; set; } // Shipping cost
    public decimal GrandTotal { get; set; } // Total + Shipping
    public string Status { get; set; } = "قيد المعالجة"; // "قيد المعالجة", "قيد التوصيل", "مكتمل", "ملغي"
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
