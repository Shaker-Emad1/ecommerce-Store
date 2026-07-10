using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ASBrandStore.Application.Common.Interfaces;
using ASBrandStore.Application.DTOs;

namespace ASBrandStore.Api.Controllers;

public class SettingsController : BaseApiController
{
    private readonly ISettingService _settingService;

    public SettingsController(ISettingService settingService)
    {
        _settingService = settingService;
    }


    [HttpGet]
    public async Task<ActionResult<SettingDto>> GetSettings()
    {
        var settings = await _settingService.GetSettingsAsync();
        return Ok(settings);
    }

    [HttpPut]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SettingDto>> UpdateSettings(UpdateSettingDto dto)
    {
        try
        {
            var settings = await _settingService.UpdateSettingsAsync(dto);
            return Ok(settings);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
