import type { OrderStatus } from "@/lib/constants";
import type { OrderFixture, ProductFixture } from "./types";

const DAY_MS = 86_400_000;
const SHIPPING_CENTS = 1500;
const FREE_SHIPPING_CENTS = 20_000;

export const FIXTURE_LOW_STOCK_THRESHOLD = 5;

export const FIXTURE_PRODUCTS: ProductFixture[] = [
  {
    id: "polo-pique-clasico",
    name: "Polo piqué clásico",
    categoryName: "Polos",
    ageGroup: "adults",
    status: "active",
    priceCents: 5990,
    compareAtCents: 7990,
    soldCount: 94,
    stockTotal: 72,
    sizeCount: 5,
  },
  {
    id: "polo-urbano",
    name: "Polo urbano oversize",
    categoryName: "Polos",
    ageGroup: "teens",
    status: "active",
    priceCents: 4990,
    compareAtCents: null,
    soldCount: 68,
    stockTotal: 58,
    sizeCount: 4,
  },
  {
    id: "polo-kids",
    name: "Polo básico kids",
    categoryName: "Polos",
    ageGroup: "kids",
    status: "active",
    priceCents: 3490,
    compareAtCents: null,
    soldCount: 40,
    stockTotal: 66,
    sizeCount: 6,
  },
  {
    id: "camisa-oxford",
    name: "Camisa Oxford",
    categoryName: "Camisas",
    ageGroup: "adults",
    status: "active",
    priceCents: 8990,
    compareAtCents: null,
    soldCount: 71,
    stockTotal: 48,
    sizeCount: 5,
  },
  {
    id: "camisa-lino",
    name: "Camisa de lino",
    categoryName: "Camisas",
    ageGroup: "adults",
    status: "active",
    priceCents: 9990,
    compareAtCents: 12_990,
    soldCount: 55,
    stockTotal: 42,
    sizeCount: 5,
  },
  {
    id: "camisa-casual",
    name: "Camisa casual",
    categoryName: "Camisas",
    ageGroup: "teens",
    status: "active",
    priceCents: 6990,
    compareAtCents: null,
    soldCount: 62,
    stockTotal: 38,
    sizeCount: 4,
  },
  {
    id: "jean-slim",
    name: "Jean slim fit",
    categoryName: "Pantalones",
    ageGroup: "adults",
    status: "active",
    priceCents: 11_990,
    compareAtCents: null,
    soldCount: 83,
    stockTotal: 14,
    sizeCount: 5,
  },
  {
    id: "jogger-joven",
    name: "Jogger deportivo",
    categoryName: "Pantalones",
    ageGroup: "teens",
    status: "active",
    priceCents: 7990,
    compareAtCents: null,
    soldCount: 58,
    stockTotal: 44,
    sizeCount: 4,
  },
  {
    id: "pantalon-kids",
    name: "Pantalón kids",
    categoryName: "Pantalones",
    ageGroup: "kids",
    status: "draft",
    priceCents: 5490,
    compareAtCents: null,
    soldCount: 12,
    stockTotal: 36,
    sizeCount: 6,
  },
  {
    id: "casaca-bomber",
    name: "Casaca bomber",
    categoryName: "Casacas",
    ageGroup: "teens",
    status: "active",
    priceCents: 14_990,
    compareAtCents: 18_990,
    soldCount: 77,
    stockTotal: 12,
    sizeCount: 4,
  },
  {
    id: "casaca-rompevientos",
    name: "Rompevientos ligero",
    categoryName: "Casacas",
    ageGroup: "adults",
    status: "active",
    priceCents: 16_990,
    compareAtCents: null,
    soldCount: 49,
    stockTotal: 31,
    sizeCount: 5,
  },
  {
    id: "zapatilla-urbana",
    name: "Zapatilla urbana",
    categoryName: "Calzado",
    ageGroup: "adults",
    status: "active",
    priceCents: 18_990,
    compareAtCents: null,
    soldCount: 88,
    stockTotal: 18,
    sizeCount: 6,
  },
  {
    id: "zapatilla-run",
    name: "Zapatilla running",
    categoryName: "Calzado",
    ageGroup: "teens",
    status: "active",
    priceCents: 15_990,
    compareAtCents: 19_990,
    soldCount: 66,
    stockTotal: 27,
    sizeCount: 5,
  },
  {
    id: "zapatilla-kids",
    name: "Zapatilla kids",
    categoryName: "Calzado",
    ageGroup: "kids",
    status: "active",
    priceCents: 9990,
    compareAtCents: null,
    soldCount: 35,
    stockTotal: 0,
    sizeCount: 4,
  },
  {
    id: "gorra-snapback",
    name: "Gorra snapback",
    categoryName: "Gorras",
    ageGroup: "adults",
    status: "active",
    priceCents: 3990,
    compareAtCents: null,
    soldCount: 52,
    stockTotal: 24,
    sizeCount: 1,
  },
  {
    id: "gorra-kids",
    name: "Gorra kids",
    categoryName: "Gorras",
    ageGroup: "kids",
    status: "active",
    priceCents: 2990,
    compareAtCents: null,
    soldCount: 21,
    stockTotal: 3,
    sizeCount: 1,
  },
  {
    id: "cinturon-cuero",
    name: "Cinturón de cuero",
    categoryName: "Accesorios",
    ageGroup: "adults",
    status: "active",
    priceCents: 5990,
    compareAtCents: null,
    soldCount: 30,
    stockTotal: 19,
    sizeCount: 1,
  },
  {
    id: "mochila-urbana",
    name: "Mochila urbana",
    categoryName: "Accesorios",
    ageGroup: "teens",
    status: "active",
    priceCents: 8990,
    compareAtCents: null,
    soldCount: 44,
    stockTotal: 22,
    sizeCount: 1,
  },
];

