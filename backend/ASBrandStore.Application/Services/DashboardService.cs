using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ASBrandStore.Application.Common.Interfaces;
using ASBrandStore.Application.DTOs;

namespace ASBrandStore.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IApplicationDbContext _context;

    public DashboardService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardStatsDto> GetStatsAsync()
    {
        var todayUtc = DateTime.UtcNow.Date;
        var sevenDaysAgo = todayUtc.AddDays(-6);
        var nextDay = todayUtc.AddDays(1);
        var todayEnd = todayUtc.AddDays(1);

        // Run independent queries in parallel for better throughput
        // NOTE: EF Core's DbContext is NOT thread-safe. The previous version ran these
        // queries concurrently with Task.WhenAll on a single scoped DbContext, which
        // threw InvalidOperationException ("a second operation was started on this
        // context instance"). Await them sequentially instead.
        decimal totalSales = await _context.Orders
            .Where(o => o.Status != "ملغي")
            .SumAsync(o => (decimal?)o.GrandTotal) ?? 0;

        int todayOrdersCount = await _context.Orders
            .Where(o => o.CreatedAt >= todayUtc)
            .CountAsync();

        int activeCustomersCount = await _context.Orders
            .Select(o => o.CustomerPhone)
            .Distinct()
            .CountAsync();
        if (activeCustomersCount == 0)
        {
            activeCustomersCount = await _context.Users.CountAsync();
        }

        int totalProductsCount = await _context.Products.CountAsync();

        // Optimize sales history: use a single grouped query instead of 7 individual queries
        var salesHistoryData = await _context.Orders
            .Where(o => o.Status != "ملغي" && o.CreatedAt >= sevenDaysAgo && o.CreatedAt < nextDay)
            .GroupBy(o => new { Year = o.CreatedAt.Year, Month = o.CreatedAt.Month, Day = o.CreatedAt.Day })
            .Select(g => new { g.Key, Total = g.Sum(o => o.GrandTotal) })
            .ToListAsync();

        // Top Categories with product count
        var categoryData = await _context.Products
            .GroupBy(p => p.Category.Name)
            .Select(g => new { CategoryName = g.Key, Count = g.Count() })
            .ToListAsync();

        // Latest 5 Orders
        var latestOrders = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .OrderByDescending(o => o.CreatedAt)
            .Take(5)
            .Select(o => new OrderDto(
                o.Id,
                o.OrderNumber,
                o.CustomerName,
                o.CustomerPhone,
                o.Governorate,
                o.AddressDetails,
                o.Notes,
                o.TotalPrice,
                o.ShippingPrice,
                o.GrandTotal,
                o.Status,
                o.CreatedAt,
                o.OrderItems.Select(oi => new OrderItemDto(
                    oi.ProductId,
                    oi.Product != null ? oi.Product.Name : string.Empty,
                    oi.Quantity,
                    oi.UnitPrice,
                    oi.Product != null ? oi.Product.Image : string.Empty
                )).ToList()
            ))
            .ToListAsync();

        // Build sales history from grouped data
        var salesData = salesHistoryData.ToDictionary(k => $"{k.Key.Year}-{k.Key.Month:D2}-{k.Key.Day:D2}", v => v.Total);
        var salesHistory = new List<DailySaleDto>();
        for (int i = 6; i >= 0; i--)
        {
            var targetDate = todayUtc.AddDays(-i);
            string key = targetDate.ToString("yyyy-MM-dd");
            decimal dailyTotal = salesData.GetValueOrDefault(key, 0);
            salesHistory.Add(new DailySaleDto(targetDate.DayOfWeek switch
            {
                DayOfWeek.Sunday => "الأحد",
                DayOfWeek.Monday => "الإثنين",
                DayOfWeek.Tuesday => "الثلاثاء",
                DayOfWeek.Wednesday => "الأربعاء",
                DayOfWeek.Thursday => "الخميس",
                DayOfWeek.Friday => "الجمعة",
                DayOfWeek.Saturday => "السبت",
                _ => targetDate.DayOfWeek.ToString()
            }, dailyTotal));
        }

        // Build top categories
        var topCategories = totalProductsCount > 0
            ? categoryData.Select(g => new CategoryStatDto(g.CategoryName, Math.Round((double)g.Count / totalProductsCount * 100, 1))).ToList()
            : new List<CategoryStatDto>();

        return new DashboardStatsDto(
            totalSales,
            todayOrdersCount,
            activeCustomersCount,
            totalProductsCount,
            salesHistory,
            topCategories,
            latestOrders
        );
    }
}
