namespace ASBrandStore.Domain.Entities;

public class Setting
{
    public int Id { get; set; }
    public string StoreName { get; set; } = "A.S Brand Store";
    public string ContactPhone { get; set; } = "01234567890";
    public string ContactEmail { get; set; } = "info@asbrand.com";
    public string Address { get; set; } = "القاهرة، مصر";
    public int ShippingThreshold { get; set; } = 900;
    public string WhatsappUrl { get; set; } = "https://wa.me/201234567890";
    public string InstagramUrl { get; set; } = "@asbrand_store";
}
