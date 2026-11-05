import type { SiteSettings, TeamMember } from "./types";

export const SITE_SETTINGS: SiteSettings = {
  storeName: "Mistikax",
  description: "Ropa y calzado para hombre.",
  contactEmail: "hola@mistikax.com",
  whatsapp: "51999888777",
  address: "Calle Principal 101, Ciudad",
  stockThreshold: 5,
  shippingCents: 1_500,
  freeShippingCents: 20_000,
  leadTime: "24-48 horas",
  paymentCard: true,
  paymentTransfer: true,
  paymentCod: true,
  paymentWallet: false,
  transferInstructions: "Banco: ____ / Cuenta: ____ / Titular: ____",
  primaryColor: "#D4C5B9",
  accentColor: "#857262",
};

export const TEAM: TeamMember[] = [
  {
    id: "admin",
    name: "Administrador",
    email: "admin@mistikax.com",
    role: "admin",
  },
  {
    id: "maria",
    name: "María Rojas",
    email: "maria@mistikax.com",
    role: "editor",
  },
];
