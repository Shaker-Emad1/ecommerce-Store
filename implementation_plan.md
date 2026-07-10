# Implementation Plan - Backend Components for Premium Arabic E-commerce Store

This plan details the design and implementation steps for completing the remaining backend components of the **ASBrandStore** project. 

The implementation respects all constraints: it will **not** recreate existing entities, **not** overwrite completed files (except to hook in new features cleanly like Google Sheets/WhatsApp), and **not** restart the project structure.

---

## User Review Required

> [!IMPORTANT]
> - **SQL Server Database**: The database will use EF Core and SQL Server. By default, it will be configured to connect to `(localdb)\mssqllocaldb`. We will configure the API to run database migrations and seed default mock categories, products, banners, and settings on startup.
> - **Integrations**: 
>   - **Cloudinary**: Requires Cloudinary cloud name, API key, and API secret. Stub support will be configured to allow local file storage or logging if keys are not provided.
>   - **WhatsApp Service**: A fully functional mock and HTTP-driven implementation that logs notifications to output and is prepared to talk to a WhatsApp Webhook/Provider.
>   - **Google Sheets Service**: Uses the official Google Sheets API client. It can load credentials from a file/settings, and has a graceful fallback to a Webhook URL (like a Google Apps Script Web App) if Google API credentials are not set up.
> - **Authentication**: Admin operations will be guarded using JWT Bearer authentication.

---

## Open Questions

> [!NOTE]
> None. The plan handles fallbacks for all external integrations (Cloudinary, WhatsApp, Google Sheets) so that the application runs locally and compiles perfectly without requiring credentials immediately.

---

## Proposed Changes

### 1. Application Layer

We will implement the missing services and add the interface for Google Sheets integration.

#### [NEW] [IGoogleSheetsService.cs](file:///c:/Users/anake/Desktop/ecoomerce/backend/ASBrandStore.Application/Common/Interfaces/IGoogleSheetsService.cs)
Expose order exporting functionality:
```csharp
namespace ASBrandStore.Application.Common.Interfaces;

public interface IGoogleSheetsService
{
    Task ExportOrderAsync(Domain.Entities.Order order);
}
```

#### [NEW] [SettingService.cs](file:///c:/Users/anake/Desktop/ecoomerce/backend/ASBrandStore.Application/Services/SettingService.cs)
Implements `ISettingService` to fetch and update application-wide settings in the database.

#### [NEW] [DashboardService.cs](file:///c:/Users/anake/Desktop/ecoomerce/backend/ASBrandStore.Application/Services/DashboardService.cs)
Implements `IDashboardService` to calculate:
- Total Sales
- Today's Orders count
- Active Customers count (unique phone numbers or registered users)
- Total Products count
- Sales history for the last 7 days
- Top Categories breakdown (percentage of total products or sales)
- Latest 5 orders

#### [MODIFY] [OrderService.cs](file:///c:/Users/anake/Desktop/ecoomerce/backend/ASBrandStore.Application/Services/OrderService.cs)
Inject `IGoogleSheetsService` and invoke it asynchronously on order creation:
```csharp
// Inject IGoogleSheetsService
// In CreateOrderAsync:
try
{
    await _googleSheetsService.ExportOrderAsync(order);
}
catch (Exception ex)
{
    Console.WriteLine($"Error exporting order to Google Sheets: {ex.Message}");
}
```

---

### 2. Infrastructure Layer

We will build the EF Core database context, authentication helpers, and external integrations.

#### [NEW] [ApplicationDbContext.cs](file:///c:/Users/anake/Desktop/ecoomerce/backend/ASBrandStore.Infrastructure/Persistence/ApplicationDbContext.cs)
- Implements `IApplicationDbContext` inheriting from EF Core's `DbContext`.
- Configures decimal precisions for all currency columns (`Price`, `OriginalPrice`, `TotalPrice`, `ShippingPrice`, `GrandTotal`).
- Sets up cascade delete behaviors (Cascade delete for Product colors/specs/images, Restrict delete for OrderItems on Product deletion).

