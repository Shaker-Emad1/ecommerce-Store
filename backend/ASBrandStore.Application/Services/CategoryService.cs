using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ASBrandStore.Application.Common.Interfaces;
using ASBrandStore.Application.DTOs;
using ASBrandStore.Domain.Entities;

namespace ASBrandStore.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly IApplicationDbContext _context;
    private readonly ICloudinaryService    _cloudinary;

    public CategoryService(IApplicationDbContext context, ICloudinaryService cloudinary)
    {
        _context    = context;
        _cloudinary = cloudinary;
    }

    public async Task<List<CategoryDto>> GetAllAsync()
    {
        return await _context.Categories
            .AsNoTracking()
            .Select(c => new CategoryDto(
                c.Id,
                c.Name,
                c.Icon,
                c.ImageUrl,
                c.Products.Count
            ))
            .ToListAsync();
    }

    public async Task<CategoryDto?> GetByIdAsync(int id)
    {
        var c = await _context.Categories
            .Include(x => x.Products)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (c == null) return null;

        return new CategoryDto(c.Id, c.Name, c.Icon, c.ImageUrl, c.Products.Count);
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto)
    {
        var category = new Category
        {
            Name     = dto.Name,
            Icon     = dto.Icon,
            ImageUrl = dto.ImageUrl
        };
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return new CategoryDto(category.Id, category.Name, category.Icon, category.ImageUrl, 0);
    }

    public async Task<CategoryDto> UpdateAsync(UpdateCategoryDto dto)
    {
        var category = await _context.Categories.FindAsync(dto.Id);
        if (category == null) throw new Exception("الفئة غير موجودة");

        // If the image URL changed, delete the old Cloudinary asset
        if (!string.IsNullOrWhiteSpace(category.ImageUrl) &&
            category.ImageUrl != dto.ImageUrl)
        {
            var oldPublicId = _cloudinary.ExtractPublicIdFromUrl(category.ImageUrl);
            if (!string.IsNullOrWhiteSpace(oldPublicId))
                await _cloudinary.DeleteImageAsync(oldPublicId);
        }

        category.Name     = dto.Name;
        category.Icon     = dto.Icon;
        category.ImageUrl = dto.ImageUrl;

        await _context.SaveChangesAsync();

        var count = await _context.Products.CountAsync(p => p.CategoryId == dto.Id);

        return new CategoryDto(category.Id, category.Name, category.Icon, category.ImageUrl, count);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) return false;

        // Delete the Cloudinary asset before removing the DB record
        var publicId = _cloudinary.ExtractPublicIdFromUrl(category.ImageUrl);
        if (!string.IsNullOrWhiteSpace(publicId))
            await _cloudinary.DeleteImageAsync(publicId);

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
        return true;
    }
}
