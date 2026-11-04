export const STORE = {
  name: "Mistikax",
  email: "hola@mistikax.com",
  currency: "PEN",
  locale: "es-PE",
} as const;

export const ROLES = {
  admin: "Administrador",
  editor: "Editor",
} as const;

export type Role = keyof typeof ROLES;

export const AGE_GROUPS = {
  kids: "Niños",
  teens: "Jóvenes",
  adults: "Adultos",
} as const;

export const PRODUCT_STATUSES = {
  active: "Activo",
  draft: "Borrador",
  archived: "Archivado",
} as const;

export const ORDER_STATUSES = {
  pending: "Pendiente",
  paid: "Pagado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
} as const;
