using System.Threading.Tasks;
using ASBrandStore.Application.DTOs;

namespace ASBrandStore.Application.Common.Interfaces;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetStatsAsync();
}
