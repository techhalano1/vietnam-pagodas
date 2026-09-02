import routesJson from "@/data/routes.json";

export interface PilgrimageRoute {
  id: string;
  titleVi: string;
  titleEn: string;
  descVi: string;
  descEn: string;
  stops: string[];
}

export const pilgrimageRoutes = routesJson as PilgrimageRoute[];
