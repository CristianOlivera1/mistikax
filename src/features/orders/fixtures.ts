import type { OrderStatus } from "@/lib/constants";
import { getSizes } from "@/features/catalog/constants";
import { CATEGORIES, COLORS, PRODUCTS } from "@/features/catalog/fixtures";
import type {
  AdminOrder,
  OrderItem,
  OrderStatusEvent,
  PaymentMethod,
} from "./types";

const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;
const FREE_SHIPPING_CENTS = 20_000;
const SHIPPING_CENTS = 1_500;
const ORDER_COUNT = 180;

const PEOPLE = [
  {
    name: "Luis Quispe",
    email: "luis.q@mail.com",
    phone: "999 111 222",
    city: "Abancay",
  },
  {
    name: "Carlos Huamán",
    email: "carlos.h@mail.com",
    phone: "999 333 444",
    city: "Cusco",
  },
  {
    name: "Jorge Salas",
    email: "jorge.s@mail.com",
    phone: "999 555 666",
    city: "Lima",
  },
  {
    name: "Miguel Torres",
    email: "miguel.t@mail.com",
    phone: "999 777 888",
    city: "Arequipa",
  },
  {
    name: "Diego Flores",
    email: "diego.f@mail.com",
    phone: "999 000 111",
    city: "Abancay",
  },
  {
    name: "Andrés Rojas",
    email: "andres.r@mail.com",
    phone: "999 222 333",
    city: "Cusco",
  },
  {
    name: "Pedro Vargas",
    email: "pedro.v@mail.com",
    phone: "999 444 555",
    city: "Lima",
  },
  {
    name: "Raúl Mamani",
    email: "raul.m@mail.com",
    phone: "999 666 777",
    city: "Puno",
  },
] as const;

const PAYMENT_METHODS: PaymentMethod[] = ["card", "transfer", "cod"];

const STATUS_FLOW: OrderStatus[] = ["pending", "paid", "shipped", "delivered"];

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

function buildHistory(
  status: OrderStatus,
  createdAt: string,
): OrderStatusEvent[] {
  const createdAtMs = Date.parse(createdAt);
  const cap = Date.now();
  const at = (hours: number) =>
    new Date(Math.min(createdAtMs + hours * HOUR_MS, cap)).toISOString();

  if (status === "cancelled") {
    return [
      { status: "pending", at: at(0) },
      { status: "cancelled", at: at(8) },
    ];
  }

  const lastIndex = STATUS_FLOW.indexOf(status);

  return STATUS_FLOW.slice(0, lastIndex + 1).map((current, index) => ({
    status: current,
    at: at(index * 6),
  }));
}

function buildItems(rng: () => number, count: number): OrderItem[] {
  return Array.from({ length: count }, () => {
    const product = PRODUCTS[Math.floor(rng() * PRODUCTS.length)];
    const category = CATEGORIES.find((item) => item.id === product.categoryId);
    const sizes = getSizes(category?.sizeType ?? "one_size", product.ageGroup);
    const color =
      COLORS.find((item) => item.id === product.colorIds[0])?.name ?? "—";

    return {
      productId: product.id,
      productName: product.name,
      productImage: product.images[0],
      priceCents: product.priceCents,
      size: sizes[Math.floor(rng() * sizes.length)],
      colorName: color,
      quantity: 1 + Math.floor(rng() * 2),
    };
  });
}

function buildOrders(): AdminOrder[] {
  const rng = createRng(20261104);
  const today = Date.parse(`${limaDayKey(new Date())}T15:00:00.000Z`);
  const orders: AdminOrder[] = [];

  for (let index = 0; index < ORDER_COUNT; index += 1) {
    const daysAgo = ((ORDER_COUNT - 1 - index) * 60) / ORDER_COUNT;
    const createdAt = new Date(today - daysAgo * DAY_MS).toISOString();
    const person = PEOPLE[Math.floor(rng() * PEOPLE.length)];
    const itemCount = 1 + Math.floor(rng() * 3);
    const items = buildItems(rng, itemCount);
    const subtotal = items.reduce(
      (total, item) => total + item.priceCents * item.quantity,
      0,
    );
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
      customerName: person.name,
      customerEmail: person.email,
      customerPhone: person.phone,
      customerCity: person.city,
      customerAddress: `${person.city}, Perú`,
      shippingMethod: person.city === "Lima" ? "delivery" : "courier",
      shippingZone: person.city === "Lima" ? "lima" : "provinces",
      status,
      paymentMethod: PAYMENT_METHODS[index % PAYMENT_METHODS.length],
      items,
      shippingCents: subtotal >= FREE_SHIPPING_CENTS ? 0 : SHIPPING_CENTS,
      note: "",
      createdAt,
      history: buildHistory(status, createdAt),
    });
  }

  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const ORDERS = buildOrders();
