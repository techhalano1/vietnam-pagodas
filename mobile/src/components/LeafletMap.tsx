import { useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { useSettings } from "@/lib/settings";

export interface MapPoint {
  slug: string;
  name: string;
  lat: number;
  lng: number;
}

interface Props {
  points: MapPoint[];
  onSelect?: (slug: string) => void;
  center?: { lat: number; lng: number; zoom: number };
  cluster?: boolean;
}

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const CLUSTER_CSS =
  "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css";
const CLUSTER_CSS_DEFAULT =
  "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css";
const CLUSTER_JS =
  "https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js";

function buildHtml(
  points: MapPoint[],
  dark: boolean,
  center: Props["center"],
  cluster: boolean,
  selectLabel: string | null,
) {
  const data = JSON.stringify(points).replace(/</g, "\\u003c");
  const c = center ?? { lat: 16.2, lng: 106.5, zoom: 5 };
  return `<!DOCTYPE html><html><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="stylesheet" href="${LEAFLET_CSS}" />
<link rel="stylesheet" href="${CLUSTER_CSS}" />
<link rel="stylesheet" href="${CLUSTER_CSS_DEFAULT}" />
<style>
  html, body, #map { margin: 0; height: 100%; width: 100%; background: ${dark ? "#14110B" : "#FFFDF7"}; }
  ${dark ? ".leaflet-tile { filter: brightness(0.7) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7); }" : ""}
  .leaflet-popup-content { margin: 10px 12px; font: 14px -apple-system, Roboto, sans-serif; }
  .leaflet-popup-content b { display: block; margin-bottom: 6px; }
  .leaflet-popup-content-wrapper { border-radius: 14px; }
  .leaflet-popup-content button { background: #B8860B; color: #fff; border: 0; padding: 7px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; }
  .marker-cluster-small { background-color: rgba(254, 243, 199, 0.8); }
  .marker-cluster-small div { background-color: rgba(212, 160, 23, 0.9); color: #fff; font-weight: 700; }
  .marker-cluster-medium { background-color: rgba(252, 211, 77, 0.7); }
  .marker-cluster-medium div { background-color: rgba(184, 134, 11, 0.92); color: #fff; font-weight: 700; }
  .marker-cluster-large { background-color: rgba(212, 160, 23, 0.6); }
  .marker-cluster-large div { background-color: rgba(139, 101, 8, 0.95); color: #fff; font-weight: 700; }
</style>
</head><body><div id="map"></div>
<script src="${LEAFLET_JS}"></script>
${cluster ? `<script src="${CLUSTER_JS}"></script>` : ""}
<script>
  var points = ${data};
  var map = L.map('map', { zoomControl: true, attributionControl: true, zoomSnap: 0.5 }).setView([${c.lat}, ${c.lng}], ${c.zoom});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  var icon = L.divIcon({
    className: '',
    html: '<div style="width:14px;height:14px;border-radius:50%;background:#B8860B;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4)"></div>',
    iconSize: [14, 14], iconAnchor: [7, 7], popupAnchor: [0, -8]
  });
  var layer = ${cluster ? "L.markerClusterGroup({ chunkedLoading: true, maxClusterRadius: 60, disableClusteringAtZoom: 14 })" : "L.layerGroup()"};
  function esc(s) { return String(s).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); }
  function select(slug) { window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'select', slug: slug })); }
  points.forEach(function (p) {
    var m = L.marker([p.lat, p.lng], { icon: icon });
    m.bindPopup('<b>' + esc(p.name) + '</b>' + ${selectLabel !== null ? `'<button onclick="select(\\'' + esc(p.slug) + '\\')">' + ${JSON.stringify(selectLabel)} + ' ›</button>'` : "''"});
    layer.addLayer(m);
  });
  map.addLayer(layer);
  if (points.length === 1) { layer.getLayers()[0].openPopup(); }
  else if (points.length > 1 && points.length < 200) { map.fitBounds(layer.getBounds().pad(0.1)); }
  else if (points.length >= 200 && ${center === undefined}) { map.fitBounds([[8.4, 102.1], [23.4, 109.6]]); }
</script></body></html>`;
}

export function LeafletMap({
  points,
  onSelect,
  center,
  cluster = true,
}: Props) {
  const { isDark, theme, t } = useSettings();
  const ref = useRef<WebView>(null);
  const selectLabel = onSelect ? t.viewDetails : null;
  const html = useMemo(
    () => buildHtml(points, isDark, center, cluster, selectLabel),
    [points, isDark, center, cluster, selectLabel],
  );

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const msg: unknown = JSON.parse(e.nativeEvent.data);
      if (
        typeof msg === "object" &&
        msg !== null &&
        "type" in msg &&
        msg.type === "select" &&
        "slug" in msg &&
        typeof msg.slug === "string"
      ) {
        onSelect?.(msg.slug);
      }
    } catch {
      // ignore malformed messages
    }
  };

  return (
    <View style={[styles.wrap, { backgroundColor: theme.bg }]}>
      <WebView
        ref={ref}
        originWhitelist={["*"]}
        source={{ html, baseUrl: "https://www.vietnam-pagodas.com" }}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        allowsInlineMediaPlayback
        style={{ backgroundColor: theme.bg }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
});
