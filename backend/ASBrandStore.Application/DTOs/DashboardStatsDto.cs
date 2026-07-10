using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ASBrandStore.Application.DTOs;

public record DailySaleDto(
    [Required] string DayName,
    [Required] decimal TotalAmount
);

public record CategoryStatDto(
    [Required] string CategoryName,
    [Required] double Percentage
);

public record DashboardStatsDto(
    decimal TotalSales,
    int TodayOrdersCount,
    int ActiveCustomersCount,
    int TotalProductsCount,
    List<DailySaleDto> SalesHistory,
    List<CategoryStatDto> TopCategories,
    List<OrderDto> LatestOrders
);
