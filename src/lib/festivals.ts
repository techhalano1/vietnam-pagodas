import festivalsJson from "@/data/festivals.json";

export interface Festival {
  slug: string;
  nameVi: string;
  nameEn: string;
  lunarMonth: number;
  dateVi: string;
  dateEn: string;
  descVi: string;
  descEn: string;
}

export const festivals = festivalsJson as Festival[];

export function getFestivalBySlug(slug: string): Festival | undefined {
  return festivals.find((f) => f.slug === slug);
}
