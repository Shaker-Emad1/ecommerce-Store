namespace ASBrandStore.Domain.Entities;

public class ProductSpecification
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string Label { get; set; } = string.Empty; // e.g. "التوصيل"
    public string Value { get; set; } = string.Empty; // e.g. "بلوتوث 5.3"
}
