# Deployment Guide

## Recommended Production Layout

1. Frontend on Vercel
2. Backend on Render
3. Database on Neon PostgreSQL

This repository is configured for that split deployment model.

## Backend on Render

- Runtime: Docker
- Root directory: `backend`
- Dockerfile: `backend/Dockerfile`
- Health check: `/api/health`

Required environment variables:

```text
DATABASE_URL=postgres://...
JWT_SECRET=...
ADMIN_BOOTSTRAP_EMAIL=...
ADMIN_BOOTSTRAP_PASSWORD=...
FRONTEND_ORIGIN=https://your-store.vercel.app
```

Optional environment variables:

```text
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
WHATSAPP_PROVIDER=
WHATSAPP_API_URL=
WHATSAPP_TOKEN=
WHATSAPP_INSTANCE_ID=
GOOGLE_SHEETS_CREDENTIALS=
GOOGLE_SHEETS_WEBHOOK_URL=
GOOGLE_SHEETS_SPREADSHEET_ID=
```

Notes:

- `DATABASE_URL` supports both standard Npgsql connection strings and Neon/Render-style `postgres://` URIs.
- `PORT` is honored automatically by ASP.NET Core.
- Database migrations run on startup.

## Frontend on Vercel

- Root directory: `Frontend`
- Build command: `npm run build`
- Output directory: `dist`

Required environment variable:

```text
VITE_API_URL=https://your-render-backend.onrender.com/api
```

The included [vercel.json](/C:/Users/anake/Desktop/ecoomerce/vercel.json) rewrites all routes to `index.html` for SPA navigation.

## Local Docker Validation

```powershell
docker compose config
docker compose up --build
```

## Pre-Deploy Checklist

1. Confirm `.env` is not committed.
2. Confirm no credential JSON file is committed.
3. Confirm Cloudinary credentials are set in the target platform.
4. Confirm `FRONTEND_ORIGIN` matches the deployed frontend URL.
5. Confirm `VITE_API_URL` points to the deployed backend API base path.
