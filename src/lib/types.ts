export interface Pagoda {
  id: number;
  slug: string;
  name: string;
  province: string;
  /** Pre-2025-merger province, when different from `province`. */
  oldProvince?: string;
  lat: number | null;
  lng: number | null;
  description: string;
  image: string | null;
  thumbnail: string | null;
  wikipediaUrl: string | null;
}
