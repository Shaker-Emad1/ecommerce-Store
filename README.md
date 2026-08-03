# A.S Brand Store

> Production-ready Arabic e-commerce platform with a React storefront, ASP.NET Core API, PostgreSQL persistence, and Dockerized deployment.


## 📌 Overview

A.S Brand Store is a full-stack Arabic storefront focused on mobile accessories and electronics. The repository contains a customer-facing shopping experience, an administrator dashboard, a layered ASP.NET Core backend, PostgreSQL data storage, Docker deployment assets, and optional integrations for media upload, WhatsApp notifications, and Google Sheets order export.

The UI is built with a premium RTL-first design system and the backend follows a layered structure split into API, Application, Domain, and Infrastructure projects.

## ✨ Key Features

### Customer Features

- Arabic RTL storefront with category browsing, product listing, and product detail pages
- Product search, category filtering, sorting, and paginated catalog browsing
- Shopping cart with persisted client-side state
- Checkout flow with shipping form and cash-on-delivery order submission
- Order success page and related product recommendations
- Product image gallery with fullscreen viewer, zoom, swipe, and keyboard navigation

### Admin Features

- JWT-protected administrator login
- Dashboard statistics for products, orders, customers, and revenue
- Product CRUD with gallery images, colors, specifications, and stock management
- Category CRUD with icon and image management
- Banner CRUD for homepage merchandising
- Store settings management
- Order review and status updates
- Cloudinary-backed image upload from the admin panel

### System Features

- Layered backend architecture
- PostgreSQL with Entity Framework Core migrations
- Automatic database initialization and seed data
- JWT authentication and role-based authorization
- Rate limiting on authentication endpoints
- Swagger/OpenAPI in development
- Docker Compose setup for frontend, backend, and database
- Optional WhatsApp and Google Sheets integrations for order workflows

## 🧰 Technology Stack

| Area | Technologies |
| --- | --- |
| Backend | ASP.NET Core 10, C#, Entity Framework Core 10, MediatR, FluentValidation, Swashbuckle |
| Frontend | React 18, Vite 6, React Router 7, TypeScript, Axios, Tailwind CSS 4 |
| Database | PostgreSQL 17, Npgsql |
| Architecture | Layered architecture: API, Application, Domain, Infrastructure |
| Authentication | JWT Bearer, BCrypt password hashing, role-based authorization |
| DevOps | Docker, Docker Compose, Nginx, Render, Vercel |
| Libraries | CloudinaryDotNet, Google Sheets API, Sonner, Lucide React, Recharts, Radix UI, MUI, Motion |

## 🏗️ Architecture

The backend is organized into distinct layers:

```text
Frontend (React SPA)
        |
        v
ASP.NET Core API
        |
        v
Application Layer
        |
        v
Domain Layer
        |
        v
Infrastructure Layer
        |
        v
PostgreSQL + External Services
```

### Request Flow

1. The React frontend calls the REST API through Axios.
2. API controllers handle HTTP concerns and authorization.
3. Application services coordinate business operations.
4. Infrastructure services handle persistence, JWT generation, image upload, and external integrations.
5. Entity Framework Core persists data to PostgreSQL.

## 🗂️ Folder Structure

```text
.
├── backend/
│   ├── ASBrandStore.Api/
│   ├── ASBrandStore.Application/
│   │   ├── Common/
│   │   ├── DTOs/
│   │   └── Services/
│   ├── ASBrandStore.Domain/
│   └── ASBrandStore.Infrastructure/
│       ├── Persistence/
│       ├── Security/
│       └── Services/
├── Frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── shared/
│   │   ├── store/
│   │   └── styles/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vercel.json
├── launcher/
├── pgsql/
├── docker-compose.yml
├── .env.example
├── run.ps1
└── run.bat
```

## 🖥️ Backend Overview

The backend solution is split into four projects:

- `ASBrandStore.Api`: ASP.NET Core entry point, controllers, middleware, Swagger, CORS, rate limiting
- `ASBrandStore.Application`: DTOs, interfaces, validation, and business services
- `ASBrandStore.Domain`: core entities such as products, orders, users, banners, and settings
- `ASBrandStore.Infrastructure`: PostgreSQL persistence, JWT generation, Cloudinary, WhatsApp, Google Sheets

