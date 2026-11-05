import "server-only";

import { IMAGE_LIBRARY } from "@/features/catalog/fixtures";
import type { MediaFile } from "./types";

function toMediaFile(path: string): MediaFile {
  const segments = path.split("/");
  return {
    path,
    filename: segments[segments.length - 1] ?? path,
  };
}

export function getMediaFiles(): MediaFile[] {
  return IMAGE_LIBRARY.map(toMediaFile);
}

export function getMediaPaths(): string[] {
  return [...IMAGE_LIBRARY];
}
