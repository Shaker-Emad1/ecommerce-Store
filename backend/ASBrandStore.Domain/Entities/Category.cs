using System.Collections.Generic;

namespace ASBrandStore.Domain.Entities;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty; // Lucide icon name (e.g. Headphones, Zap, Battery)
    public string ImageUrl { get; set; } = string.Empty;
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