### Implemented API Areas

| Area | Endpoints Present |
| --- | --- |
| Authentication | register, login |
| Products | list, details, create, update, delete |
| Categories | list, details, create, update, delete |
| Banners | list, details, create, update, delete |
| Orders | create, details, list, status update |
| Settings | get, update |
| Dashboard | stats |
| Images | upload |
| Health | health check |

### Operational Details

- Applies EF Core migrations automatically on startup
- Seeds default settings, banners, categories, products, and an admin account when data is empty
- Accepts PostgreSQL connection strings in either standard Npgsql format or `postgres://` / `postgresql://` URI format
- Adds security headers and response caching
- Uses a fixed-window rate limiter for authentication endpoints

## 🎨 Frontend Overview

The frontend is a React SPA built with Vite and organized around routed pages, reusable components, API services, and shared state providers.

### Storefront Routes

- `/`
- `/categories`
- `/products`
- `/product/:id`
- `/cart`
- `/checkout`
- `/success`

### Admin Routes

- `/administrator/login`
- `/administrator/*`

### Frontend Patterns

- `AuthProvider` manages JWT persistence and session restoration
- `CartProvider` persists cart state in `localStorage`
- Axios interceptors attach bearer tokens and clear auth on `401`
- Lazy-loaded routes reduce initial bundle work
- RTL-oriented UI styling is applied across the storefront and admin dashboard

## 🗄️ Database

PostgreSQL is the primary database. Entity Framework Core is used for migrations, startup initialization, and data access.

### Main Entities

- `User`
- `Product`
- `ProductImage`
- `ProductColor`
- `ProductSpecification`
- `Category`
- `Banner`
- `Order`
- `OrderItem`
- `Setting`

### Seeded Data

On first run, the application seeds:

- Store settings
- Homepage banners
- Product categories
- Sample products
- An administrator account when bootstrap credentials are configured

## 🔐 Authentication & Authorization

| Capability | Implementation |
| --- | --- |
| Authentication | JWT Bearer tokens |
| Password Storage | BCrypt hashing |
| Roles | `Admin`, `Customer` |
| Admin Protection | Protected frontend route and authorized backend endpoints |
| Token Handling | Stored client-side and attached through Axios interceptors |

Admin-only operations are enforced in the API through authorization attributes and in the frontend through the protected admin route.

## 🔌 API Documentation

Swagger/OpenAPI is configured in the backend and exposed in development mode.

| Resource | Value |
| --- | --- |
| Swagger UI | `/swagger` |
| OpenAPI JSON | `/swagger/v1/swagger.json` |
| Health Check | `/api/health` |

No separate Postman collection or external API reference file is currently included in the repository.

## 🐳 Docker Setup

The repository includes a multi-service Docker Compose setup:

- `asbrandstore-db`: PostgreSQL 17
- `backend`: ASP.NET Core API container
- `frontend`: Nginx-served Vite build

### Docker Services

| Service | Port | Notes |
| --- | --- | --- |
| Frontend | `80` | Public entry point |
| Backend | `127.0.0.1:5000` | API container |
| PostgreSQL | `127.0.0.1:5432` | Database container |

### Start with Docker

```powershell
Copy-Item .env.example .env
docker compose up --build
```

## 💻 Local Development

### Prerequisites

