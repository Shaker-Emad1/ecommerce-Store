using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ASBrandStore.Application.Common.Interfaces;
using ASBrandStore.Application.DTOs;
using ASBrandStore.Domain.Entities;

namespace ASBrandStore.Application.Services;

public class BannerService : IBannerService
{
    private readonly IApplicationDbContext _context;
    private readonly ICloudinaryService    _cloudinary;

    public BannerService(IApplicationDbContext context, ICloudinaryService cloudinary)
    {
        _context    = context;
        _cloudinary = cloudinary;
    }

    public async Task<List<BannerDto>> GetAllAsync()
    {
        return await _context.Banners
            .OrderBy(b => b.OrderIndex)
            .Select(b => new BannerDto(
                b.Id,
                b.Title,
                b.Subtitle,
                b.CtaText,
                b.ImageUrl,
                b.Badge,
                b.OrderIndex
            ))
            .ToListAsync();
    }

    public async Task<BannerDto?> GetByIdAsync(int id)
    {
        var b = await _context.Banners.FindAsync(id);
        if (b == null) return null;

        return new BannerDto(b.Id, b.Title, b.Subtitle, b.CtaText, b.ImageUrl, b.Badge, b.OrderIndex);
    }

    public async Task<BannerDto> CreateAsync(CreateBannerDto dto)
    {
        var banner = new Banner
        {
            Title      = dto.Title,
            Subtitle   = dto.Subtitle,
            CtaText    = dto.CtaText,
            ImageUrl   = dto.ImageUrl,
            Badge      = dto.Badge,
            OrderIndex = dto.OrderIndex
        };

        _context.Banners.Add(banner);
        await _context.SaveChangesAsync();

        return new BannerDto(banner.Id, banner.Title, banner.Subtitle, banner.CtaText, banner.ImageUrl, banner.Badge, banner.OrderIndex);
    }

    public async Task<BannerDto> UpdateAsync(UpdateBannerDto dto)
    {
        var banner = await _context.Banners.FindAsync(dto.Id);
        if (banner == null) throw new Exception("البنر غير موجود");

        // If the image URL changed, delete the old Cloudinary asset
        if (!string.IsNullOrWhiteSpace(banner.ImageUrl) &&
            banner.ImageUrl != dto.ImageUrl)
        {
            var oldPublicId = _cloudinary.ExtractPublicIdFromUrl(banner.ImageUrl);
            if (!string.IsNullOrWhiteSpace(oldPublicId))
                await _cloudinary.DeleteImageAsync(oldPublicId);
        }

        banner.Title      = dto.Title;
        banner.Subtitle   = dto.Subtitle;
        banner.CtaText    = dto.CtaText;
        banner.ImageUrl   = dto.ImageUrl;
        banner.Badge      = dto.Badge;
        banner.OrderIndex = dto.OrderIndex;

        await _context.SaveChangesAsync();

        return new BannerDto(banner.Id, banner.Title, banner.Subtitle, banner.CtaText, banner.ImageUrl, banner.Badge, banner.OrderIndex);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var banner = await _context.Banners.FindAsync(id);
        if (banner == null) return false;

        // Delete the Cloudinary asset before removing the DB record
        var publicId = _cloudinary.ExtractPublicIdFromUrl(banner.ImageUrl);
        if (!string.IsNullOrWhiteSpace(publicId))
            await _cloudinary.DeleteImageAsync(publicId);

        _context.Banners.Remove(banner);
        await _context.SaveChangesAsync();
        return true;
    }
}
