using System.Threading.Tasks;
using ASBrandStore.Domain.Entities;

namespace ASBrandStore.Application.Common.Interfaces;

public interface IGoogleSheetsService
{
    Task ExportOrderAsync(Order order);
}