- .NET 10 SDK
- Node.js 22+ and npm
- PostgreSQL 17 or a reachable PostgreSQL instance

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/Shaker-Emad1/A-S-Brand-Store.git
cd A-S-Brand-Store
```

#### 2. Backend setup

```powershell
dotnet restore .\backend\ASBrandStore.Api\ASBrandStore.Api.csproj
```

#### 3. Frontend setup

```powershell
cd .\Frontend
npm install
cd ..
```

#### 4. Environment setup

```powershell
Copy-Item .env.example .env
```

## ⚙️ Configuration

Configuration is loaded from ASP.NET Core configuration sources, environment variables, and the frontend Vite environment.

### Backend Notes

- `DATABASE_URL` is required by the backend
- `JWT_SECRET` is required for token signing
- admin bootstrap credentials are used to seed the first admin account
- CORS allowed origins are read from configuration

### Frontend Notes

- `VITE_API_BASE_URL` controls the API base URL used by Axios
- local Vite development proxies `/api` to `VITE_API_PROXY_TARGET`

## 🔑 Environment Variables

### Required

| Variable | Used By | Description |
| --- | --- | --- |
| `DATABASE_URL` | Backend | PostgreSQL connection string |
| `JWT_SECRET` | Backend | JWT signing secret |
| `ADMIN_BOOTSTRAP_EMAIL` | Backend | Initial admin email for bootstrap seeding |
| `ADMIN_BOOTSTRAP_PASSWORD` | Backend | Initial admin password for bootstrap seeding |
| `DB_PASSWORD` | Docker | PostgreSQL container password |
| `VITE_API_BASE_URL` | Frontend | API base URL for browser requests |

### Optional

| Variable | Used By | Description |
| --- | --- | --- |
| `FRONTEND_ORIGIN` | Backend | Allowed CORS origin |
| `VITE_API_PROXY_TARGET` | Frontend | Vite dev proxy target |
| `CLOUDINARY_CLOUD_NAME` | Backend | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Backend | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Backend | Cloudinary API secret |
| `WHATSAPP_PROVIDER` | Backend | WhatsApp provider mode |
| `WHATSAPP_API_URL` | Backend | WhatsApp API URL |
| `WHATSAPP_TOKEN` | Backend | WhatsApp token |
| `WHATSAPP_INSTANCE_ID` | Backend | WhatsApp instance identifier |
| `GOOGLE_SHEETS_CREDENTIALS` | Backend | Google service account JSON or encoded credentials |
| `GOOGLE_SHEETS_WEBHOOK_URL` | Backend | Optional Google Sheets webhook endpoint |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | Backend | Spreadsheet target for exports |

## ▶️ Running the Application

### Run locally without Docker

#### Backend

```powershell
$env:DATABASE_URL="Host=localhost;Port=5432;Database=asbrandstore;Username=postgres;Password=postgres"
$env:JWT_SECRET="YourSuperSecretKey_AtLeast32CharactersLong!"
$env:ADMIN_BOOTSTRAP_EMAIL="admin@example.com"
$env:ADMIN_BOOTSTRAP_PASSWORD="ChangeThisImmediately123!"
dotnet run --project .\backend\ASBrandStore.Api\ASBrandStore.Api.csproj
```

#### Frontend

```powershell
cd .\Frontend
npm run dev
```

### Run with Docker

```powershell
docker compose up --build
```

### Access Points

| Target | URL |
| --- | --- |
| Frontend | `http://localhost` |
| Frontend (Vite dev) | `http://localhost:5173` |
| Backend | `http://localhost:5000` or local `dotnet run` URL |
| Health | `http://localhost:5000/api/health` |
| Swagger (development only) | `http://localhost:<backend-port>/swagger` |

### Windows Launcher

The `launcher/` project contains a WPF desktop utility that can start the backend and frontend processes locally on Windows.

## 👤 Demo Credentials

Bootstrap admin credentials are environment-driven. If you use `.env.example` unchanged for local development, the seeded administrator account will use:

| Field | Value |
| --- | --- |
| Email | `admin@example.com` |
| Password | `ChangeThisImmediately123!` |

Change these values before using the project outside a disposable local environment.

## 🖼️ Screenshots

Screenshots are not currently included in the repository.

- Storefront screenshot: not available yet
- Product details screenshot: not available yet
- Admin dashboard screenshot: not available yet

## 🚀 Future Improvements

The following would be natural next steps based on the current codebase:

- Add automated test scripts for backend and frontend workflows
- Add published screenshots or a short demo walkthrough
- Expand deployment documentation for each supported hosting target
- Add a formal license file

## 🤝 Contributing

Contributions are easier to review when they stay aligned with the current architecture:

1. Fork the repository.
2. Create a feature branch.
3. Keep API contracts and data shapes explicit.
4. Run the frontend and backend locally before opening a pull request.
5. Include any environment or migration impact in the pull request description.

## 👨‍💻 Author

Repository owner: [Shaker-Emad1](https://github.com/Shaker-Emad1)

## 📄 License

This repository does not currently include a license file.
