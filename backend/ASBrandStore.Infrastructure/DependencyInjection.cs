using System;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using ASBrandStore.Application.Common.Interfaces;
using ASBrandStore.Infrastructure.Persistence;
using ASBrandStore.Infrastructure.Security;
using ASBrandStore.Infrastructure.Services;

namespace ASBrandStore.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // 1. Add HttpClient
        services.AddHttpClient();

        // 2. Add DbContext
        var rawConnection = Environment.GetEnvironmentVariable("DATABASE_URL")
            ?? configuration.GetConnectionString("DefaultConnection")
            ?? "Host=localhost;Database=asbrandstore;Username=postgres;Password=postgres;Pooling=true;";

        var connectionString = ResolvePostgresConnectionString(rawConnection);

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(connectionString, b => b.MigrationsAssembly("ASBrandStore.Api")));

        // Register Database Context Interface
        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

        // 3. Register Core Security and Integration Services
        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddSingleton<ICloudinaryService, CloudinaryService>();
        services.AddSingleton<IWhatsAppService, WhatsAppService>();
        services.AddSingleton<IGoogleSheetsService, GoogleSheetsService>();

        // 4. Configure Authentication using JWT Bearer
        var secret = ResolveRequiredSetting(configuration["JwtSettings:Secret"], "JWT_SECRET", "JWT Secret");
        var issuer = configuration["JwtSettings:Issuer"] ?? "ASBrandStore";
        var audience = configuration["JwtSettings:Audience"] ?? "ASBrandStore";

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = issuer,
                ValidAudience = audience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
                ClockSkew = TimeSpan.Zero
            };
        });

        return services;
    }

    private static string ResolvePostgresConnectionString(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            return input;
        }

        if (input.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) || 
            input.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                var uri = new Uri(input);
                var userInfo = uri.UserInfo.Split(':');
                var username = userInfo[0];
                var password = userInfo.Length > 1 ? userInfo[1] : "";
                var host = uri.Host;
                var port = uri.Port > 0 ? uri.Port : 5432;
                var database = uri.AbsolutePath.TrimStart('/');

                return $"Host={host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true;Pooling=true;";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error parsing DATABASE_URL URI: {ex.Message}. Using raw connection string.");
                return input;
            }
        }

        return input;
    }

    private static string ResolveRequiredSetting(string? configuredValue, string environmentVariable, string settingName)
    {
        if (!string.IsNullOrWhiteSpace(configuredValue))
        {
            return configuredValue;
        }

        var environmentValue = Environment.GetEnvironmentVariable(environmentVariable);
        if (!string.IsNullOrWhiteSpace(environmentValue))
        {
            return environmentValue;
        }

        throw new InvalidOperationException($"{settingName} is not configured. Set the configuration value or {environmentVariable} environment variable.");
    }
}