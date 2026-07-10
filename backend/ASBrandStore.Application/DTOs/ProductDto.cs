using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ASBrandStore.Application.DTOs;

public record ProductSpecDto(
    [Required] string Label,
    [Required] string Value
);

public record ProductDto(
    int Id,
    string Name,
    decimal Price,
    decimal OriginalPrice,
    double Rating,
    int ReviewsCount,
    string Image,
    int CategoryId,
    string CategoryName,
    string? Badge,
    string Description,
    int Stock,
    bool IsFeatured,
    bool IsBestSeller,
    List<string> Colors,
    List<string> Images,
    List<ProductSpecDto> Specs
);

public record CreateProductDto(
    [Required(ErrorMessage = "اسم المنتج مطلوب")]
    [StringLength(200, MinimumLength = 2)]
    string Name,

    [Required]
    [Range(0.01, 100000, ErrorMessage = "السعر يجب أن يكون بين 0.01 و 100000")]
    decimal Price,

    [Range(0, 100000)]
    decimal OriginalPrice,

    [Required(ErrorMessage = "رابط الصورة مطلوب")]
    [Url(ErrorMessage = "رابط الصورة غير صالح")]
    string Image,

    [Required]
    int CategoryId,

    [StringLength(100)]
    string? Badge,

    [Required(ErrorMessage = "الوصف مطلوب")]
    [StringLength(2000)]
    string Description,

    [Range(0, 100000, ErrorMessage = "المخزون يجب أن يكون بين 0 و 100000")]
    int Stock,

    bool IsFeatured,
    bool IsBestSeller,
    List<string> Colors,
    List<string> Images,
    List<ProductSpecDto> Specs
);

public record UpdateProductDto(
    [Required] int Id,
    [Required(ErrorMessage = "اسم المنتج مطلوب")]
    [StringLength(200, MinimumLength = 2)]
    string Name,
    [Required]
    [Range(0.01, 100000)]
    decimal Price,
    [Range(0, 100000)]
    decimal OriginalPrice,
    [Required]
    [Url]
    string Image,
    [Required]
    int CategoryId,
    [StringLength(100)]
    string? Badge,
    [Required]
    [StringLength(2000)]
    string Description,
    [Range(0, 100000)]
    int Stock,
    bool IsFeatured,
    bool IsBestSeller,
    List<string> Colors,
    List<string> Images,
    List<ProductSpecDto> Specs
);
