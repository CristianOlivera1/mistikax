import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  CATEGORIES,
  COLORS,
  IMAGE_LIBRARY,
  PRODUCTS,
} from "../features/catalog/fixtures";
import { eq } from "drizzle-orm";
import {
  categories,
  colors,
  productColors,
  productImages,
  productStock,
  products,
} from "./schema/catalog.ts";
import { media } from "./schema/media.ts";

type MediaInsert = typeof media.$inferInsert;
type ProductInsert = typeof products.$inferInsert;
type StockInsert = typeof productStock.$inferInsert;

const CATALOG_IMAGE_DIMENSIONS = { width: 480, height: 600 };

function buildCatalogMedia(path: string): MediaInsert {
  const objectKey = path.replace(/^\//, "");
  const bytes = readFileSync(join(process.cwd(), "public", objectKey));
  const checksum = createHash("sha256").update(bytes).digest("hex");

  return {
    path,
    objectKey,
    source: "catalog",
    mime: "image/svg+xml",
    bytes: bytes.byteLength,
    width: CATALOG_IMAGE_DIMENSIONS.width,
    height: CATALOG_IMAGE_DIMENSIONS.height,
    checksum,
  };
}

function buildProductRows(): Array<{
  product: ProductInsert;
  stock: StockInsert[];
  colorIds: string[];
  imagePaths: string[];
}> {
  return PRODUCTS.map((product) => ({
    product: {
      id: product.id,
      name: product.name,
      description: product.description,
      seoDescription: product.seoDescription,
      categoryId: product.categoryId,
      ageGroup: product.ageGroup,
      status: product.status,
      priceCents: product.priceCents,
      compareAtCents: product.compareAtCents,
      isNew: product.isNew,
      isBestSeller: product.isBestSeller,
      soldCount: product.soldCount,
    },
    stock: Object.entries(product.stock).map(([size, quantity]) => ({
      productId: product.id,
      size,
      quantity,
    })),
    colorIds: product.colorIds,
    imagePaths: product.images,
  }));
}

async function seed(connectionString: string) {
  const sql = postgres(connectionString);
  const db = drizzle(sql);
  const rows = buildProductRows();

  try {
    await db.transaction(async (tx) => {
      const mediaRows = IMAGE_LIBRARY.map(buildCatalogMedia);
      await tx.insert(categories).values(CATEGORIES).onConflictDoNothing();
      await tx.insert(colors).values(COLORS).onConflictDoNothing();
      await tx.insert(media).values(mediaRows).onConflictDoNothing();
      await tx
        .insert(products)
        .values(rows.map((row) => row.product))
        .onConflictDoNothing();

      for (const row of rows) {
        await tx.delete(productColors).where(eq(productColors.productId, row.product.id));
        await tx.delete(productStock).where(eq(productStock.productId, row.product.id));
        await tx.delete(productImages).where(eq(productImages.productId, row.product.id));

        if (row.colorIds.length) {
          await tx.insert(productColors).values(
            row.colorIds.map((colorId) => ({
              productId: row.product.id,
              colorId,
            })),
          );
        }

        if (row.stock.length) {
          await tx.insert(productStock).values(row.stock);
        }

        await tx.insert(productImages).values(
          row.imagePaths.map((path, position) => ({
            productId: row.product.id,
            path,
            position,
          })),
        );
      }
    });
  } finally {
    await sql.end({ timeout: 5 });
  }
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the catalog.");
}

await seed(connectionString);
console.log("Seed completado.");
