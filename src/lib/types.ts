export interface Pagoda {
  id: number;
  slug: string;
  name: string;
  province: string;
  lat: number | null;
  lng: number | null;
  description: string;
  image: string | null;
  thumbnail: string | null;
  wikipediaUrl: string | null;
}
