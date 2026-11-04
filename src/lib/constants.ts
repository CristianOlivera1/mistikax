export const STORE = {
  name: "Mistikax",
  email: "hola@mistikax.com",
  currency: "PEN",
  currencySymbol: "S/",
  locale: "es-PE",
} as const;

export const ROLES = {
  admin: "Administrador",
  editor: "Editor",
} as const;

export type Role = keyof typeof ROLES;

export const ADMIN_USER = {
  name: "Administrador",
  email: "admin@mistikax.com",
  role: "admin",
} as const satisfies { name: string; email: string; role: Role };

export const AGE_GROUPS = {
  kids: "Niños",
  teens: "Jóvenes",
  adults: "Adultos",
} as const;

export type AgeGroup = keyof typeof AGE_GROUPS;

export const PRODUCT_STATUSES = {
  active: "Activo",
  draft: "Borrador",
  archived: "Archivado",
} as const;

export type ProductStatus = keyof typeof PRODUCT_STATUSES;

export const ORDER_STATUSES = {
  pending: "Pendiente",
  paid: "Pagado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
} as const;

export type OrderStatus = keyof typeof ORDER_STATUSES;
