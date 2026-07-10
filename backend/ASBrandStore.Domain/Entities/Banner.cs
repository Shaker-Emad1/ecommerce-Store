namespace ASBrandStore.Domain.Entities;

public class Banner
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public string CtaText { get; set; } = "تسوق الآن";
    public string ImageUrl { get; set; } = string.Empty;
    public string? Badge { get; set; }
    public int OrderIndex { get; set; } = 0;
}
