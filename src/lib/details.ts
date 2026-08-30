import detailsJson from "@/data/details.json";

export interface Section {
  heading: string | null;
  text: string;
}

export interface GalleryImage {
  src: string;
  creditUrl: string;
}

export interface PagodaDetails {
  nameEn: string | null;
  wikipediaUrlEn: string | null;
  sectionsVi: Section[];
  sectionsEn: Section[];
  references: string[];
  gallery?: GalleryImage[];
  worshipVi?: string;
  worshipEn?: string;
  prayForVi?: string;
  prayForEn?: string;
}

const details = detailsJson as Record<string, PagodaDetails>;

export function getDetailsBySlug(slug: string): PagodaDetails | undefined {
  return details[slug];
}
