import "server-only";

import { randomUUID } from "node:crypto";
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const IMAGE_MIME_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

function startsWith(bytes: Uint8Array, signature: number[]): boolean {
  if (bytes.length < signature.length) return false;

  return signature.every(
    (byte, index) => bytes[index] === (byte & 0xff),
  );
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

export function uploadRoot() {
  return resolve(process.cwd(), "storage", "uploads");
}

function isSafeObjectKey(objectKey: string): boolean {
  if (!objectKey || objectKey.startsWith("/") || objectKey.startsWith("\\")) {
    return false;
  }

  return objectKey
    .split("/")
    .every((segment) => /^[a-z0-9_-]+$/i.test(segment));
}

function safeUploadPath(objectKey: string): string | null {
  if (!isSafeObjectKey(objectKey)) return null;

  return join(uploadRoot(), /*turbopackIgnore: true*/ objectKey);
}

export function buildUploadObjectKey(mime: keyof typeof IMAGE_MIME_EXTENSIONS, now = new Date()) {
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const extension = IMAGE_MIME_EXTENSIONS[mime] ?? "bin";
  const id = randomUUID();

  return `${year}/${month}/${id}.${extension}`;
}

export async function writeUploadFile(
  objectKey: string,
  bytes: Buffer,
): Promise<void> {
  const target = safeUploadPath(objectKey);

  if (!target) throw new Error("Ruta de subida de archivo inválida.");

  await mkdir(join(target, ".."), { recursive: true });
  await writeFile(target, bytes);
}

export async function readUploadFile(
  objectKey: string,
): Promise<Buffer | null> {
  const target = safeUploadPath(objectKey);

  if (!target) return null;

  try {
    return await readFile(target);
  } catch {
    return null;
  }
}

export async function deleteUploadFile(
  objectKey: string,
): Promise<void> {
  const target = safeUploadPath(objectKey);

  if (!target) return;

  await rm(target, { force: true });
}
