"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import type { Pagoda } from "@/lib/types";
import { getDict, type Locale } from "@/lib/i18n";

const pagodaIcon = L.divIcon({
  className: "",
  html: `<div style="font-size:22px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))">🏯</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 22],
  popupAnchor: [0, -20],
});

export default function PagodaMap({
  pagodas,
  center = [16.2, 107.5],
  zoom = 6,
  height = "100%",
  locale = "vi",
}: {
  pagodas: Pagoda[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  locale?: Locale;
}) {
  const t = getDict(locale);
  return (
    <div style={{ height }} className="h-full w-full">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pagodas
          .filter((p): p is Pagoda & { lat: number; lng: number } => p.lat !== null && p.lng !== null)
          .map((p) => (
            <Marker key={p.id} position={[p.lat, p.lng]} icon={pagodaIcon}>
              <Popup>
                <div className="min-w-[180px] max-w-[240px]">
                  {p.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.thumbnail}
                      alt={p.name}
                      className="mb-2 h-28 w-full rounded object-cover"
                    />
                  )}
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-stone-500">{p.province}</div>
                  <Link
                    href={`/${locale}/chua/${p.slug}`}
                    className="mt-1 inline-block text-sm font-medium text-amber-700 hover:underline"
                  >
                    {t.viewDetail}
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
