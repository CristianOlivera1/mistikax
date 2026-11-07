import "server-only";

import { asc, desc, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { faqs, homeContent, homeSections, pages } from "@/db/schema";
import { HOME_CONTENT } from "./fixtures";
import type { ContentPage, FaqItem, HomeContent } from "./types";

function fallbackHomeContent(): HomeContent {
  return {
    announcement: { ...HOME_CONTENT.announcement },
    hero: { ...HOME_CONTENT.hero },
    sections: HOME_CONTENT.sections.map((section) => ({ ...section })),
  };
}

export const getHomeContent = cache(
  async function getHomeContent(): Promise<HomeContent> {
    const [contentRow] = await db
      .select()
      .from(homeContent)
      .where(eq(homeContent.id, 1))
      .limit(1);
    const sectionRows = await db
      .select()
      .from(homeSections)
      .orderBy(asc(homeSections.position));

    if (!contentRow || sectionRows.length === 0) {
      return fallbackHomeContent();
    }

    return {
      announcement: {
        visible: contentRow.announcementEnabled,
        text: contentRow.announcementText,
      },
      hero: {
        title: contentRow.heroTitle,
        subtitle: contentRow.heroSubtitle,
        cta: contentRow.heroCta,
        link: contentRow.heroLink,
        image: contentRow.heroImage,
      },
      sections: sectionRows.map((row) => ({
        id: row.id,
        label: row.label,
        visible: row.enabled,
      })),
    };
  },
);

export async function getPages(): Promise<ContentPage[]> {
  const rows = await db
    .select()
    .from(pages)
    .orderBy(desc(pages.updatedAt), asc(pages.title));

  return rows.map(toContentPage);
}

export async function getPageById(id: string): Promise<ContentPage | undefined> {
  const [row] = await db.select().from(pages).where(eq(pages.id, id)).limit(1);

  return row ? toContentPage(row) : undefined;
}

function toContentPage(row: typeof pages.$inferSelect): ContentPage {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    seoDescription: row.seoDescription,
    status: row.status,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getFaqs(): Promise<FaqItem[]> {
  const rows = await db.select().from(faqs).orderBy(asc(faqs.position));

  return rows.map((row) => ({
    id: row.id,
    question: row.question,
    answer: row.answer,
  }));
}
