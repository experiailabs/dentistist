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

## Project collection

The homepage (`/`) displays the project gallery. Bookable Clinic is the first demo at `/bookable-clinic`. Two coming-soon cards reserve space for future projects. Bookable Clinic lives in `src/projects/bookable-clinic`. Add future project components under `src/projects` and register them in `src/projects/index.ts`; the homepage and routes both use this shared list.
