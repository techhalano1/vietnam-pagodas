"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import type { Pagoda } from "@/lib/types";
import { getDict, type Locale } from "@/lib/i18n";

type LocatedPagoda = Pagoda & { lat: number; lng: number };

function pagodaIcon(animate: boolean, bounce: boolean) {
  const cls = bounce ? "marker-bounce" : animate ? "marker-drop" : "";
  return L.divIcon({
    className: "",
    html: `<div class="${cls}" style="font-size:22px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))">🏯</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 22],
    popupAnchor: [0, -20],
  });
}

function popupHtml(p: LocatedPagoda, locale: Locale, viewDetail: string) {
  const img = p.thumbnail
    ? `<img src="${p.thumbnail}" alt="" style="width:100%;height:112px;object-fit:cover;border-radius:6px;margin-bottom:8px" />`
    : "";
  return `<div style="min-width:180px;max-width:240px">${img}<div style="font-weight:600">${p.name}</div><div style="font-size:12px;opacity:.7">${p.province}</div><a href="/${locale}/chua/${p.slug}" style="display:inline-block;margin-top:4px;font-size:14px;font-weight:500;color:#b45309">${viewDetail}</a></div>`;
}

function ClusteredMarkers({
  pagodas,
  hoveredId,
  focusId,
  locale,
}: {
  pagodas: Pagoda[];
  hoveredId: string | null;
  focusId: string | null;
  locale: Locale;
}) {
  const map = useMap();
  const t = getDict(locale);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersRef = useRef(new Map<string, L.Marker>());
  const firstRender = useRef(true);

  useEffect(() => {
    const cluster = L.markerClusterGroup({
      maxClusterRadius: 45,
      showCoverageOnHover: false,
      iconCreateFunction: (c) =>
        L.divIcon({
          className: "",
          html: `<div class="pagoda-cluster" style="width:34px;height:34px">${c.getChildCount()}</div>`,
          iconSize: [34, 34],
        }),
    });
    map.addLayer(cluster);
    clusterRef.current = cluster;
    return () => {
      map.removeLayer(cluster);
      clusterRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster) return;
    const animate = !firstRender.current;
    firstRender.current = false;
    cluster.clearLayers();
    markersRef.current.clear();
    const located = pagodas.filter(
      (p): p is LocatedPagoda => p.lat !== null && p.lng !== null,
    );
    for (const p of located) {
      const marker = L.marker([p.lat, p.lng], { icon: pagodaIcon(animate, false) });
      marker.bindPopup(popupHtml(p, locale, t.viewDetail));
      markersRef.current.set(String(p.id), marker);
      cluster.addLayer(marker);
    }
  }, [pagodas, locale, t.viewDetail]);

  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      marker.setIcon(pagodaIcon(false, id === hoveredId));
    });
  }, [hoveredId]);

  useEffect(() => {
    if (!focusId) return;
    const cluster = clusterRef.current;
    const marker = markersRef.current.get(focusId);
    if (!cluster || !marker) return;
    map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 13), { duration: 1.2 });
    cluster.zoomToShowLayer(marker, () => marker.openPopup());
  }, [focusId, map]);

  return null;
}

export default function PagodaMap({
  pagodas,
  center = [16.2, 107.5],
  zoom = 6,
  height = "100%",
  locale = "vi",
  hoveredId = null,
  focusId = null,
}: {
  pagodas: Pagoda[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  locale?: Locale;
  hoveredId?: string | null;
  focusId?: string | null;
}) {
  return (
    <div style={{ height }} className="h-full w-full">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClusteredMarkers
          pagodas={pagodas}
          hoveredId={hoveredId}
          focusId={focusId}
          locale={locale}
        />
      </MapContainer>
    </div>
  );
}
