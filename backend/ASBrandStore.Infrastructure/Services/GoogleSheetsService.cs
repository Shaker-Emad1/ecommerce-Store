using System;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using ASBrandStore.Application.Common.Interfaces;
using ASBrandStore.Domain.Entities;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Services;
using Google.Apis.Sheets.v4;
using Google.Apis.Sheets.v4.Data;

namespace ASBrandStore.Infrastructure.Services;

public class GoogleSheetsService : IGoogleSheetsService
{
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _httpClientFactory;

    public GoogleSheetsService(IConfiguration config, IHttpClientFactory httpClientFactory)
    {
        _config = config;
        _httpClientFactory = httpClientFactory;
    }

    public async Task ExportOrderAsync(Order order)
    {
        var webhookUrl = _config["GoogleSheetsSettings:WebhookUrl"];
        var credentialsJson = _config["GOOGLE_SHEETS_CREDENTIALS"] ?? _config["GoogleSheetsSettings:CredentialsJson"];
        var spreadsheetId = _config["GoogleSheetsSettings:SpreadsheetId"];
        var sheetName = _config["GoogleSheetsSettings:SheetName"] ?? "Orders";

        var itemsSummary = string.Join(", ", order.OrderItems.Select(oi => 
            $"{(oi.Product != null ? oi.Product.Name : "منتج " + oi.ProductId)} (x{oi.Quantity})"));

        var rowData = new
        {
            OrderNumber = order.OrderNumber,
            Date = order.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
            CustomerName = order.CustomerName,
            CustomerPhone = order.CustomerPhone,
            Governorate = order.Governorate,
            Address = order.AddressDetails,
            Items = itemsSummary,
            Subtotal = order.TotalPrice,
            Shipping = order.ShippingPrice,
            GrandTotal = order.GrandTotal,
            Status = order.Status,
            Notes = order.Notes ?? string.Empty
        };

        Console.WriteLine($"[Google Sheets Mock] Exporting Order {order.OrderNumber} to sheet: {itemsSummary}");

        // 1. Webhook mode (Google Apps Script web app endpoint - easiest fallback)
        if (!string.IsNullOrEmpty(webhookUrl))
        {
            try
            {
                var client = _httpClientFactory.CreateClient();
                var content = new StringContent(JsonSerializer.Serialize(rowData), Encoding.UTF8, "application/json");
                var response = await client.PostAsync(webhookUrl, content);
                response.EnsureSuccessStatusCode();
                return;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Google Sheets Webhook Error] Failed to export via Webhook: {ex.Message}");
                // Fallback to try Sheets API or log
            }
        }

        // 2. Official Google Sheets API mode from environment-provided JSON
        if (!string.IsNullOrEmpty(credentialsJson) && !string.IsNullOrEmpty(spreadsheetId))
        {
            try
            {
                var json = credentialsJson.Trim();
                if (!json.StartsWith("{", StringComparison.Ordinal))
                {
                    json = Encoding.UTF8.GetString(Convert.FromBase64String(json));
                }

                using (var stream = new MemoryStream(Encoding.UTF8.GetBytes(json)))
                {
                    GoogleCredential credential;
                    credential = GoogleCredential.FromStream(stream)
                        .CreateScoped(SheetsService.Scope.Spreadsheets);

                    var service = new SheetsService(new BaseClientService.Initializer
                    {
                        HttpClientInitializer = credential,
                        ApplicationName = "ASBrandStore"
                    });

                    var range = $"{sheetName}!A:L";
                    var valueRange = new ValueRange
                    {
                        Values = new System.Collections.Generic.List<System.Collections.Generic.IList<object>>
                        {
                            new System.Collections.Generic.List<object>
                            {
                                rowData.OrderNumber,
                                rowData.Date,
                                rowData.CustomerName,
                                rowData.CustomerPhone,
                                rowData.Governorate,
                                rowData.Address,
                                rowData.Items,
                                rowData.Subtotal,
                                rowData.Shipping,
                                rowData.GrandTotal,
                                rowData.Status,
                                rowData.Notes
                            }
                        }
                    };

                    var appendRequest = service.Spreadsheets.Values.Append(valueRange, spreadsheetId, range);
                    appendRequest.ValueInputOption = SpreadsheetsResource.ValuesResource.AppendRequest.ValueInputOptionEnum.USERENTERED;
                    await appendRequest.ExecuteAsync();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Google Sheets API Error] Failed to export via API: {ex.Message}");
            }
        }
    }
}