#### [NEW] [DbInitializer.cs](file:///c:/Users/anake/Desktop/ecoomerce/backend/ASBrandStore.Infrastructure/Persistence/DbInitializer.cs)
Seeds the database with:
- Store Categories (Ø³Ù…Ø§Ø¹Ø§Øª, Ø´ÙˆØ§Ø­Ù†, ÙƒØ§Ø¨Ù„Ø§Øª, Ø¨Ø·Ø§Ø±ÙŠØ§Øª, Ø­Ø§ÙØ¸Ø§Øª, Ø¥ÙƒØ³Ø³ÙˆØ§Ø±Ø§Øª)
- Mock Products with Specifications and Colors matching the frontend mock data
- Admin User (`set via `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD`)
- Hero Banner slides
- Default Store Settings

#### [NEW] [JwtTokenGenerator.cs](file:///c:/Users/anake/Desktop/ecoomerce/backend/ASBrandStore.Infrastructure/Security/JwtTokenGenerator.cs)
Implements `IJwtTokenGenerator` using `Microsoft.IdentityModel.Tokens` and JWT signature configurations.

#### [NEW] [CloudinaryService.cs](file:///c:/Users/anake/Desktop/ecoomerce/backend/ASBrandStore.Infrastructure/Services/CloudinaryService.cs)
Implements `ICloudinaryService` using `CloudinaryDotNet` package. Uploads streams to Cloudinary folder. Falls back to a local storage mock if settings are empty.

#### [NEW] [WhatsAppService.cs](file:///c:/Users/anake/Desktop/ecoomerce/backend/ASBrandStore.Infrastructure/Services/WhatsAppService.cs)
Implements `IWhatsAppService`. Logs notifications, supports sending raw HTTP payload or calling a service provider.

#### [NEW] [GoogleSheetsService.cs](file:///c:/Users/anake/Desktop/ecoomerce/backend/ASBrandStore.Infrastructure/Services/GoogleSheetsService.cs)
Implements `IGoogleSheetsService`. Supports writing order details (Order Number, Customer Name, Phone, Governorate, Total, Products) to a Google Sheet. Supports fallback webhook POST if Google Sheets API credentials are not set up.

#### [NEW] [DependencyInjection.cs](file:///c:/Users/anake/Desktop/ecoomerce/backend/ASBrandStore.Infrastructure/DependencyInjection.cs)
An extension method `AddInfrastructureServices(...)` registering EF Core, authentication, and integration services.

---

### 3. API Layer (ASBrandStore.Api)

We will implement the controllers and glue everything together in `Program.cs`.

#### [NEW] Controllers in `ASBrandStore.Api/Controllers/`:
- **BaseApiController.cs**: Common `[ApiController]` and route properties.
- **AuthController.cs**: `/api/auth/register`, `/api/auth/login`
- **ProductsController.cs**: CRUD endpoints + search/filter query operations.
- **CategoriesController.cs**: CRUD endpoints for product categories.
- **OrdersController.cs**: Create order (public), Get order (public), Get all/Update status (Admin).
- **BannersController.cs**: CRUD endpoints for homepage banners.
- **SettingsController.cs**: Retrieve settings (public), Edit settings (Admin).
- **DashboardController.cs**: `/api/dashboard/stats` (Admin).
- **ImagesController.cs**: Upload endpoint `/api/images/upload` using `ICloudinaryService`.

#### [MODIFY] [Program.cs](file:///c:/Users/anake/Desktop/ecoomerce/backend/ASBrandStore.Api/Program.cs)
- Register Controllers, Swagger, and Cors.
- Configure Jwt Authentication scheme middleware (`app.UseAuthentication()`, `app.UseAuthorization()`).
- Call `DbInitializer.InitializeAsync()` on startup to apply migrations and seed data.

#### [MODIFY] [appsettings.json](file:///c:/Users/anake/Desktop/ecoomerce/backend/ASBrandStore.Api/appsettings.json) & [appsettings.Development.json](file:///c:/Users/anake/Desktop/ecoomerce/backend/ASBrandStore.Api/appsettings.Development.json)
Configure:
- Database connection string
- Jwt token settings (Key, Issuer, Audience, ExpireMinutes)
- Cloudinary, WhatsApp, and Google Sheets settings (Webhook URL, SpreadSheetId)

---

## Verification Plan

### Automated Tests / Compilation
- Run `dotnet build` from backend directory to verify compiler sanity.
- Run database migration generation `dotnet ef migrations add InitialCreate` to verify EF Core schema mapping.

### Manual Verification
- Launch the API using `dotnet run --project ASBrandStore.Api`.
- Open Swagger UI to test registration/login, fetching products, creating orders, updating status, and retrieving dashboard statistics.
