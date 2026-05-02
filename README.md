# Better VPing

Premium athletics staff directory intelligence dashboard.

## Apps

- `apps/web`: standalone React + TypeScript + Vite frontend for Vercel.
- `apps/api`: standalone Hono + TypeScript backend for Render.

Install and run each app independently.

## Local setup

```bash
cd apps/api
npm install
cp .env.example .env

cd ../web
npm install
cp .env.example .env
```

## Environment

Frontend (`apps/web/.env`):

```bash
VITE_API_BASE_URL=http://localhost:8787
```

Backend (`apps/api/.env` or Render env vars):

```bash
PORT=8787
```

CORS is handled by Hono and currently allows `http://localhost:5173`.

## Development

Run API:

```bash
cd apps/api
npm run dev
```

Run web in another terminal:

```bash
cd apps/web
npm run dev
```

Health check and catalog:

```bash
curl http://localhost:8787/api/health
curl http://localhost:8787/api/schools
curl http://localhost:8787/api/schools/georgia/diff
```

## Build

```bash
cd apps/api
npm run build

cd ../web
npm run build
```

## Deploy

### Vercel frontend

- Root directory: `apps/web`
- Build command: `npm run build`
- Output directory: `dist`
- Env: `VITE_API_BASE_URL=https://your-render-service.onrender.com`

### Render backend

- Root directory / build context: `apps/api`
- Dockerfile path: `Dockerfile`

Set env vars:

```bash
PORT=10000
```
