using System.ComponentModel.DataAnnotations;

namespace ASBrandStore.Application.DTOs;

public record SettingDto(
    int Id,
    string StoreName,
    string ContactPhone,
    string ContactEmail,
    string Address,
    int ShippingThreshold,
    string WhatsappUrl,
    string InstagramUrl
);

public record UpdateSettingDto(
    [Required]
    [StringLength(200)]
    string StoreName,

    [Required]
    [Phone]
    [StringLength(20)]
    string ContactPhone,

    [Required]
    [EmailAddress]
    [StringLength(200)]
    string ContactEmail,

    [Required]
    [StringLength(500)]
    string Address,

    [Required]
    int ShippingThreshold,

    [StringLength(500)]
    string WhatsappUrl,

    [StringLength(500)]
    string InstagramUrl
);
