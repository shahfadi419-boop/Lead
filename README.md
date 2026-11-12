# LeadHive AI Platform

A Vite and React marketing site with an interactive AI Experience Centre and a demo-request flow.

## Project layout

```
public/                  Static production assets
src/
  components/
    common/              Shared navigation, footer, and channel icons
    home/                Homepage sections
    experience/          Interactive experience and telemetry UI
    demo/                Demo-request page
  data/                  Scenario content and configuration
  services/              Client-side services, including analytics
  App.jsx                Route selection and shared application shell
  main.jsx               React entry point
```

## Commands

```bash
npm run dev
npm run build
npm run preview
```

## Vercel backend configuration

Production dashboard requests use the same-origin Vercel function at `/api/*`, which
proxies requests to the configured backends. In Vercel, add these environment variables
for each deployment environment and redeploy after changing them:

| Variable | Backend |
| --- | --- |
| `FACEBOOK_API_URL` | Facebook/Visa backend base URL |
| `WHATSAPP_API_URL` | WhatsApp backend base URL |
| `REAL_ESTATE_API_URL` | Real Estate backend base URL |
| `YOUTUBE_API_URL` | YouTube backend base URL |

Use the backend origin only (for example, `https://backend.example.com`), not an
endpoint path such as `/stats`. Keep these values server-side; do not use `VITE_`
prefixes. Local development continues to use the proxies configured in `vite.config.js`.

Production image assets belong in `public/`. Generated visual QA screenshots are ignored at the repository root.
