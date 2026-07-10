using Microsoft.Extensions.DependencyInjection;
using ASBrandStore.Application.Common.Interfaces;
using ASBrandStore.Application.Services;

namespace ASBrandStore.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IBannerService, BannerService>();
        services.AddScoped<ISettingService, SettingService>();
        services.AddScoped<IDashboardService, DashboardService>();

        return services;
    }
}
