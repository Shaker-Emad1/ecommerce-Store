# A.S Brand Store

A.S Brand Store is a full-stack Arabic e-commerce project with an ASP.NET Core API, a React + Vite storefront/admin frontend, PostgreSQL persistence, and production Docker deployment assets.

## Stack

- Backend: ASP.NET Core 10, Entity Framework Core 10, PostgreSQL, JWT Bearer
- Frontend: React 18, Vite 6, React Router 7, Axios, Tailwind CSS 4
- Deployment: Docker, Docker Compose, Nginx, Render, Vercel, Neon
- Integrations: Cloudinary, optional WhatsApp, optional Google Sheets

## Local Development

### Backend

```powershell
$env:DATABASE_URL="Host=localhost;Port=5432;Database=asbrandstore;Username=postgres;Password=postgres"
$env:JWT_SECRET="YourSuperSecretKey_AtLeast32CharactersLong!"
$env:ADMIN_BOOTSTRAP_EMAIL="admin@example.com"
$env:ADMIN_BOOTSTRAP_PASSWORD="ChangeThisImmediately123!"
dotnet run --project backend/ASBrandStore.Api/ASBrandStore.Api.csproj
```

### Frontend

```powershell
cd Frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` to `VITE_API_PROXY_TARGET`, which defaults to `http://localhost:5262`.

## Required Environment Variables

- `DATABASE_URL`: PostgreSQL connection string in either Npgsql format or `postgres://` / `postgresql://` URI format
- `JWT_SECRET`: JWT signing key
- `ADMIN_BOOTSTRAP_EMAIL`: initial administrator email
- `ADMIN_BOOTSTRAP_PASSWORD`: initial administrator password

## Optional Environment Variables

- `FRONTEND_ORIGIN`: allowed frontend origin for backend CORS, for example `https://your-store.vercel.app`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `WHATSAPP_PROVIDER`
- `WHATSAPP_API_URL`
- `WHATSAPP_TOKEN`
- `WHATSAPP_INSTANCE_ID`
- `GOOGLE_SHEETS_CREDENTIALS`: Google service-account JSON or base64-encoded JSON
- `GOOGLE_SHEETS_WEBHOOK_URL`
- `GOOGLE_SHEETS_SPREADSHEET_ID`

Use [.env.example](/C:/Users/anake/Desktop/ecoomerce/.env.example) as the starting point for local Docker configuration.

## Docker

1. Copy `.env.example` to `.env`.
2. Fill in the required values.
3. Start the stack:

```powershell
docker compose up --build
```

Services:

- Frontend: `http://localhost`
- Backend health: `http://localhost:5000/api/health`
- PostgreSQL: `127.0.0.1:5432`

## Render + Vercel + Neon

### Neon

- Create a PostgreSQL database on Neon.
- Copy its connection string into `DATABASE_URL`.

### Render

- Deploy the backend from `backend/Dockerfile`.
- Render sets `PORT`; the API now binds to it automatically.
- A starter [render.yaml](/C:/Users/anake/Desktop/ecoomerce/render.yaml) is included.

### Vercel

- Deploy the frontend from the `Frontend` directory.
- Set `VITE_API_URL=https://your-render-service.onrender.com/api`.
- A minimal SPA [vercel.json](/C:/Users/anake/Desktop/ecoomerce/vercel.json) is included.

## Security Notes

- No production secrets should be committed to the repository.
- `.env`, Google credential files, and key material are gitignored.
- Cloudinary is the only supported image-storage provider in production.
