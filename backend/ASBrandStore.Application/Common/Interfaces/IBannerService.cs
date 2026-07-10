using System.Collections.Generic;
using System.Threading.Tasks;
using ASBrandStore.Application.DTOs;

namespace ASBrandStore.Application.Common.Interfaces;

public interface IBannerService
{
    Task<List<BannerDto>> GetAllAsync();
    Task<BannerDto?> GetByIdAsync(int id);
    Task<BannerDto> CreateAsync(CreateBannerDto dto);
    Task<BannerDto> UpdateAsync(UpdateBannerDto dto);
    Task<bool> DeleteAsync(int id);
}