const CUSTOMER_NAMES = [
  "Luis Quispe",
  "Carlos Huamán",
  "Jorge Salas",
  "Miguel Torres",
  "Diego Flores",
  "Andrés Rojas",
  "Pedro Vargas",
  "Raúl Mamani",
];

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

function buildOrders(): OrderFixture[] {
  const rng = createRng(20261104);
  // Fixture timestamps are anchored at 15:00 UTC so the UTC day matches the Lima day used by the dashboard.
  const today = Date.parse(`${limaDayKey(new Date())}T15:00:00.000Z`);
  const saleable = FIXTURE_PRODUCTS.filter(
    (product) => product.status !== "archived",
  );
  const orders: OrderFixture[] = [];

  for (let index = 0; index < 180; index += 1) {
    const daysAgo = ((179 - index) * 60) / 180;
    const createdAt = new Date(today - daysAgo * DAY_MS).toISOString();
    const customerName =
      CUSTOMER_NAMES[Math.floor(rng() * CUSTOMER_NAMES.length)];
    const lineCount = 1 + Math.floor(rng() * 3);
    let subtotalCents = 0;
    let itemCount = 0;

    for (let line = 0; line < lineCount; line += 1) {
      const product = saleable[Math.floor(rng() * saleable.length)];
      const quantity = 1 + Math.floor(rng() * 2);
      subtotalCents += product.priceCents * quantity;
      itemCount += quantity;
    }

    const shippingCents =
      subtotalCents >= FREE_SHIPPING_CENTS ? 0 : SHIPPING_CENTS;
    let status: OrderStatus;

    if (daysAgo < 1.5) {
      status = rng() < 0.55 ? "pending" : "paid";
    } else if (daysAgo < 4) {
      status = rng() < 0.5 ? "paid" : "shipped";
    } else if (daysAgo < 8) {
      status = rng() < 0.5 ? "shipped" : "delivered";
    } else {
      status = "delivered";
    }

    if (daysAgo > 0.5 && rng() < 0.07) {
      status = "cancelled";
    }

    const number = 864 + index;

    orders.push({
      id: String(number),
      number,
      customerName,
      status,
      totalCents: subtotalCents + shippingCents,
      itemCount,
      createdAt,
    });
  }

  return orders;
}

export const FIXTURE_ORDERS = buildOrders().sort((a, b) =>
  b.createdAt.localeCompare(a.createdAt),
);
