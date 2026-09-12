// Fetch pagodas/temples across Vietnam from OpenStreetMap (Overpass API),
// down to district/commune level. Writes raw results to osm-sites-raw.json.
import fs from "node:fs";

const QUERY = `
[out:json][timeout:300];
area["ISO3166-1"="VN"][admin_level=2]->.vn;
(
  nwr["amenity"="place_of_worship"]["name"](area.vn);
);
out center tags;
`;

const res = await fetch("https://overpass-api.de/api/interpreter", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "VietnamPagodasBot/1.0 (data enrichment)",
  },
  body: "data=" + encodeURIComponent(QUERY),
});
if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);
const data = await res.json();
console.log("elements:", data.elements.length);
fs.writeFileSync("osm-sites-raw.json", JSON.stringify(data.elements));
