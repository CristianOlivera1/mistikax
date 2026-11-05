export type MediaFile = {
  path: string;
  filename: string;
  source: "catalog" | "upload";
  mime: string;
  bytes: number;
};
