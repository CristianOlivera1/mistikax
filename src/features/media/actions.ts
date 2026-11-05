"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { media, productImages } from "@/db/schema";
import {
  buildUploadObjectKey,
  deleteUploadFile,
  detectImage,
  writeUploadFile,
} from "./storage";

type UploadResult =
  | { status: "success"; path: string }
  | { status: "error"; message: string };

function revalidateMedia() {
  revalidatePath("/admin/media");
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/new");
}

export async function uploadMediaAction(
  formData: FormData,
): Promise<UploadResult> {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { status: "error", message: "Selecciona un archivo." };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const image = detectImage(bytes);

  if (!image) {
    return {
      status: "error",
      message: "Formato no soportado. Usa PNG, JPG, WebP, GIF o SVG.",
    };
  }

  const objectKey = buildUploadObjectKey(image.mime);
  const path = `/media/${objectKey}`;

  await writeUploadFile(objectKey, image.bytes);
  await db.insert(media).values({
    path,
    objectKey,
    source: "upload",
    mime: image.mime,
    bytes: image.bytes.byteLength,
    width: null,
    height: null,
    checksum: image.checksum,
  });

  revalidateMedia();

  return { status: "success", path };
}

type DeleteMediaResult =
  | { status: "success" }
  | { status: "error"; message: string };

export async function deleteMediaAction(
  path: string,
): Promise<DeleteMediaResult> {
  const [row] = await db
    .select()
    .from(media)
    .where(eq(media.path, path))
    .limit(1);

  if (!row) return { status: "success" };

  if (row.source !== "upload") {
    return {
      status: "error",
      message: "Las imágenes de ejemplo no se pueden eliminar.",
    };
  }

  const [used] = await db
    .select({ productId: productImages.productId })
    .from(productImages)
    .where(eq(productImages.path, path))
    .limit(1);

  if (used) {
    return {
      status: "error",
      message: "La imagen está en uso por un producto.",
    };
  }

  await db.delete(media).where(eq(media.path, path));
  await deleteUploadFile(row.objectKey);

  revalidateMedia();

  return { status: "success" };
}
