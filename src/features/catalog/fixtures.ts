import type { AgeGroup, ProductStatus } from "../../lib/constants";
import { PLACEHOLDER_IMAGE, getSizes } from "./constants";
import type { CatalogCategory, CatalogColor, CatalogProduct } from "./types";

export const CATEGORIES: CatalogCategory[] = [
  { id: "polos", name: "Polos", sizeType: "clothing" },
  { id: "camisas", name: "Camisas", sizeType: "clothing" },
  { id: "pantalones", name: "Pantalones", sizeType: "clothing" },
  { id: "casacas", name: "Casacas", sizeType: "clothing" },
  { id: "calzado", name: "Calzado", sizeType: "footwear" },
  { id: "gorras", name: "Gorras", sizeType: "one_size" },
  { id: "accesorios", name: "Accesorios", sizeType: "one_size" },
];

export const COLORS: CatalogColor[] = [
  { id: "black", name: "Negro", hex: "#111827" },
  { id: "white", name: "Blanco", hex: "#f5f5f4" },
  { id: "navy", name: "Azul marino", hex: "#1e3a5f" },
  { id: "gray", name: "Gris", hex: "#9ca3af" },
  { id: "olive", name: "Oliva", hex: "#4d5a3c" },
  { id: "beige", name: "Beige", hex: "#d6c3a5" },
  { id: "red", name: "Rojo", hex: "#b91c1c" },
  { id: "sky", name: "Celeste", hex: "#7fb2d9" },
  { id: "brown", name: "Marrón", hex: "#6b4a2f" },
];

type ProductSeed = {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  ageGroup: AgeGroup;
  status?: ProductStatus;
  priceCents: number;
  compareAtCents?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  soldCount: number;
  stockTotal: number;
  colorIds: string[];
};

