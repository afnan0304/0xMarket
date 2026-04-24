# 0xMarket Client

Frontend application for 0xMarket.

## Stack

- React 19
- Vite 8
- Tailwind CSS
- Zustand

## Requirements

- Node.js 18+
- npm

## Setup

```bash
cd client
npm install
```

## Environment

Create `client/.env` (or copy from `.env.example`):

```env
VITE_API_BASE_URL=
VITE_ASSETS_ENDPOINT=
```

Variable behavior:

| Variable | Description |
| --- | --- |
| `VITE_API_BASE_URL` | Base URL used for `/api/health` and `/api/gemini` requests. Leave empty in local development to use the Vite proxy. |
| `VITE_ASSETS_ENDPOINT` | Assets request path. Defaults to `/api/assets` for same-origin deployments. |

The server also requires `GEMINI_API_KEY` in `server/.env` to answer `POST /api/gemini`.

## Development

```bash
npm run dev
```

Default local URL: http://localhost:5173

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build production assets
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## API Integration

State and API calls are implemented in `src/store/useMarketStore.js`:

- `fetchAssets()` -> assets endpoint
- `fetchHealth()` -> `GET /api/health`
- `sendGeminiPrompt()` -> `POST /api/gemini`, stores the dealer reply text from `reply`
- `initializeCsrf()` -> `GET /api/auth/csrf` on app startup
- Auth lifecycle endpoints use `/api/auth/*` (`register`, `login`, `verify-email`, `request-verification`, `request-password-reset`, `reset-password`, `me`, `logout`)

For protected mutations, the client reads `market_csrf` and sends `x-csrf-token` automatically.

## Deployment Notes

- For a single-domain Vercel deploy, keep `VITE_API_BASE_URL` empty and use `VITE_ASSETS_ENDPOINT=/api/assets`.
- Ensure backend `CLIENT_ORIGIN` includes your frontend domain.
