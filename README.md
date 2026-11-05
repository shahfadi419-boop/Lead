# LeadHive AI Web

React frontend for the LeadHive marketing site, YouTube workflow, and interactive demo.

## Requirements

- Node.js compatible with the installed Vite version
- npm
- A backend URL configured as `BACKEND_URL` in the project `.env` file
- A Facebook backend URL configured as `FACEBOOK_BACKEND_URL` in the project `.env` file

The development server proxies YouTube API requests to `BACKEND_URL` and Facebook
dashboard requests to `FACEBOOK_BACKEND_URL`. For Vercel deployments, configure
both backend URLs as project environment variables; Facebook requests are proxied
through the serverless function in `api/facebook/`.
The optional `VITE_RECAPTCHA_SITE_KEY` environment variable configures the contact form.

## Commands

```sh
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

## Main routes

- `/` and `/contact` - marketing pages
- `/flow` - YouTube channel, persona, video, comments, replies, and analytics flow
- `/interactive-demo-2` - interactive YouTube demo
- `/privacy` and `/terms` - legal pages

The app is built with React, React Router, Vite, Tailwind CSS, Lucide icons, and
Motion. The YouTube feature's API helpers are in `src/features/youtube/api.js`;
shared request and polling behavior lives alongside the feature code.
