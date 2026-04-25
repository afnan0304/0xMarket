# 0xMarket

0xMarket is a monorepo marketplace app with a React frontend and an Express API.

## Stack

- Frontend: React, Vite, Tailwind, Zustand
- Backend: Node.js, Express, Mongoose
- Database: MongoDB

## Monorepo Layout

```text
.
├── client/
└── server/
```

## Quick Start

1. Install dependencies:

```bash
npm install
npm --prefix client install
npm --prefix server install
```

2. Run backend:

```bash
npm run dev:server
```

3. Run frontend:

```bash
npm run dev:client
```

## Environment

- Frontend template: `client/.env.example`
- Backend template: `server/.env.example`

Important server variables:

- `MONGO_URI`
- `CLIENT_ORIGIN`
- `EMAIL_PROVIDER`, provider API key
- `GEMINI_API_KEY`

## API Highlights

- `GET /api/health`
- `GET /api/assets`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/orders/checkout`
- `POST /api/gemini`

## Local Smoke Test

```bash
cd server
npm run smoke:auth
```

Optional base URL:

```bash
SMOKE_BASE_URL=http://localhost:5000 npm run smoke:auth
```

## Deploy (Vercel, Single Project)

This repo is configured for one Vercel project using the root `vercel.json`.

- Framework preset: `Other`
- Root directory: `./`
- Add `MONGO_URI` and `GEMINI_API_KEY` in Vercel

Routing:

- `/api/*` -> `server/server.js`
- other routes -> `client/$1`

Client API calls should stay relative, for example `fetch('/api/gemini')`.

Recommended production env values:

- `NODE_ENV=production`
- `CLIENT_ORIGIN=https://your-domain.com`
- `APP_BASE_URL=https://your-domain.com`
- backend secrets from `server/.env.example`

## Repository

- Owner: afnan0304
- Name: 0xMarket
- Branch: main
