using System;
using System.Collections.Generic;

namespace ASBrandStore.Domain.Entities;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal OriginalPrice { get; set; }
    public double Rating { get; set; } = 5.0;
    public int ReviewsCount { get; set; } = 0;
    public string Image { get; set; } = string.Empty; // Primary thumbnail image
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public string? Badge { get; set; } // e.g. "الأكثر مبيعاً", "جديد", "عرض"
    public string Description { get; set; } = string.Empty;
    public int Stock { get; set; } = 0;
    
    // Flags for filtering & requirements
    public bool IsFeatured { get; set; } = false;
    public bool IsBestSeller { get; set; } = false;

    // Navigation properties
    public ICollection<ProductColor> Colors { get; set; } = new List<ProductColor>();
    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    public ICollection<ProductSpecification> Specs { get; set; } = new List<ProductSpecification>();
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
