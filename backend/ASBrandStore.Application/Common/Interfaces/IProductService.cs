using System.Threading.Tasks;
using ASBrandStore.Application.Common.Models;
using ASBrandStore.Application.DTOs;

namespace ASBrandStore.Application.Common.Interfaces;

public interface IProductService
{
    Task<PaginatedList<ProductDto>> GetProductsAsync(
        string? search, 
        int? categoryId, 
        decimal? minPrice, 
        decimal? maxPrice, 
        string? sortBy, 
        bool? isFeatured, 
        bool? isBestSeller, 
        int pageIndex, 
        int pageSize
    );
    Task<ProductDto?> GetByIdAsync(int id);
    Task<ProductDto> CreateAsync(CreateProductDto dto);
    Task<ProductDto> UpdateAsync(UpdateProductDto dto);
    Task<bool> DeleteAsync(int id);
}
