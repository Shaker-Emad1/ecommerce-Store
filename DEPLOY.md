# A.S Brand Store Free Hosting Guide

This project is prepared for manual publication and deployment on free hosting services.

Important constraints:

- The frontend can be deployed to Vercel (Free Static Hosting).
- The backend can be deployed to Render (Free Web Service Hosting).
- The database can be hosted on Neon (Free Serverless PostgreSQL).

## Recommended Hosting Shape

Use a split deployment:

1. Frontend on Vercel
2. Backend on Render using the existing Dockerfile
3. Database on Neon PostgreSQL

This keeps the frontend cheap and fast, avoids self-managed SSL, and supports auto-scaling / sleeping database connections on the free tier.

## Good Fit for Free Hosting

Frontend:
- Vercel Static Site
- Render Static Site

Backend:
- Render Web Service using the backend Dockerfile

Database:
- Neon PostgreSQL Serverless DB

## Why This Layout

- Vercel handles HTTPS, globally distributed CDN, and routing.
- Render runs the ASP.NET Core backend from the Dockerfile and scales down to zero when idle.
- Neon provides a serverless PostgreSQL instance with connection pooling, transaction pooler endpoints, and a generous free tier.

## Frontend Deployment

The frontend supports an external backend URL through `VITE_API_URL`.

Build-time environment variable:

```text
VITE_API_URL=https://your-backend-host.onrender.com/api
```

Build command:

```bash
npm install
npm run build
```

Publish directory:

```text
dist
```

## Backend Deployment

The backend Dockerfile lives at:

```text
backend/Dockerfile
```

Required environment variables:

```text
DATABASE_URL=postgres://...
JWT_SECRET=...
ADMIN_BOOTSTRAP_EMAIL=...
ADMIN_BOOTSTRAP_PASSWORD=...
DOMAIN=your-frontend-vercel-domain.vercel.app
```

Optional environment variables:

```text
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GOOGLE_SHEETS_CREDENTIALS=
GOOGLE_SHEETS_WEBHOOK_URL=
GOOGLE_SHEETS_SPREADSHEET_ID=
```

The backend exposes:

```text
/api/health
```

Use that endpoint for post-deploy health verification.

## PostgreSQL Database (Neon)

The application uses Entity Framework Core with PostgreSQL.

That means:
- Neon.tech is a perfect fit.
- Use the connection string provided in your Neon Console.
- Ensure SSL Mode is set to `Require` or `Prefer`. Our parser converts `postgres://` or `postgresql://` URIs automatically, enabling `SSL Mode=Require` and `Trust Server Certificate=true` for production database security.
- Migrations will apply automatically on startup.

## Local Docker

`docker-compose.yml` can be used for local verification:

```bash
docker compose up --build
```

## Manual Publish Checklist

Before uploading this repository:

1. Confirm `.env` is not present (ignored via `.gitignore`)
2. Confirm `google-credentials.json` is not present
3. Confirm no `bin`, `obj`, `node_modules`, `dist`, or test-result folders are present
4. Confirm `README.md` and `.gitignore` are present
5. Confirm backend and frontend builds have passed locally
6. Confirm deployment secrets will be entered only in the hosting dashboard
