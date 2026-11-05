import "server-only";

import { asc } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import type { MediaFile } from "./types";

export async function getMediaFiles(): Promise<MediaFile[]> {
  const rows = await db
    .select()
    .from(media)
    .orderBy(asc(media.source), asc(media.path));

  return rows.map((row) => {
    const segments = row.path.split("/");

    return {
      path: row.path,
      filename: segments[segments.length - 1] ?? row.path,
      source: row.source,
      mime: row.mime,
      bytes: row.bytes,
    };
  });
}

export async function getMediaPaths(): Promise<string[]> {
  const rows = await db
    .select()
    .from(media)
    .orderBy(asc(media.path));

  return rows
    .filter((row) => row.source === "upload")
    .filter((row) => row.mime.startsWith("image/"))
    .map((row) => row.path);
}
