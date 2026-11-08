import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { readFile, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { serverEnv } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase/admin";

const IMAGE_MIME_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const FILE_CACHE_MAX_BYTES = 32 * 1024 * 1024;

const fileCache = new Map<string, Buffer>();
let fileCacheBytes = 0;

export const MEDIA_BUCKET = serverEnv.SUPABASE_STORAGE_BUCKET;

let bucketReady: Promise<void> | null = null;

function startsWith(bytes: Uint8Array, signature: number[]): boolean {
  if (bytes.length < signature.length) return false;

  return signature.every((byte, index) => bytes[index] === (byte & 0xff));
}

function detectImageMime(bytes: Uint8Array): string | null {
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png";
  }
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
    return "image/jpeg";
  }
  if (
    startsWith(bytes, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) ||
    startsWith(bytes, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
  ) {
    return "image/gif";
  }
  if (
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    startsWith(bytes.slice(8), [0x57, 0x45, 0x42, 0x50])
  ) {
    return "image/webp";
  }
  if (
    startsWith(bytes, [0x3c, 0x3f, 0x78, 0x6d, 0x6c]) ||
    startsWith(bytes, [0x3c, 0x73, 0x76, 0x67])
  ) {
    return "image/svg+xml";
  }

  return null;
}

export type DetectedImage = {
  mime: keyof typeof IMAGE_MIME_EXTENSIONS;
  bytes: Buffer;
  checksum: string;
};

export function detectImage(bytes: Buffer): DetectedImage | null {
  const mime = detectImageMime(new Uint8Array(bytes));

  if (!mime) return null;

  return {
    mime,
    bytes,
    checksum: createHash("sha256").update(bytes).digest("hex"),
  };
}

export function buildUploadObjectKey(
  mime: keyof typeof IMAGE_MIME_EXTENSIONS,
  now = new Date(),
) {
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const extension = IMAGE_MIME_EXTENSIONS[mime] ?? "bin";
  const id = randomUUID();

  return `${year}/${month}/${id}.${extension}`;
}

async function ensureBucket(): Promise<void> {
  const { error } = await supabaseAdmin.storage.getBucket(MEDIA_BUCKET);

  if (!error) return;

  const { error: createError } = await supabaseAdmin.storage.createBucket(
    MEDIA_BUCKET,
    {
      public: false,
      fileSizeLimit: MAX_UPLOAD_BYTES,
      allowedMimeTypes: Object.keys(IMAGE_MIME_EXTENSIONS),
    },
  );

  if (createError && !/already exists/i.test(createError.message)) {
    throw new Error(
      `No se pudo preparar el bucket de medios: ${createError.message}`,
    );
  }
}

function readCachedFile(objectKey: string): Buffer | null {
  const cached = fileCache.get(objectKey);

  if (!cached) return null;

  fileCache.delete(objectKey);
  fileCache.set(objectKey, cached);

  return cached;
}

function cacheFile(objectKey: string, bytes: Buffer): void {
  const existing = fileCache.get(objectKey);

  if (existing) {
    fileCache.delete(objectKey);
    fileCacheBytes -= existing.byteLength;
  }

  fileCache.set(objectKey, bytes);
  fileCacheBytes += bytes.byteLength;

  for (const [key, value] of fileCache) {
    if (fileCacheBytes <= FILE_CACHE_MAX_BYTES) break;

    fileCache.delete(key);
    fileCacheBytes -= value.byteLength;
  }
}

function invalidateCachedFile(objectKey: string): void {
  const existing = fileCache.get(objectKey);

  if (!existing) return;

  fileCache.delete(objectKey);
  fileCacheBytes -= existing.byteLength;
}

function mediaBucket(): Promise<void> {
  bucketReady ??= ensureBucket().catch((error: unknown) => {
    bucketReady = null;
    throw error;
  });

  return bucketReady;
}

function isSafeObjectKey(objectKey: string): boolean {
  if (!objectKey || objectKey.startsWith("/") || objectKey.startsWith("\\")) {
    return false;
  }

  return objectKey.split("/").every((segment) => {
    if (segment === "." || segment === "..") return false;

    return /^[a-z0-9][a-z0-9._-]*$/i.test(segment);
  });
}

function legacyUploadPath(objectKey: string): string | null {
  if (!isSafeObjectKey(objectKey)) return null;

  return join(
    resolve(/*turbopackIgnore: true*/ process.cwd(), serverEnv.UPLOAD_DIR),
    /*turbopackIgnore: true*/ objectKey,
  );
}

async function readLegacyUpload(objectKey: string): Promise<Buffer | null> {
  const target = legacyUploadPath(objectKey);

  if (!target) return null;

  try {
    return await readFile(/*turbopackIgnore: true*/ target);
  } catch {
    return null;
  }
}

async function readStorageUpload(objectKey: string): Promise<Buffer | null> {
  try {
    await mediaBucket();

    const { data, error } = await supabaseAdmin.storage
      .from(MEDIA_BUCKET)
      .download(objectKey);

    if (error) return null;

    return Buffer.from(await data.arrayBuffer());
  } catch {
    return null;
  }
}

export async function writeUploadFile(
  objectKey: string,
  bytes: Buffer,
  mime: string,
): Promise<void> {
  await mediaBucket();

  const { error } = await supabaseAdmin.storage
    .from(MEDIA_BUCKET)
    .upload(objectKey, bytes, {
      cacheControl: "31536000",
      contentType: mime,
      upsert: true,
    });

  if (error) {
    throw new Error(
      `No se pudo subir la imagen a Supabase Storage: ${error.message}`,
    );
  }

  invalidateCachedFile(objectKey);
}

export async function readUploadFile(
  objectKey: string,
): Promise<Buffer | null> {
  const cached = readCachedFile(objectKey);

  if (cached) return cached;

  const stored = await readStorageUpload(objectKey);

  if (stored) {
    cacheFile(objectKey, stored);
    return stored;
  }

  const legacy = await readLegacyUpload(objectKey);

  if (legacy) {
    cacheFile(objectKey, legacy);
  }

  return legacy;
}

export async function deleteUploadFile(objectKey: string): Promise<void> {
  invalidateCachedFile(objectKey);

  try {
    await mediaBucket();
    await supabaseAdmin.storage.from(MEDIA_BUCKET).remove([objectKey]);
  } catch {
    // Keep deleting the legacy file when Storage is unavailable.
  }

  const legacy = legacyUploadPath(objectKey);

  if (legacy) {
    await rm(legacy, { force: true }).catch(() => undefined);
  }
}
