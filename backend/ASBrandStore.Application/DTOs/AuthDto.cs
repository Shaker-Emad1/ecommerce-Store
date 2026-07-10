using System.ComponentModel.DataAnnotations;

namespace ASBrandStore.Application.DTOs;

public record LoginRequest(
    [Required(ErrorMessage = "البريد الإلكتروني مطلوب")]
    [EmailAddress(ErrorMessage = "البريد الإلكتروني غير صالح")]
    string Email,
    
    [Required(ErrorMessage = "كلمة المرور مطلوبة")]
    string Password
);

public record RegisterRequest(
    [Required(ErrorMessage = "الاسم مطلوب")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "الاسم يجب أن يكون بين 2 و 100 حرف")]
    string FullName,
    
    [Required(ErrorMessage = "البريد الإلكتروني مطلوب")]
    [EmailAddress(ErrorMessage = "البريد الإلكتروني غير صالح")]
    string Email,
    
    [Required(ErrorMessage = "كلمة المرور مطلوبة")]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "كلمة المرور يجب أن تكون 8 أحرف على الأقل")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$", ErrorMessage = "كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم ورمز خاص")]
    string Password,
    
    [StringLength(20)]
    string? Phone = null,
    
    [StringLength(100)]
    string? Governorate = null,
    
    [StringLength(500)]
    string? Address = null
);

public record UserDto(
    string Id,
    string FullName,
    string Email,
    string Role,
    string? Phone,
    string? Governorate,
    string? Address
);

public record AuthResponse(string Token, UserDto User);
