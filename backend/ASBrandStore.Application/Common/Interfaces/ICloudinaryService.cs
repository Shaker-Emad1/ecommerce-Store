using System.IO;
using System.Threading.Tasks;

namespace ASBrandStore.Application.Common.Interfaces;

public interface ICloudinaryService
{
    Task<string> UploadImageAsync(Stream fileStream, string fileName);
    Task<bool> DeleteImageAsync(string publicId);

    /// <summary>
    /// Extracts the Cloudinary public_id from a secure_url.
    /// Example: https://res.cloudinary.com/demo/image/upload/v123456/asbrand_store/abc.jpg
    ///          → asbrand_store/abc
    /// Returns null if the URL is not a valid Cloudinary URL.
    /// </summary>
    string? ExtractPublicIdFromUrl(string? url);
}
