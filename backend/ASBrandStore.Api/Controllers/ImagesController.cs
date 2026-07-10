using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ASBrandStore.Application.Common.Interfaces;

namespace ASBrandStore.Api.Controllers;

public class ImagesController : BaseApiController
{
    private readonly ICloudinaryService _cloudinaryService;

    public ImagesController(ICloudinaryService cloudinaryService)
    {
        _cloudinaryService = cloudinaryService;
    }

    private static readonly string[] AllowedMimeTypes = { "image/jpeg", "image/png", "image/webp", "image/gif" };
    private const long MaxFileSize = 5 * 1024 * 1024; // 5 MB

    [HttpPost("upload")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<object>> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "لم يتم تحديد ملف صالح للرفع" });
        }

        if (file.Length > MaxFileSize)
        {
            return BadRequest(new { message = "حجم الملف يتجاوز الحد الأقصى المسموح به (5 ميجابايت)" });
        }

        if (!AllowedMimeTypes.Contains(file.ContentType))
        {
            return BadRequest(new { message = "نوع الملف غير مدعوم. الأنواع المسموح بها: JPEG, PNG, WebP, GIF" });
        }

        // Validate file extension
        var extension = Path.GetExtension(file.FileName)?.ToLowerInvariant();
        if (string.IsNullOrEmpty(extension) || !new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" }.Contains(extension))
        {
            return BadRequest(new { message = "امتداد الملف غير مدعوم" });
        }

        try
        {
            using (var stream = file.OpenReadStream())
            {
                var url = await _cloudinaryService.UploadImageAsync(stream, file.FileName);
                return Ok(new { url });
            }
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
