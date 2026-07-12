using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
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
        services.AddHttpClient();

        var rawConnection = ResolveRequiredSetting(
            configuration["DATABASE_URL"] ?? configuration.GetConnectionString("DefaultConnection"),
            "DATABASE_URL",
            "Database connection string");
        var connectionString = ResolvePostgresConnectionString(rawConnection);

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(connectionString, b => b.MigrationsAssembly("ASBrandStore.Api")));

        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddSingleton<ICloudinaryService, CloudinaryService>();
        services.AddSingleton<IWhatsAppService, WhatsAppService>();
        services.AddSingleton<IGoogleSheetsService, GoogleSheetsService>();

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
                var userInfo = uri.UserInfo.Split(':', 2);
                var username = userInfo.Length > 0 ? Uri.UnescapeDataString(userInfo[0]) : "";
                var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
                var host = uri.Host;
                var port = uri.Port > 0 ? uri.Port : 5432;
                var database = Uri.UnescapeDataString(uri.AbsolutePath.TrimStart('/'));

                var properties = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
                {
                    ["Host"] = host,
                    ["Port"] = port.ToString(CultureInfo.InvariantCulture),
                    ["Database"] = database,
                    ["Username"] = username,
                    ["Password"] = password
                };

                foreach (var pair in ParseQueryString(uri.Query))
                {
                    properties[NormalizeConnectionStringKey(pair.Key)] = pair.Value;
                }

                properties.TryAdd("SSL Mode", "Require");
                properties.TryAdd("Trust Server Certificate", "true");
                properties.TryAdd("Pooling", "true");

                return string.Join(";", properties.Select(pair => $"{pair.Key}={pair.Value}")) + ";";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error parsing DATABASE_URL URI: {ex.Message}. Using raw connection string.");
                return input;
            }
        }

        return input;
    }

    private static IEnumerable<KeyValuePair<string, string>> ParseQueryString(string query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            yield break;
        }

        var trimmed = query.TrimStart('?');
        foreach (var segment in trimmed.Split('&', StringSplitOptions.RemoveEmptyEntries))
        {
            var parts = segment.Split('=', 2);
            var key = Uri.UnescapeDataString(parts[0]);
            var value = parts.Length > 1 ? Uri.UnescapeDataString(parts[1]) : string.Empty;

            if (!string.IsNullOrWhiteSpace(key))
            {
                yield return new KeyValuePair<string, string>(key, value);
            }
        }
    }

    private static string NormalizeConnectionStringKey(string key)
    {
        return key.Trim().ToLowerInvariant() switch
        {
            "sslmode" => "SSL Mode",
            "ssl mode" => "SSL Mode",
            "trust_server_certificate" => "Trust Server Certificate",
            "trust server certificate" => "Trust Server Certificate",
            "channel_binding" => "Channel Binding",
            "search_path" => "Search Path",
            _ => string.Join(" ", key
                .Split(new[] { '_', ' ' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(part => char.ToUpperInvariant(part[0]) + part[1..]))
        };
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
