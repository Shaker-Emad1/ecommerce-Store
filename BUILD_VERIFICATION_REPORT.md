# Build Verification Report

## Frontend

| Metric | Value |
|--------|-------|
| Build tool | Vite 6.3.5 |
| Modules transformed | 1,693 |
| Build time | 7.50s |
| Total JS (gzipped) | ~129 KB |
| Errors | 0 |

### Chunk Splitting (via React.lazy)

| Chunk | Raw Size | Gzipped |
|-------|----------|---------|
| `index-CX43YivM.css` | 100.08 kB | 15.90 kB |
| `vendor-react-CjDSUk43.js` | 134.67 kB | 43.23 kB |
| `index-DJLILzgN.js` (router + shared) | 101.06 kB | 36.73 kB |
| `vendor-icons-D8Ibz_HX.js` | 25.39 kB | 7.05 kB |
| `AdminDashboard-BJZEesHm.js` | 37.95 kB | 7.46 kB |
| `HomePage-CXDu2liA.js` | 9.18 kB | 2.96 kB |
| `ProductDetailsPage-CAs4OppG.js` | 6.87 kB | 2.46 kB |
| `CheckoutPage-BcG7puw2.js` | 6.33 kB | 2.19 kB |
| `CartPage-BuL5grPz.js` | 4.47 kB | 1.54 kB |
| `ProductsPage-DqkQiTKf.js` | 3.95 kB | 1.58 kB |
| `CategoriesPage-BLbaKIsx.js` | 3.72 kB | 1.40 kB |
| `ProductCard-BK_kuFTe.js` | 2.94 kB | 1.29 kB |
| `Skeleton-BGe2EfBq.js` | 2.90 kB | 0.68 kB |
| `AdminLoginPage-B6ZDRPp3.js` | 2.13 kB | 0.97 kB |
| `SuccessPage-DcfA0OeC.js` | 2.01 kB | 1.08 kB |
| (Others < 1 kB each) | — | — |

**Result: PASS** — 0 errors, all chunks properly lazy-loaded per route.

## Backend

| Metric | Value |
|--------|-------|
| Target | .NET 10.0 |
| Build time | 4.77s |
| Errors | 0 |
| Warnings | 4 (all NU1603 — pre-existing Google.Apis.Sheets.v4 version mismatch, not introduced) |

### Projects Built
- ASBrandStore.Domain → ASBrandStore.Domain.dll
- ASBrandStore.Application → ASBrandStore.Application.dll
- ASBrandStore.Infrastructure → ASBrandStore.Infrastructure.dll
- ASBrandStore.Api → ASBrandStore.Api.dll

**Result: PASS** — 0 errors, 4 pre-existing warnings only.

## Migrations

| Migration | Status |
|-----------|--------|
| `20260621232401_InitialCreate` | Existing (unchanged) |
| `20260623200256_AddPerformanceIndexes` | Newly created |

### Indexes Added

| Table | Column(s) | Index Name |
|-------|-----------|------------|
| Products | Name | `IX_Products_Name` |
| Products | IsFeatured | `IX_Products_IsFeatured` |
| Products | IsBestSeller | `IX_Products_IsBestSeller` |
| Orders | OrderNumber | `IX_Orders_OrderNumber` |
| Orders | CreatedAt | `IX_Orders_CreatedAt` |
| Orders | Status | `IX_Orders_Status` |

**Result: PASS** — migration generated cleanly by EF Core tooling.

## Overall Verdict

**PASS** — All builds succeed with 0 errors. Frontend is fully refactored with lazy-loaded routes. Backend has new performance indexes. All existing business logic and UI visuals are preserved.
