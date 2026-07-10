using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ASBrandStore.Application.Common.Interfaces;
using ASBrandStore.Application.DTOs;
using ASBrandStore.Domain.Entities;

namespace ASBrandStore.Application.Services;

public class SettingService : ISettingService
{
    private readonly IApplicationDbContext _context;

    public SettingService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<SettingDto> GetSettingsAsync()
    {
        var setting = await _context.Settings.FirstOrDefaultAsync();
        if (setting == null)
        {
            setting = new Setting
            {
                StoreName = "A.S Brand Store",
                ContactPhone = "01275414542",
                ContactEmail = "info@asbrand.com",
                Address = "القاهرة، مصر",
                ShippingThreshold = 900,
                WhatsappUrl = "https://wa.me/201275414542",
                InstagramUrl = "@asbrand_store"
            };
            _context.Settings.Add(setting);
            await _context.SaveChangesAsync();
        }

        return MapToDto(setting);
    }

    public async Task<SettingDto> UpdateSettingsAsync(UpdateSettingDto dto)
    {
        var setting = await _context.Settings.FirstOrDefaultAsync();
        if (setting == null)
        {
            setting = new Setting();
            _context.Settings.Add(setting);
        }

        setting.StoreName = dto.StoreName;
        setting.ContactPhone = dto.ContactPhone;
        setting.ContactEmail = dto.ContactEmail;
        setting.Address = dto.Address;
        setting.ShippingThreshold = dto.ShippingThreshold;
        setting.WhatsappUrl = dto.WhatsappUrl;
        setting.InstagramUrl = dto.InstagramUrl;

        await _context.SaveChangesAsync();

        return MapToDto(setting);
    }

    private static SettingDto MapToDto(Setting s)
    {
        return new SettingDto(
            s.Id,
            s.StoreName,
            s.ContactPhone,
            s.ContactEmail,
            s.Address,
            s.ShippingThreshold,
            s.WhatsappUrl,
            s.InstagramUrl
        );
    }
}