const PRODUCT_SEEDS: ProductSeed[] = [
  {
    id: "polo-pique-clasico",
    name: "Polo piqué clásico",
    description:
      "Polo de algodón piqué con cuello reforzado y corte regular. Una pieza versátil para el día a día.",
    categoryId: "polos",
    ageGroup: "adults",
    priceCents: 5990,
    compareAtCents: 7990,
    isBestSeller: true,
    soldCount: 94,
    stockTotal: 72,
    colorIds: ["black", "white", "navy"],
  },
  {
    id: "polo-urbano",
    name: "Polo urbano oversize",
    description:
      "Polo de corte amplio con hombros caídos y tela de algodón pesado. Ideal para un look relajado.",
    categoryId: "polos",
    ageGroup: "teens",
    priceCents: 4990,
    isNew: true,
    soldCount: 68,
    stockTotal: 58,
    colorIds: ["gray", "olive", "white"],
  },
  {
    id: "polo-kids",
    name: "Polo básico kids",
    description:
      "Polo de algodón suave para niños, con cuello elástico y costuras reforzadas para el uso diario.",
    categoryId: "polos",
    ageGroup: "kids",
    priceCents: 3490,
    soldCount: 40,
    stockTotal: 66,
    colorIds: ["sky", "red", "navy"],
  },
  {
    id: "camisa-oxford",
    name: "Camisa Oxford",
    description:
      "Camisa Oxford de algodón con cuello button-down y caída limpia. Combina con jeans o pantalón de vestir.",
    categoryId: "camisas",
    ageGroup: "adults",
    priceCents: 8990,
    isBestSeller: true,
    soldCount: 71,
    stockTotal: 48,
    colorIds: ["white", "sky"],
  },
  {
    id: "camisa-lino",
    name: "Camisa de lino",
    description:
      "Camisa de lino fresco y ligero, con botones de nácar y corte relajado para climas cálidos.",
    categoryId: "camisas",
    ageGroup: "adults",
    priceCents: 9990,
    compareAtCents: 12990,
    soldCount: 55,
    stockTotal: 42,
    colorIds: ["beige", "white"],
  },
  {
    id: "camisa-casual",
    name: "Camisa casual",
    description:
      "Camisa de algodón lavado con bolsillo frontal y silueta cómoda. Pensada para el fin de semana.",
    categoryId: "camisas",
    ageGroup: "teens",
    priceCents: 6990,
    isNew: true,
    soldCount: 62,
    stockTotal: 38,
    colorIds: ["navy", "olive"],
  },
  {
    id: "jean-slim",
    name: "Jean slim fit",
    description:
      "Jean de denim elástico con tiro medio y pierna slim. Conserva la forma después de cada lavado.",
    categoryId: "pantalones",
    ageGroup: "adults",
    priceCents: 11990,
    isBestSeller: true,
    soldCount: 83,
    stockTotal: 14,
    colorIds: ["navy", "black"],
  },
  {
    id: "jogger-joven",
    name: "Jogger deportivo",
    description:
      "Jogger de algodón perchado con cintura elástica y puños ajustados. Comodidad para todos los días.",
    categoryId: "pantalones",
    ageGroup: "teens",
    priceCents: 7990,
    soldCount: 58,
    stockTotal: 44,
    colorIds: ["gray", "black"],
  },
  {
    id: "pantalon-kids",
    name: "Pantalón kids",
    description:
      "Pantalón de algodón con cintura regulable y rodillas reforzadas. Listo para jugar sin límites.",
    categoryId: "pantalones",
    ageGroup: "kids",
    status: "draft",
    priceCents: 5490,
    soldCount: 12,
    stockTotal: 36,
    colorIds: ["navy", "beige"],
  },
  {
    id: "casaca-bomber",
    name: "Casaca bomber",
    description:
      "Casaca bomber con forro ligero, puños acanalados y cierre metálico. Un clásico de entretiempo.",
    categoryId: "casacas",
    ageGroup: "teens",
    priceCents: 14990,
    compareAtCents: 18990,
    isBestSeller: true,
    soldCount: 77,
    stockTotal: 12,
    colorIds: ["olive", "black"],
  },
  {
    id: "casaca-rompevientos",
    name: "Rompevientos ligero",
    description:
      "Rompevientos de tejido técnico con capucha plegable y bolsillos con cierre. Protección sin peso.",
    categoryId: "casacas",
    ageGroup: "adults",
    priceCents: 16990,
    isNew: true,
    soldCount: 49,
    stockTotal: 31,
    colorIds: ["navy", "black"],
  },
  {
    id: "zapatilla-urbana",
    name: "Zapatilla urbana",
    description:
      "Zapatilla de caña baja con suela de goma y plantilla acolchada. Diseñada para caminar la ciudad.",
    categoryId: "calzado",
    ageGroup: "adults",
    priceCents: 18990,
    isBestSeller: true,
    soldCount: 88,
    stockTotal: 18,
    colorIds: ["white", "black"],
  },
  {
    id: "zapatilla-run",
    name: "Zapatilla running",
    description:
      "Zapatilla de running con malla transpirable y entresuela de espuma. Amortiguación para cada kilómetro.",
    categoryId: "calzado",
    ageGroup: "teens",
    priceCents: 15990,
    compareAtCents: 19990,
    soldCount: 66,
    stockTotal: 27,
    colorIds: ["black", "red"],
  },
  {
    id: "zapatilla-kids",
    name: "Zapatilla kids",
    description:
      "Zapatilla infantil con cierre de velcro, puntera reforzada y suela flexible para el colegio.",
    categoryId: "calzado",
    ageGroup: "kids",
    priceCents: 9990,
    soldCount: 35,
    stockTotal: 0,
    colorIds: ["white", "navy"],
  },
  {
    id: "gorra-snapback",
    name: "Gorra snapback",
    description:
      "Gorra de seis paneles con visera plana y cierre ajustable. Bordado discreto en la parte frontal.",
    categoryId: "gorras",
    ageGroup: "adults",
    priceCents: 3990,
    isNew: true,
    soldCount: 52,
    stockTotal: 24,
    colorIds: ["black", "navy"],
  },
  {
    id: "gorra-kids",
    name: "Gorra kids",
    description:
      "Gorra infantil de algodón con visera curva y cierre de velcro. Pensada para el sol y el recreo.",
    categoryId: "gorras",
    ageGroup: "kids",
    priceCents: 2990,
    soldCount: 21,
    stockTotal: 3,
    colorIds: ["red", "navy"],
  },
  {
    id: "cinturon-cuero",
    name: "Cinturón de cuero",
    description:
      "Cinturón de cuero vacuno con hebilla metálica y acabado mate. Un accesorio que gana carácter con el uso.",
    categoryId: "accesorios",
    ageGroup: "adults",
    priceCents: 5990,
    soldCount: 30,
    stockTotal: 19,
    colorIds: ["brown", "black"],
  },
  {
    id: "mochila-urbana",
    name: "Mochila urbana",
    description:
      "Mochila de nylon resistente al agua con compartimento para laptop y bolsillo lateral. Lista para el día.",
    categoryId: "accesorios",
    ageGroup: "teens",
    priceCents: 8990,
    soldCount: 44,
    stockTotal: 22,
    colorIds: ["black", "gray"],
  },
];

function buildStock(sizes: string[], total: number): Record<string, number> {
  const base = Math.floor(total / sizes.length);
  const remainder = total % sizes.length;

  return Object.fromEntries(
    sizes.map((size, index) => [size, base + (index < remainder ? 1 : 0)]),
  );
}

export const PRODUCTS: CatalogProduct[] = PRODUCT_SEEDS.map((seed) => {
  const category = CATEGORIES.find((item) => item.id === seed.categoryId);

  if (!category) {
    throw new Error(`Unknown fixture category: ${seed.categoryId}`);
  }

  const sizes = getSizes(category.sizeType, seed.ageGroup);

  return {
    id: seed.id,
    name: seed.name,
    description: seed.description,
    seoDescription: "",
    categoryId: seed.categoryId,
    ageGroup: seed.ageGroup,
    status: seed.status ?? "active",
    priceCents: seed.priceCents,
    compareAtCents: seed.compareAtCents ?? null,
    isNew: seed.isNew ?? false,
    isBestSeller: seed.isBestSeller ?? false,
    soldCount: seed.soldCount,
    stock: buildStock(sizes, seed.stockTotal),
    colorIds: seed.colorIds,
    images: [`/images/products/${seed.id}.svg`],
  };
});

export const IMAGE_LIBRARY = [
  PLACEHOLDER_IMAGE,
  ...new Set(PRODUCTS.map((product) => product.images[0])),
];
