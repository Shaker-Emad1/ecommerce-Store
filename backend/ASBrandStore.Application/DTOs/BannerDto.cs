using System.ComponentModel.DataAnnotations;

namespace ASBrandStore.Application.DTOs;

public record BannerDto(
    int Id,
    string Title,
    string Subtitle,
    string CtaText,
    string ImageUrl,
    string? Badge,
    int OrderIndex
);

public record CreateBannerDto(
    [Required(ErrorMessage = "عنوان البنر مطلوب")]
    [StringLength(200)]
    string Title,

    [StringLength(500)]
    string Subtitle,

    [Required(ErrorMessage = "نص الزر مطلوب")]
    [StringLength(100)]
    string CtaText,

    [Required(ErrorMessage = "رابط الصورة مطلوب")]
    [Url]
    string ImageUrl,

    [StringLength(100)]
    string? Badge,

    [Range(0, 100)]
    int OrderIndex
);

public record UpdateBannerDto(
    [Required] int Id,
    [Required]
    [StringLength(200)]
    string Title,
    [StringLength(500)]
    string Subtitle,
    [Required]
    [StringLength(100)]
    string CtaText,
    [Required]
    [Url]
    string ImageUrl,
    [StringLength(100)]
    string? Badge,
    [Range(0, 100)]
    int OrderIndex
);
