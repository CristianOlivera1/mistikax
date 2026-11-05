export type PageStatus = "published" | "draft";

export type ContentPage = {
  id: string;
  title: string;
  body: string;
  seoDescription: string;
  status: PageStatus;
  updatedAt: string;
};

export type HomeAnnouncement = {
  visible: boolean;
  text: string;
};

export type HomeHero = {
  title: string;
  subtitle: string;
  cta: string;
  link: string;
  image: string;
};

export type HomeSection = {
  id: string;
  label: string;
  visible: boolean;
};

export type HomeContent = {
  announcement: HomeAnnouncement;
  hero: HomeHero;
  sections: HomeSection[];
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const PAGE_STATUSES = {
  published: "Publicada",
  draft: "Borrador",
} as const satisfies Record<PageStatus, string>;
