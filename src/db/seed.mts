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
import { getSizes } from "../features/catalog/constants";
import { computeOrderTotals } from "../features/orders/service";
import { eq, inArray } from "drizzle-orm";
import {
  categories,
  colors,
  productColors,
  productImages,
  productStock,
  products,
} from "./schema/catalog.ts";
import {
  coupons,
  orderItems,
  orderStatusHistory,
  orders,
} from "./schema/orders.ts";
import {
  faqs,
  homeContent,
  homeSections,
  pages,
  siteSettings,
} from "./schema/content.ts";
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

const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;
const FREE_SHIPPING_CENTS = 20_000;
const SHIPPING_CENTS = 1_500;
const ORDER_COUNT = 180;
const RNG_SEED = 20261104;

const SEED_PEOPLE = [
  { name: "Luis Quispe", email: "luis.q@mail.com", phone: "999 111 222", city: "Abancay" },
  { name: "Carlos Huamán", email: "carlos.h@mail.com", phone: "999 333 444", city: "Cusco" },
  { name: "Jorge Salas", email: "jorge.s@mail.com", phone: "999 555 666", city: "Lima" },
  { name: "Miguel Torres", email: "miguel.t@mail.com", phone: "999 777 888", city: "Arequipa" },
  { name: "Diego Flores", email: "diego.f@mail.com", phone: "999 000 111", city: "Abancay" },
  { name: "Andrés Rojas", email: "andres.r@mail.com", phone: "999 222 333", city: "Cusco" },
  { name: "Pedro Vargas", email: "pedro.v@mail.com", phone: "999 444 555", city: "Lima" },
  { name: "Raúl Mamani", email: "raul.m@mail.com", phone: "999 666 777", city: "Puno" },
] as const;

const SEED_PAYMENT_METHODS = ["card", "transfer", "cod"] as const;

const SEED_FLOW = ["pending", "paid", "shipped", "delivered"] as const;

type SeedOrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

type SeedHistoryEvent = { status: SeedOrderStatus; createdAt: Date };

function createRng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
}

function limaDayKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * DAY_MS);
}

function buildSeedHistory(status: SeedOrderStatus, createdAtMs: number): SeedHistoryEvent[] {
  const cap = Date.now();
  const at = (hours: number) =>
    new Date(Math.min(createdAtMs + hours * HOUR_MS, cap));

  if (status === "cancelled") {
    return [
      { status: "pending", createdAt: at(0) },
      { status: "cancelled", createdAt: at(8) },
    ];
  }

  const lastIndex = SEED_FLOW.indexOf(status);

  return SEED_FLOW.slice(0, lastIndex + 1).map((current, index) => ({
    status: current,
    createdAt: at(index * 6),
  }));
}

