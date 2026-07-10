namespace ASBrandStore.Domain.Entities;

public class ProductColor
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string ColorCode { get; set; } = string.Empty; // Hex color code (e.g. #D4AF37)
}
