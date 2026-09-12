import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";

export interface LatLng {
  lat: number;
  lng: number;
}

let cached: LatLng | null = null;

async function locate(): Promise<LatLng> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") throw new Error("denied");
  const pos =
    (await Location.getLastKnownPositionAsync({ maxAge: 5 * 60_000 })) ??
    (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
  cached = { lat: pos.coords.latitude, lng: pos.coords.longitude };
  return cached;
}

/**
 * Foreground location with a module-level cache so Home and the Pagodas tab
 * share one fix. `request()` prompts for permission; `silent()` only resolves
 * when permission was already granted.
 */
export function useLocation() {
  const [position, setPosition] = useState<LatLng | null>(cached);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const request = useCallback(async () => {
    setError(false);
    setLoading(true);
    try {
      setPosition(await locate());
      return true;
    } catch {
      setError(true);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => setPosition(null), []);

  useEffect(() => {
    if (cached) return;
    let alive = true;
    Location.getForegroundPermissionsAsync()
      .then((p) => (p.granted ? locate() : null))
      .then((pos) => {
        if (alive && pos) setPosition(pos);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  return { position, loading, error, request, clear };
}
