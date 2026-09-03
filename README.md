# Chùa Việt Nam — Vietnam Pagoda & Temple Dictionary

A production-ready online dictionary of pagodas and temples across Vietnam, with an
interactive map, per-province directory, detail pages with history and images.

## Features

- Bilingual site: Vietnamese (`/vi`) and English (`/en`) with a language switcher
- Interactive Leaflet map of all pagodas/temples with popups and detail links
- Full-text search (diacritics-insensitive) and province filtering
- Directory of all provinces with per-province listings (`/{locale}/danh-muc`)
- Detail pages (`/{locale}/chua/[slug]`) with images, full in-depth article content
  (history, architecture, and more as structured sections), location map, Google Maps
  directions, references list, and related pagodas — all statically generated (SSG)
- Data pipeline that aggregates pagodas from Vietnamese & English Wikipedia, Wikidata,
  and OpenStreetMap, including each article's cited external references

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
node scripts/enrich-coords.mjs     # Wikidata coords/images -> pagodas-raw.json
node scripts/geocode.mjs           # Nominatim geocoding for missing coords
node scripts/build-dataset.mjs pagodas-raw.json  # writes src/data/pagodas.json
node scripts/fetch-details.mjs pagodas-raw.json details-raw.json  # full vi+en articles & refs
node scripts/build-details.mjs details-raw.json  # writes src/data/details.json
```

Data sources: Vietnamese & English Wikipedia (CC BY-SA), Wikidata, OpenStreetMap;
images from Wikimedia Commons.

## Deployment

Standard Next.js app — deploy to Vercel/Netlify or any Node host:

```bash
npm run build && npm start
```
