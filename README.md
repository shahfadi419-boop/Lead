# LeadHive AI Platform

A Vite + React marketing site with live lead dashboards for Visa, Real Estate, and YouTube channels, an interactive AI Experience Centre, and a demo-request flow.

## Project layout

```
public/                  Static production assets
src/
  components/
    common/              Shared navigation, footer, and channel icons
    home/                Homepage sections
    experience/          Interactive experience and telemetry UI
    demo/                Demo-request page
  dashboards/
    api.js               All backend fetch functions (visa, real-estate, youtube)
    SharedChannelDashboard.jsx   Facebook + WhatsApp lead dashboard with SSE live updates
    YouTubeDashboard.jsx         YouTube comment analytics dashboard
  data/                  Scenario content and configuration
  services/              Client-side services, including analytics
  App.jsx                Route selection and shared application shell
  main.jsx               React entry point
```

## Backends

| Dashboard | Backend | Local port |
|---|---|---|
| Visa (Facebook + WhatsApp) | ai-lead-generator | 8000 |
| Real Estate | real-estate-ragbase-ai-agent | 8010 |
| YouTube | YouTube FastAPI | devtunnel |

All three are connected via Vite dev proxy in `vite.config.js` (targets read from `.env.local`).

## Dashboard routes

| URL | Shows |
|---|---|
| `/dashboard?platform=facebook` | Facebook dashboard — Visa tab + Real Estate tab |
| `/dashboard?platform=whatsapp` | WhatsApp Visa dashboard |
| `/dashboard?platform=youtube` | YouTube comment analytics |

## Live updates (SSE)

Each dashboard maintains a persistent SSE connection to its backend:

- **Visa / WhatsApp** → `GET /visa-api/dashboard/stream?platform=facebook|whatsapp`
- **Real Estate** → `GET /real-estate-api/estate/dashboard/stream`

Data updates automatically whenever a new message or lead comes in — no refresh needed.

## Install and run

```bash
npm install
npm run dev        # http://localhost:5180
```

## Environment variables

Create `.env.local` in the project root (never commit this file):

```env
# Backend URLs (used by vite.config.js proxy in dev)
VITE_VISA_API_URL=http://localhost:8000
VITE_FACEBOOK_API_URL=http://localhost:8000
VITE_WHATSAPP_API_URL=http://localhost:8000
VITE_REAL_ESTATE_API_URL=http://localhost:8010

# WhatsApp Business number — digits only or with country code, spaces/+ stripped automatically
VITE_WHATSAPP_NUMBER=923001234567
```

In production (Vercel), set the backend base URLs for the serverless proxies:

| Variable | Purpose |
|---|---|
| `FACEBOOK_API_URL` (or `VITE_FACEBOOK_API_URL`) | Facebook and Visa backend base URL |
| `WHATSAPP_API_URL` (or `VITE_WHATSAPP_API_URL`) | WhatsApp backend base URL |
| `REAL_ESTATE_API_URL` (or `VITE_REAL_ESTATE_API_URL`) | Real Estate backend base URL |
| `YOUTUBE_API_URL` (or `VITE_YOUTUBE_API_URL`) | YouTube backend base URL |
| `VITE_WHATSAPP_NUMBER` | WhatsApp Business number for the experience link |

## Build and deploy

```bash
npm run build      # outputs to dist/
npm run preview    # preview production build locally
```

The Vercel rewrite in `vercel.json` serves the SPA entry point for client-side routes
such as `/dashboard` when a page is refreshed, while leaving `/api/*` requests for
the serverless backend proxy.

Production image assets belong in `public/`. Generated visual QA screenshots are ignored at the repository root.
