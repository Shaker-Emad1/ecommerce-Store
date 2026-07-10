using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ASBrandStore.Application.Common.Interfaces;
using ASBrandStore.Application.DTOs;

namespace ASBrandStore.Api.Controllers;

public class BannersController : BaseApiController
{
    private readonly IBannerService _bannerService;

    public BannersController(IBannerService bannerService)
    {
        _bannerService = bannerService;
    }

    [HttpGet]
    public async Task<ActionResult<List<BannerDto>>> GetBanners()
    {
        var banners = await _bannerService.GetAllAsync();
        return Ok(banners);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BannerDto>> GetBanner(int id)
    {
        var banner = await _bannerService.GetByIdAsync(id);
        if (banner == null)
        {
            return NotFound(new { message = "البنر غير موجود" });
        }
        return Ok(banner);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<BannerDto>> CreateBanner(CreateBannerDto dto)
    {
        try
        {
            var banner = await _bannerService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetBanner), new { id = banner.Id }, banner);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<BannerDto>> UpdateBanner(int id, UpdateBannerDto dto)
    {
        if (id != dto.Id)
        {
            return BadRequest(new { message = "رقم البنر غير متطابق" });
        }

        try
        {
            var banner = await _bannerService.UpdateAsync(dto);
            return Ok(banner);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteBanner(int id)
    {
        var deleted = await _bannerService.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound(new { message = "البنر غير موجود" });
        }
        return NoContent();
    }
}
