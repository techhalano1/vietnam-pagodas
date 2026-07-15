# Chùa Việt Nam — Vietnam Pagoda & Temple Dictionary

A production-ready online dictionary of pagodas and temples across Vietnam, with an
interactive map, per-province directory, detail pages with history and images.

## Features

- Interactive Leaflet map of all pagodas/temples with popups and detail links
- Full-text search (diacritics-insensitive) and province filtering
- Directory of all provinces with per-province listings (`/danh-muc`)
- Detail pages (`/chua/[slug]`) with images, history, location map, Google Maps
  directions, and related pagodas — all statically generated (SSG) for fast loads and SEO
- Data pipeline that aggregates pagodas from Vietnamese Wikipedia per-province categories

## Stack

Next.js 14 (App Router, TypeScript), Tailwind CSS, React Leaflet / OpenStreetMap.

## Development

```bash
npm install
npm run dev
```

## Data pipeline

The dataset lives in `src/data/pagodas.json`. To refresh it:

```bash
node scripts/fetch-data.mjs        # fetches from Wikipedia -> pagodas-raw.json
node scripts/build-dataset.mjs pagodas-raw.json  # writes src/data/pagodas.json
```

Data source: Vietnamese Wikipedia (CC BY-SA); images from Wikimedia Commons.

## Deployment

Standard Next.js app — deploy to Vercel/Netlify or any Node host:

```bash
npm run build && npm start
```
