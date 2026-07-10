using System.Threading.Tasks;
using ASBrandStore.Application.DTOs;

namespace ASBrandStore.Application.Common.Interfaces;

public interface ISettingService
{
    Task<SettingDto> GetSettingsAsync();
    Task<SettingDto> UpdateSettingsAsync(UpdateSettingDto dto);
}