function buildOrderSeedData() {
  const rng = createRng(RNG_SEED);
  const today = Date.parse(`${limaDayKey(new Date())}T15:00:00.000Z`);
  const orderRows: (typeof orders.$inferInsert)[] = [];
  const itemRows: (typeof orderItems.$inferInsert)[] = [];
  const historyRows: (typeof orderStatusHistory.$inferInsert)[] = [];

  for (let index = 0; index < ORDER_COUNT; index += 1) {
    const daysBack = ((ORDER_COUNT - 1 - index) * 60) / ORDER_COUNT;
    const createdAtMs = today - daysBack * DAY_MS;
    const createdAt = new Date(createdAtMs);
    const person = SEED_PEOPLE[Math.floor(rng() * SEED_PEOPLE.length)];
    const itemCount = 1 + Math.floor(rng() * 3);
    const lines = [];

    for (let lineIndex = 0; lineIndex < itemCount; lineIndex += 1) {
      const product = PRODUCTS[Math.floor(rng() * PRODUCTS.length)];
      const category = CATEGORIES.find((item) => item.id === product.categoryId);
      const sizes = getSizes(category?.sizeType ?? "one_size", product.ageGroup);
      const color =
        COLORS.find((item) => item.id === product.colorIds[0])?.name ?? "—";

      lines.push({
        productId: product.id,
        productName: product.name,
        productImage: product.images[0] ?? "",
        priceCents: product.priceCents,
        size: sizes[Math.floor(rng() * sizes.length)] ?? "Única",
        colorName: color,
        quantity: 1 + Math.floor(rng() * 2),
      });
    }

    let status: SeedOrderStatus;

    if (daysBack < 1.5) {
      status = rng() < 0.55 ? "pending" : "paid";
    } else if (daysBack < 4) {
      status = rng() < 0.5 ? "paid" : "shipped";
    } else if (daysBack < 8) {
      status = rng() < 0.5 ? "shipped" : "delivered";
    } else {
      status = "delivered";
    }

    if (daysBack > 0.5 && rng() < 0.07) {
      status = "cancelled";
    }

    const subtotalCents = lines.reduce(
      (total, line) => total + line.priceCents * line.quantity,
      0,
    );
    const shippingCents =
      subtotalCents >= FREE_SHIPPING_CENTS ? 0 : SHIPPING_CENTS;
    const { totalCents } = computeOrderTotals(lines, shippingCents);
    const number = 864 + index;
    const id = String(number);

    orderRows.push({
      id,
      number,
      customerName: person.name,
      email: person.email,
      phone: person.phone,
      city: person.city,
      status,
      paymentMethod: SEED_PAYMENT_METHODS[index % SEED_PAYMENT_METHODS.length],
      shippingCents,
      subtotalCents,
      totalCents,
      note: "",
      createdAt,
      updatedAt: createdAt,
    });
    itemRows.push(...lines.map((line) => ({ orderId: id, ...line })));
    historyRows.push(
      ...buildSeedHistory(status, createdAtMs).map((event) => ({
        orderId: id,
        status: event.status,
        createdAt: event.createdAt,
      })),
    );
  }

  return { ids: orderRows.map((row) => row.id), orderRows, itemRows, historyRows };
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

      await tx
        .insert(siteSettings)
        .values({
          id: 1,
          storeName: "Mistikax",
          description: "Ropa y calzado para hombre.",
          email: "hola@mistikax.com",
          whatsapp: "51999888777",
          address: "Calle Principal 101, Ciudad",
          shippingCents: SHIPPING_CENTS,
          freeShippingThresholdCents: FREE_SHIPPING_CENTS,
          leadTime: "24-48 horas",
          transferInstructions: "Banco: ____ / Cuenta: ____ / Titular: ____",
          primaryColor: "#D4C5B9",
          accentColor: "#857262",
          updatedAt: daysAgo(0),
        })
        .onConflictDoNothing();

      await tx
        .insert(homeContent)
        .values({
          id: 1,
          announcementEnabled: true,
          announcementText: "Envío gratis desde S/ 200 · Cambios en 7 días",
          heroTitle: "Mistikax",
          heroSubtitle:
            "Ropa y calzado para hombre. Para niños, jóvenes y adultos, en todas las tallas.",
          heroCta: "Ver catálogo",
          heroLink: "/catalog",
          heroImage: "/images/products/camisa-lino.svg",
          updatedAt: daysAgo(1),
        })
        .onConflictDoNothing();

      await tx
        .insert(homeSections)
        .values([
          { id: "age", label: "Compra por edad", enabled: true, position: 0 },
          { id: "categories", label: "Categorías", enabled: true, position: 1 },
          { id: "best-sellers", label: "Más vendidos", enabled: true, position: 2 },
          { id: "benefits", label: "Beneficios", enabled: true, position: 3 },
          { id: "new", label: "Novedades", enabled: true, position: 4 },
          { id: "steps", label: "Compra en 4 pasos", enabled: true, position: 5 },
          { id: "faq", label: "Preguntas frecuentes", enabled: true, position: 6 },
        ])
        .onConflictDoNothing();

      await tx
        .insert(pages)
        .values([
          {
            id: "nosotros",
            title: "Nosotros",
            body: "Mistikax es una tienda de ropa y calzado para hombre.\n\nVestimos a niños, jóvenes y adultos con prendas cómodas y de buena calidad.",
            seoDescription: "Conoce Mistikax, ropa y calzado para hombre.",
            status: "published",
            updatedAt: daysAgo(12),
          },
          {
            id: "envios",
            title: "Envíos",
            body: "Preparamos tu pedido en 24 a 48 horas.\n\nEl envío es gratis desde S/ 200.",
            seoDescription: "Tiempos, costos y cobertura de envío.",
            status: "published",
            updatedAt: daysAgo(8),
          },
          {
            id: "cambios",
            title: "Cambios y devoluciones",
            body: "Tienes 7 días para cambiar la talla.\n\nLa prenda debe estar sin uso y con etiquetas.",
            seoDescription: "Cambios y devoluciones dentro de los 7 días.",
            status: "published",
            updatedAt: daysAgo(8),
          },
          {
            id: "contacto",
            title: "Contacto",
            body: "Escríbenos por WhatsApp o a hola@mistikax.com.",
            seoDescription: "Canales de atención de Mistikax.",
            status: "published",
            updatedAt: daysAgo(20),
          },
          {
            id: "privacidad",
            title: "Política de privacidad",
            body: "",
            seoDescription: "",
            status: "draft",
            updatedAt: daysAgo(30),
          },
        ])
        .onConflictDoNothing();

      await tx
        .insert(faqs)
        .values([
          {
            id: "faq-1",
            question: "¿Cómo elijo mi talla y qué pasa si no me queda?",
            answer:
              "Cada producto tiene su guía de tallas. Si no te queda, cambias la talla dentro de los 7 días.",
            position: 0,
          },
          {
            id: "faq-2",
            question: "¿Cuánto tarda el envío y cuánto cuesta?",
            answer:
              "Preparamos tu pedido en 24-48 horas. El envío es gratis desde S/ 200.",
            position: 1,
          },
          {
            id: "faq-3",
            question: "¿Qué formas de pago aceptan?",
            answer: "Tarjeta, transferencia y pago contra entrega según tu zona.",
            position: 2,
          },
        ])
        .onConflictDoNothing();

      await tx
        .insert(coupons)
        .values([
          {
            code: "BIENVENIDO10",
            kind: "percent",
            value: 10,
            uses: 23,
            expiresAt: "2026-12-31",
            active: true,
            createdAt: daysAgo(40),
          },
          {
            code: "ENVIOGRATIS",
            kind: "fixed",
            value: SHIPPING_CENTS,
            uses: 8,
            expiresAt: "2026-11-30",
            active: true,
            createdAt: daysAgo(25),
          },
          {
            code: "VERANO20",
            kind: "percent",
            value: 20,
            uses: 41,
            expiresAt: "2026-03-01",
            active: false,
            createdAt: daysAgo(60),
          },
        ])
        .onConflictDoNothing();

      const orderSeed = buildOrderSeedData();

      await tx.delete(orders).where(inArray(orders.id, orderSeed.ids));
      await tx.insert(orders).values(orderSeed.orderRows);

      if (orderSeed.itemRows.length) {
        await tx.insert(orderItems).values(orderSeed.itemRows);
      }

      if (orderSeed.historyRows.length) {
        await tx.insert(orderStatusHistory).values(orderSeed.historyRows);
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
