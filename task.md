# Tasks - Backend Implementation & Frontend Connection

- [x] **Phase 1: Backend Infrastructure & Persistence**
  - [x] Implement `ApplicationDbContext` with mappings and decimal precisions in `ASBrandStore.Infrastructure`.
  - [x] Implement `DbInitializer` for category, product, banner, setting, and admin seeding.
  - [x] Implement `JwtTokenGenerator` for authentication.
  - [x] Implement `CloudinaryService` for image uploading.
  - [x] Implement `WhatsAppService` for order notifications.
  - [x] Implement `GoogleSheetsService` for order tracking.
  - [x] Implement `SettingService` in `ASBrandStore.Application`.
  - [x] Implement `DashboardService` in `ASBrandStore.Application`.
  - [x] Add `IGoogleSheetsService` interface and modify `OrderService` to trigger it.
  - [x] Configure `DependencyInjection` class in `ASBrandStore.Infrastructure`.
  - [x] Phase 1 — Database Provider Migration
  - [x] Remove `Microsoft.EntityFrameworkCore.SqlServer` from `ASBrandStore.Infrastructure.csproj`
  - [x] Add `Npgsql.EntityFrameworkCore.PostgreSQL` and `Npgsql.EntityFrameworkCore.PostgreSQL.Design`
  - [x] Verify package compatibility

- [ ] **Phase 2: Backend API Layer**
  - [ ] Modify `Program.cs` and `appsettings.json` in `ASBrandStore.Api` (configure DbContext, JWT, Cors, Seeding, Controllers mapping).
  - [ ] Create `BaseApiController` and controllers for `Auth`, `Products`, `Categories`, `Orders`, `Banners`, `Settings`, `Dashboard`, and `Images`.
  - [ ] Compile and verify backend build.
  - [ ] Create EF Core Migrations and verify DB creation/seeding.

- [ ] **Phase 3: Frontend Integration**
  - [ ] Install Axios or implement fetch utility (HttpClient layer) in frontend.
  - [ ] Create API Service modules (`api.ts` or individual services).
  - [ ] Modify `App.tsx` to load categories, products, banners, settings from live endpoints.
  - [ ] Integrate authentication (login/register) for admin dashboard access in `App.tsx`.
  - [ ] Connect order checkout submit to `POST /api/orders`.
  - [ ] Connect admin panel CRUD actions for Products, Categories, Banners, and Settings.
