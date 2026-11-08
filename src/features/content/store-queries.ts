import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { pages } from "@/db/schema";
import type { ContentPage } from "./types";

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

export const getPublishedPage = cache(
  async function getPublishedPage(
    slug: string,
  ): Promise<ContentPage | undefined> {
    const [row] = await db
      .select()
      .from(pages)
      .where(and(eq(pages.id, slug), eq(pages.status, "published")))
      .limit(1);

    return row ? toContentPage(row) : undefined;
  },
);

export async function listPublishedPages(): Promise<ContentPage[]> {
  const rows = await db
    .select()
    .from(pages)
    .where(eq(pages.status, "published"))
    .orderBy(desc(pages.updatedAt), asc(pages.title));

  return rows.map(toContentPage);
}
