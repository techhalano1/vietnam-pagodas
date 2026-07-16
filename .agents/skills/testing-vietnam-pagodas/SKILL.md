---
name: testing-vietnam-pagodas
description: Build, run, and end-to-end test the Vietnam Pagodas Next.js site (map, search, bilingual VI/EN detail pages). Use when verifying UI or data changes before merging.
---

# Testing the Vietnam Pagodas site

## Build & serve
- `npm install && npm run lint && npm run build && npm start` (serves at http://localhost:3000).
- Before rebuilding after route restructures, `rm -rf .next` — stale generated types in `.next/types` can make `tsc --noEmit` report missing modules for deleted routes.
- If pages look stale after a rebuild, check for an old `next-server` process (`ps aux | grep next-server`) and kill it before `npm start`.

## Key routes to smoke-test
- `/vi` and `/en` home: hero text localized, map markers render, diacritics-insensitive search (e.g. "thien mu" → Chùa Thiên Mụ).
- `/{locale}/chua/{slug}`: structured article sections, image, mini-map, Google Maps link, references section (VI Wikipedia + EN Wikipedia where available + external URLs), related-pagoda cards.
- EN fallback: pick a slug with no English article (e.g. `bo-de-dao-trang-chau-doc`) and verify the amber "A full English article is not available..." notice above Vietnamese sections. Only ~49/307 records have English content — check `src/data/details.json` (`sectionsEn`) to choose test slugs.
- Language switcher (EN/VI pill in header) must preserve the current path.
- Old-URL redirects: `/` → `/vi`, `/chua/:slug`, `/danh-muc`, `/gioi-thieu` → `/vi/...` (defined in `next.config.mjs`).

## Data pipeline (only when refreshing data)
`node scripts/fetch-data.mjs && node scripts/enrich-coords.mjs && node scripts/geocode.mjs && node scripts/build-dataset.mjs pagodas-raw.json && node scripts/fetch-details.mjs pagodas-raw.json details-raw.json && node scripts/build-details.mjs details-raw.json`
- Wikipedia APIs may rate-limit (HTTP 429); the scripts retry with backoff but the full details fetch takes a long time — run it in the background and only run `build-details.mjs` after it prints `Done`.
- Do not hand-edit generated JSON in `src/data/`; regenerate via scripts.

## Browser-testing pitfalls
- Chrome's address bar may autocomplete typed localhost URLs to a previously visited page; if navigation doesn't take effect, select-all in the address bar and retype, or navigate via in-app links instead.
- Known data caveats (not bugs in UI code): ~26 records lack coordinates, ~121 lack photos, and a few Nominatim-geocoded markers can sit outside their province.

## Devin Secrets Needed
None — the site and its data pipeline use only public APIs.
