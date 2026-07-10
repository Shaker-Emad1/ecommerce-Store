using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ASBrandStore.Application.Common.Interfaces;
using ASBrandStore.Application.Common.Models;
using ASBrandStore.Application.DTOs;
using ASBrandStore.Domain.Entities;

namespace ASBrandStore.Application.Services;

public class ProductService : IProductService
{
    private readonly IApplicationDbContext _context;
    private readonly ICloudinaryService    _cloudinary;

    public ProductService(IApplicationDbContext context, ICloudinaryService cloudinary)
    {
        _context    = context;
        _cloudinary = cloudinary;
    }

    public async Task<PaginatedList<ProductDto>> GetProductsAsync(
        string? search,
        int? categoryId,
        decimal? minPrice,
        decimal? maxPrice,
        string? sortBy,
        bool? isFeatured,
        bool? isBestSeller,
        int pageIndex,
        int pageSize)
    {
        var query = _context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Colors)
            .Include(p => p.Images)
            .Include(p => p.Specs)
            .AsQueryable();

        // 1. Search
        if (!string.IsNullOrWhiteSpace(search))
        {
            var cleanSearch = search.Trim().ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(cleanSearch) ||
                p.Description.ToLower().Contains(cleanSearch) ||
                p.Category.Name.ToLower().Contains(cleanSearch));
        }

        // 2. Filters
        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

        if (minPrice.HasValue)
            query = query.Where(p => p.Price >= minPrice.Value);

        if (maxPrice.HasValue)
            query = query.Where(p => p.Price <= maxPrice.Value);

        if (isFeatured.HasValue)
            query = query.Where(p => p.IsFeatured == isFeatured.Value);

        if (isBestSeller.HasValue)
            query = query.Where(p => p.IsBestSeller == isBestSeller.Value);

        // 3. Sorting
        query = sortBy switch
        {
            "price-asc"  => query.OrderBy(p => p.Price),
            "price-desc" => query.OrderByDescending(p => p.Price),
            "rating"     => query.OrderByDescending(p => p.Rating),
            _            => query.OrderByDescending(p => p.CreatedAt)
        };

        // 4. Projection
        var projectedQuery = query.Select(p => new ProductDto(
            p.Id,
            p.Name,
            p.Price,
            p.OriginalPrice,
            p.Rating,
            p.ReviewsCount,
            p.Image,
            p.CategoryId,
            p.Category.Name,
            p.Badge,
            p.Description,
            p.Stock,
            p.IsFeatured,
            p.IsBestSeller,
            p.Colors.Select(c => c.ColorCode).ToList(),
            p.Images.Select(img => img.ImageUrl).ToList(),
            p.Specs.Select(s => new ProductSpecDto(s.Label, s.Value)).ToList()
        ));

        return await PaginatedList<ProductDto>.CreateAsync(projectedQuery, pageIndex, pageSize);
    }

    public async Task<ProductDto?> GetByIdAsync(int id)
    {
        var p = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Colors)
            .Include(p => p.Images)
            .Include(p => p.Specs)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (p == null) return null;

        return MapToDto(p);
    }

    public async Task<ProductDto> CreateAsync(CreateProductDto dto)
    {
        var category = await _context.Categories.FindAsync(dto.CategoryId);
        if (category == null) throw new Exception("الفئة المحددة غير صالحة");

        var product = new Product
        {
            Name          = dto.Name,
            Price         = dto.Price,
            OriginalPrice = dto.OriginalPrice,
            Image         = dto.Image,
            CategoryId    = dto.CategoryId,
            Badge         = dto.Badge,
            Description   = dto.Description,
            Stock         = dto.Stock,
            IsFeatured    = dto.IsFeatured,
            IsBestSeller  = dto.IsBestSeller
        };

        if (dto.Colors != null)
            foreach (var colorCode in dto.Colors)
                product.Colors.Add(new ProductColor { ColorCode = colorCode });

        if (dto.Images != null)
            foreach (var imageUrl in dto.Images)
                product.Images.Add(new ProductImage { ImageUrl = imageUrl });

        if (dto.Specs != null)
            foreach (var spec in dto.Specs)
                product.Specs.Add(new ProductSpecification { Label = spec.Label, Value = spec.Value });

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        product.Category = category;

        return MapToDto(product);
    }

    public async Task<ProductDto> UpdateAsync(UpdateProductDto dto)
    {
        var product = await _context.Products
            .Include(p => p.Colors)
            .Include(p => p.Images)
            .Include(p => p.Specs)
            .FirstOrDefaultAsync(p => p.Id == dto.Id);

        if (product == null) throw new Exception("المنتج غير موجود");

        var category = await _context.Categories.FindAsync(dto.CategoryId);
        if (category == null) throw new Exception("الفئة المحددة غير صالحة");

        // ── Cloudinary cleanup for changed main image ──────────────────────
        if (!string.IsNullOrWhiteSpace(product.Image) && product.Image != dto.Image)
        {
            var oldId = _cloudinary.ExtractPublicIdFromUrl(product.Image);
            if (!string.IsNullOrWhiteSpace(oldId))
                await _cloudinary.DeleteImageAsync(oldId);
        }

        // ── Cloudinary cleanup for removed gallery images ──────────────────
        var newImageUrls = dto.Images ?? new List<string>();
        foreach (var existing in product.Images)
        {
            if (!newImageUrls.Contains(existing.ImageUrl))
            {
                var oldId = _cloudinary.ExtractPublicIdFromUrl(existing.ImageUrl);
                if (!string.IsNullOrWhiteSpace(oldId))
                    await _cloudinary.DeleteImageAsync(oldId);
            }
        }

        product.Name          = dto.Name;
        product.Price         = dto.Price;
        product.OriginalPrice = dto.OriginalPrice;
        product.Image         = dto.Image;
        product.CategoryId    = dto.CategoryId;
        product.Badge         = dto.Badge;
        product.Description   = dto.Description;
        product.Stock         = dto.Stock;
        product.IsFeatured    = dto.IsFeatured;
        product.IsBestSeller  = dto.IsBestSeller;

        // Clear and reload collections
        _context.ProductColors.RemoveRange(product.Colors);
        _context.ProductImages.RemoveRange(product.Images);
        _context.ProductSpecifications.RemoveRange(product.Specs);

        product.Colors.Clear();
        product.Images.Clear();
        product.Specs.Clear();

        if (dto.Colors != null)
            foreach (var colorCode in dto.Colors)
                product.Colors.Add(new ProductColor { ColorCode = colorCode });

        if (dto.Images != null)
            foreach (var imageUrl in dto.Images)
                product.Images.Add(new ProductImage { ImageUrl = imageUrl });

        if (dto.Specs != null)
            foreach (var spec in dto.Specs)
                product.Specs.Add(new ProductSpecification { Label = spec.Label, Value = spec.Value });

        await _context.SaveChangesAsync();
        product.Category = category;

        return MapToDto(product);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var product = await _context.Products
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null) return false;

        // ── Delete all Cloudinary assets attached to this product ──────────
        // Main image
        try
        {
            if (!string.IsNullOrWhiteSpace(product.Image) && product.Image.Contains("res.cloudinary.com", StringComparison.OrdinalIgnoreCase))
            {
                var mainId = _cloudinary.ExtractPublicIdFromUrl(product.Image);
                if (!string.IsNullOrWhiteSpace(mainId))
                {
                    await _cloudinary.DeleteImageAsync(mainId);
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Warning] Failed to delete main Cloudinary image for product {id}: {ex.Message}");
        }

        // Gallery images
        if (product.Images != null)
        {
            foreach (var img in product.Images)
            {
                if (img == null) continue;
                try
                {
                    if (!string.IsNullOrWhiteSpace(img.ImageUrl) && img.ImageUrl.Contains("res.cloudinary.com", StringComparison.OrdinalIgnoreCase))
                    {
                        var galleryId = _cloudinary.ExtractPublicIdFromUrl(img.ImageUrl);
                        if (!string.IsNullOrWhiteSpace(galleryId))
                        {
                            await _cloudinary.DeleteImageAsync(galleryId);
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Warning] Failed to delete gallery Cloudinary image for product {id}: {ex.Message}");
                }
            }
        }

        // ── Safe Cascade Deletion of dependent database records ──────────
        // EF Core and the database will automatically cascade delete ProductColors, ProductImages,
        // ProductSpecifications, and OrderItems since they are all configured with Cascade delete behavior.
        // But to be 100% database-independent and safe, we can manually fetch and remove OrderItems 
        // referencing this product if any exist, ensuring it deletes properly even if the schema update is pending.
        try
        {
            var orderItems = await _context.OrderItems
                .Where(oi => oi.ProductId == id)
                .ToListAsync();
            if (orderItems.Any())
            {
                _context.OrderItems.RemoveRange(orderItems);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Warning] Failed to manually clean up OrderItems for product {id}: {ex.Message}");
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return true;
    }

    private static ProductDto MapToDto(Product p)
    {
        return new ProductDto(
            p.Id,
            p.Name,
            p.Price,
            p.OriginalPrice,
            p.Rating,
            p.ReviewsCount,
            p.Image,
            p.CategoryId,
            p.Category?.Name ?? string.Empty,
            p.Badge,
            p.Description,
            p.Stock,
            p.IsFeatured,
            p.IsBestSeller,
            p.Colors.Select(c => c.ColorCode).ToList(),
            p.Images.Select(img => img.ImageUrl).ToList(),
            p.Specs.Select(s => new ProductSpecDto(s.Label, s.Value)).ToList()
        );
    }
}
