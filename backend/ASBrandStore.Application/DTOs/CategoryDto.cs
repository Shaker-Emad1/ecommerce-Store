using System.ComponentModel.DataAnnotations;

namespace ASBrandStore.Application.DTOs;

public record CategoryDto(
    int Id,
    string Name,
    string Icon,
    string ImageUrl,
    int ProductsCount
);

public record CreateCategoryDto(
    [Required(ErrorMessage = "اسم الفئة مطلوب")]
    [StringLength(100, MinimumLength = 1)]
    string Name,
    [StringLength(50)]
    string Icon,
    [Required]
    [Url]
    string ImageUrl
);

public record UpdateCategoryDto(
    [Required] int Id,
    [Required]
    [StringLength(100, MinimumLength = 1)]
    string Name,
    [StringLength(50)]
    string Icon,
    [Required]
    [Url]
    string ImageUrl
);
