# A.S Brand Store

A.S Brand Store is a full-stack e-commerce project for an Arabic electronics and accessories storefront. The repository includes a .NET 10 backend API, a React + Vite storefront and administrator panel, Docker deployment assets, and a small Windows launcher for local startup convenience.

## Features

- Public storefront with home, categories, products, cart, checkout, and success flows
- Administrator login and dashboard for products, categories, banners, orders, and settings
- JWT-based authentication with server-side admin route protection
- PostgreSQL persistence with Entity Framework Core migrations and seed data
- Optional integrations for Cloudinary image hosting, WhatsApp notifications, and Google Sheets export
- Dockerized backend and frontend with Nginx reverse proxy configuration

## Tech Stack

- Backend: ASP.NET Core 10, Entity Framework Core 10, PostgreSQL (Npgsql), JWT Bearer auth, BCrypt
- Frontend: React 18, Vite 6, React Router 7, Axios, Tailwind CSS 4, Lucide
- Deployment: Docker, Docker Compose, Nginx, split free-hosting friendly frontend/backend deployment
- Optional integrations: Cloudinary, WhatsApp API provider, Google Sheets

## Project Structure

```text
backend/
  ASBrandStore.Api/              API, controllers, migrations, startup
  ASBrandStore.Application/      DTOs, interfaces, business services
  ASBrandStore.Domain/           Domain entities
  ASBrandStore.Infrastructure/   EF Core, JWT, integrations, seeding
Frontend/
  src/                           React app source
  nginx.conf                     Nginx SPA + API proxy config
docker-compose.yml               Local/production container orchestration
.env.example                     Deployment environment template
```

## Installation Guide

### Prerequisites

- .NET SDK 10.0.x
- Node.js 20+ and npm
- PostgreSQL 17 for local backend development
- Docker Desktop (optional, for containerized setup)

### Backend setup

1. Open `backend/`.
2. Provide a PostgreSQL connection string (via `DATABASE_URL`) and JWT secret through environment variables or configuration.
3. Build the API:

```powershell
dotnet build ASBrandStore.Api/ASBrandStore.Api.csproj -c Release
```

4. Run the API:

```powershell
$env:JWT_SECRET="YourSuperSecretKey_AtLeast32CharactersLong!"
dotnet run --project ASBrandStore.Api/ASBrandStore.Api.csproj
```

The API seeds settings, banners, categories, products, and an admin user only when admin bootstrap credentials are configured.

### Frontend setup

1. Open `Frontend/`.
2. Install dependencies:

```powershell
npm install
```

3. Start the development server:

```powershell
npm run dev
```

By default, Vite proxies `/api` requests to `http://localhost:5262`.

## Environment Variables

### Required

- `DATABASE_URL`: PostgreSQL connection string (supports standard `Host=...` format or `postgres://` / `postgresql://` URI formats)
- `JWT_SECRET`: JWT signing key for the backend
- `ADMIN_BOOTSTRAP_EMAIL`: email used to seed the first administrator account
- `ADMIN_BOOTSTRAP_PASSWORD`: password used to seed the first administrator account

### Local backend / Docker / deployment

- `DB_PASSWORD`: PostgreSQL `postgres` superuser password
- `DOMAIN`: public domain used in CORS and deployment docs

### Optional integrations

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `GOOGLE_SHEETS_CREDENTIALS`
- `GOOGLE_SHEETS_WEBHOOK_URL`
- `GOOGLE_SHEETS_SPREADSHEET_ID`

Use `.env.example` as the starting point for deployment configuration.

## Running Locally

### Backend

- Default health endpoint: `GET /api/health`
- Swagger is enabled only in development at `/swagger`

### Frontend

- Default dev URL: `http://localhost:5173`
- Production build command:

```powershell
npm run build
```

## Docker Setup

1. Copy `.env.example` to `.env` and fill in all required values.
2. Build and start services:

```powershell
docker compose up --build
```

Services:

- `asbrandstore-db`: PostgreSQL 17 Alpine database on port `5432`
- `backend`: ASP.NET Core API on port `5000`
- `frontend`: Nginx serving the built frontend on port `80`

## Cloud Deployment Guide (Free Tier)

This project is fully optimized for free tier hosting compatibility across Vercel, Render, and Neon.

### 1. Database Setup (Neon PostgreSQL)

1. Sign up on [Neon.tech](https://neon.tech) and create a new project.
2. Under **Connection Details**, select **Transaction pooler** or **Direct connection**.
3. Copy the connection string. It will look like:
   `postgresql://alex:password@ep-xxxx.neon.tech/neondb?sslmode=require`
4. This connection string is fully compatible with our backend and will be resolved as `DATABASE_URL`.

### 2. Backend Setup (Render Web Service)

1. Sign up on [Render.com](https://render.com) and create a **Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Environment**: Docker
   - **Docker Context**: `./backend`
   - **Dockerfile Path**: `./backend/Dockerfile`
4. Under **Environment Variables**, add:
   - `DATABASE_URL`: Neon PostgreSQL connection string (mapped via Transaction Pooler)
   - `JWT_SECRET`: A secure 32+ character random string
   - `ADMIN_BOOTSTRAP_EMAIL`: Your admin email
   - `ADMIN_BOOTSTRAP_PASSWORD`: Your secure admin password
   - `DOMAIN`: Your frontend domain (e.g. `your-app.vercel.app`)
5. Render will automatically build the Docker container, run migrations, seed initial data, and serve the API.

### 3. Frontend Setup (Vercel Static Site)

1. Sign up on [Vercel.com](https://vercel.com) and import your repository.
2. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `Frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Under **Environment Variables**, add:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://asbrandstore-api.onrender.com/api`)
4. Deploy the project. Vercel will build the React SPA and serve it over HTTPS.

## Administrator Login

The repository does not ship with a hardcoded admin password.

On a fresh database, the first administrator account is created only when these environment variables are provided before startup:

- `ADMIN_BOOTSTRAP_EMAIL`
- `ADMIN_BOOTSTRAP_PASSWORD`

After the first successful login, rotate the password immediately.
