import "server-only";

import { FAQS, HOME_CONTENT, PAGES } from "./fixtures";
import type { ContentPage, FaqItem, HomeContent } from "./types";

export function getHomeContent(): HomeContent {
  return {
    ...HOME_CONTENT,
    announcement: { ...HOME_CONTENT.announcement },
    hero: { ...HOME_CONTENT.hero },
    sections: HOME_CONTENT.sections.map((section) => ({ ...section })),
  };
}

export function getPages(): ContentPage[] {
  return PAGES.map((page) => ({ ...page }));
}

export function getPageById(id: string): ContentPage | undefined {
  const page = PAGES.find((item) => item.id === id);
  return page ? { ...page } : undefined;
}

export function getFaqs(): FaqItem[] {
  return FAQS.map((faq) => ({ ...faq }));
}
