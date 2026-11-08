import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { readUploadFile } from "@/features/media/storage";

type MediaRouteContext = {
  params: Promise<{ path: string[] }>;
};

type MediaRow = typeof media.$inferSelect;

const MEDIA_ROW_TTL_MS = 5 * 60_000;
const MEDIA_ROW_CACHE_MAX = 500;

const mediaRowCache = new Map<
  string,
  { row: MediaRow; expiresAt: number }
>();

function readCachedMediaRow(path: string): MediaRow | null {
  const cached = mediaRowCache.get(path);

  if (!cached) return null;

  if (cached.expiresAt <= Date.now()) {
    mediaRowCache.delete(path);
    return null;
  }

  return cached.row;
}

function cacheMediaRow(path: string, row: MediaRow): void {
  if (mediaRowCache.size >= MEDIA_ROW_CACHE_MAX) {
    const oldest = mediaRowCache.keys().next().value;

    if (oldest) mediaRowCache.delete(oldest);
  }

  mediaRowCache.set(path, {
    row,
    expiresAt: Date.now() + MEDIA_ROW_TTL_MS,
  });
}

function pathFromSegments(segments: string[]): string | null {
  if (segments.length === 0) return null;
  if (
    segments.some((segment) => !segment || segment === "." || segment === "..")
  ) {
    return null;
  }

  return `/media/${segments.join("/")}`;
}

export async function GET(_request: NextRequest, context: MediaRouteContext) {
  const { path } = await context.params;
  const pathValue = pathFromSegments(path);

  if (!pathValue) {
    return new NextResponse(null, { status: 404 });
  }

  let row = readCachedMediaRow(pathValue);

  if (!row) {
    const [found] = await db
      .select()
      .from(media)
      .where(eq(media.path, pathValue))
      .limit(1);

    if (!found) {
      return new NextResponse(null, { status: 404 });
    }

    cacheMediaRow(pathValue, found);
    row = found;
  }

  if (row.source !== "upload" && row.source !== "catalog") {
    return new NextResponse(null, { status: 404 });
  }

  const bytes = await readUploadFile(row.objectKey);

  if (!bytes) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": row.mime,
      "Content-Length": String(bytes.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}
