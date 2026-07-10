using System;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using ASBrandStore.Application.Common.Interfaces;
using ASBrandStore.Domain.Entities;

namespace ASBrandStore.Infrastructure.Services;

public class WhatsAppService : IWhatsAppService
{
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _httpClientFactory;

    public WhatsAppService(IConfiguration config, IHttpClientFactory httpClientFactory)
    {
        _config = config;
        _httpClientFactory = httpClientFactory;
    }

    public async Task SendMessageAsync(string toPhoneNumber, string message)
    {
        var provider = _config["WhatsAppSettings:Provider"]; // e.g. "UltraMsg" or "Mock"
        var apiUrl = _config["WhatsAppSettings:ApiUrl"];
        var token = _config["WhatsAppSettings:Token"];
        var instanceId = _config["WhatsAppSettings:InstanceId"];

        Console.WriteLine($"[WhatsApp Mock] Sending message to {toPhoneNumber}: {message}");

        if (string.IsNullOrEmpty(apiUrl) || string.IsNullOrEmpty(token))
        {
            // Fallback: WhatsApp Mock logger
            return;
        }

        try
        {
            var client = _httpClientFactory.CreateClient();

            if (provider?.Equals("UltraMsg", StringComparison.OrdinalIgnoreCase) == true)
            {
                // UltraMsg Integration
                var payload = new
                {
                    token = token,
                    to = toPhoneNumber,
                    body = message
                };

                var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                var response = await client.PostAsync($"{apiUrl}/{instanceId}/messages/chat", content);
                response.EnsureSuccessStatusCode();
            }
            else
            {
                // Generic JSON API fallback
                var payload = new { to = toPhoneNumber, body = message };
                var request = new HttpRequestMessage(HttpMethod.Post, apiUrl);
                request.Headers.Add("Authorization", $"Bearer {token}");
                request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                
                var response = await client.SendAsync(request);
                response.EnsureSuccessStatusCode();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[WhatsApp Error] Failed to send WhatsApp message: {ex.Message}");
            // We do not throw exception to avoid breaking client checkout process
        }
    }

    public async Task SendOrderNotificationAsync(Order order)
    {
        var sb = new StringBuilder();
        sb.AppendLine("مرحباً بك في AS Brand Store! 🎉");
        sb.AppendLine();
        sb.AppendLine($"تم استلام طلبك بنجاح رقم: {order.OrderNumber}");
        sb.AppendLine($"الاسم: {order.CustomerName}");
        sb.AppendLine($"الهاتف: {order.CustomerPhone}");
        sb.AppendLine($"المحافظة: {order.Governorate}");
        sb.AppendLine($"العنوان: {order.AddressDetails}");
        sb.AppendLine();
        sb.AppendLine("المنتجات المطلوبة:");

        foreach (var item in order.OrderItems)
        {
            string productName = item.Product != null ? item.Product.Name : $"منتج رقم {item.ProductId}";
            sb.AppendLine($"- {productName} (الكمية: {item.Quantity})");
        }

        sb.AppendLine();
        sb.AppendLine($"إجمالي المنتجات: {order.TotalPrice} ج.م");
        sb.AppendLine($"تكلفة الشحن: {(order.ShippingPrice == 0 ? "مجاني" : $"{order.ShippingPrice} ج.م")}");
        sb.AppendLine($"الإجمالي الكلي: {order.GrandTotal} ج.م");
        sb.AppendLine();
        sb.AppendLine("سنقوم بتجهيز طلبك وشحنه في أقرب وقت. للتواصل أو التعديل تواصل معنا عبر هذا الرقم.");

        await SendMessageAsync(order.CustomerPhone, sb.ToString());
    }
}
