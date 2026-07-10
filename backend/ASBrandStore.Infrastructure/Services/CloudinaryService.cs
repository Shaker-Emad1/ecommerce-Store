using System;
using System.IO;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using ASBrandStore.Application.Common.Interfaces;

namespace ASBrandStore.Infrastructure.Services;

public class CloudinaryService : ICloudinaryService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(IConfiguration config)
    {
        // Priority 1: direct environment variables (CLOUDINARY_CLOUD_NAME, etc.)
        var cloudName = Environment.GetEnvironmentVariable("CLOUDINARY_CLOUD_NAME")
                        ?? config["CloudinarySettings:CloudName"];
        var apiKey    = Environment.GetEnvironmentVariable("CLOUDINARY_API_KEY")
                        ?? config["CloudinarySettings:ApiKey"];
        var apiSecret = Environment.GetEnvironmentVariable("CLOUDINARY_API_SECRET")
                        ?? config["CloudinarySettings:ApiSecret"];

        if (string.IsNullOrWhiteSpace(cloudName) ||
            string.IsNullOrWhiteSpace(apiKey)    ||
            string.IsNullOrWhiteSpace(apiSecret))
        {
            throw new InvalidOperationException(
                "Cloudinary credentials are not configured. " +
                "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET " +
                "environment variables (or the CloudinarySettings section in appsettings.json).");
        }

        var account = new Account(cloudName, apiKey, apiSecret);
        _cloudinary = new Cloudinary(account);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Upload
    // ────────────────────────────────────────────────────────────────────────

    public async Task<string> UploadImageAsync(Stream fileStream, string fileName)
    {
        var uploadParams = new ImageUploadParams
        {
            File   = new FileDescription(fileName, fileStream),
            Folder = "asbrand_store"
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams);

        if (uploadResult.Error != null)
        {
            throw new Exception(
                $"خطأ في رفع الصورة إلى Cloudinary: {uploadResult.Error.Message}");
        }

        return uploadResult.SecureUrl.ToString();
    }

    // ────────────────────────────────────────────────────────────────────────
    // Delete
    // ────────────────────────────────────────────────────────────────────────

    public async Task<bool> DeleteImageAsync(string publicId)
    {
        if (string.IsNullOrWhiteSpace(publicId))
            return false;

        var deleteParams = new DeletionParams(publicId);
        var result       = await _cloudinary.DestroyAsync(deleteParams);
        return result.Result == "ok";
    }

    // ────────────────────────────────────────────────────────────────────────
    // Public-id extraction
    // ────────────────────────────────────────────────────────────────────────

    /// <summary>
    /// Extracts the Cloudinary public_id from a secure_url.
    ///
    /// Pattern:  https://res.cloudinary.com/{cloud}/image/upload/{version?}/{public_id}.{ext}
    ///
    /// Examples:
    ///   Input:  https://res.cloudinary.com/demo/image/upload/v1750000000/asbrand_store/headphone.jpg
    ///   Output: asbrand_store/headphone
    ///
    ///   Input:  https://res.cloudinary.com/demo/image/upload/asbrand_store/banner.png
    ///   Output: asbrand_store/banner
    /// </summary>
    public string? ExtractPublicIdFromUrl(string? url)
    {
        if (string.IsNullOrWhiteSpace(url))
            return null;

        // Must be a Cloudinary URL
        if (!url.Contains("res.cloudinary.com", StringComparison.OrdinalIgnoreCase))
            return null;

        // Match everything after "/upload/" (with or without version segment vNNNNNN)
        var match = Regex.Match(
            url,
            @"/upload/(?:v\d+/)?(.+?)(?:\.[^./]+)?$",
            RegexOptions.IgnoreCase);

        if (!match.Success)
            return null;

        return match.Groups[1].Value; // e.g. "asbrand_store/headphone"
    }
}
