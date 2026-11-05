import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { readUploadFile } from "@/features/media/storage";

type MediaRouteContext = {
  params: Promise<{ path: string[] }>;
};

function pathFromSegments(segments: string[]): string | null {
  if (segments.length === 0) return null;
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) {
    return null;
  }

  return `/${segments.join("/")}`;
}

export async function GET(_request: NextRequest, context: MediaRouteContext) {
  const { path } = await context.params;
  const pathValue = pathFromSegments(path);

  if (!pathValue) {
    return new NextResponse(null, { status: 404 });
  }

  const [row] = await db
    .select()
    .from(media)
    .where(eq(media.path, pathValue))
    .limit(1);

  if (!row || row.source !== "upload") {
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
      "Content-Length": String(row.bytes),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
