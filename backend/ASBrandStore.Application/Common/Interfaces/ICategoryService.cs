using System.Collections.Generic;
using System.Threading.Tasks;
using ASBrandStore.Application.DTOs;

namespace ASBrandStore.Application.Common.Interfaces;

public interface ICategoryService
{
    Task<List<CategoryDto>> GetAllAsync();
    Task<CategoryDto?> GetByIdAsync(int id);
    Task<CategoryDto> CreateAsync(CreateCategoryDto dto);
    Task<CategoryDto> UpdateAsync(UpdateCategoryDto dto);
    Task<bool> DeleteAsync(int id);
}
