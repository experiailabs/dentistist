# Bookable Clinic

A frontend-only React + Vite clinic dashboard. All patient data is sample data; recovery scans, AI matching, and message delivery are simulated in the browser. Changes reset on reload. No backend, database, API keys, or environment variables are required.

## Run locally

```sh
npm ci
npm run dev
```

## Verify

```sh
npm run check
npm run build
npm run preview
```

## Deploy to Vercel

Import this folder into Vercel, using `bookable-clinic` as the Root Directory if importing the parent repository. The included `vercel.json` configures the Vite build, `dist` output, and SPA fallback.

Or, with Vercel CLI installed and authenticated:

```sh
cd bookable-clinic
vercel --prod
```
