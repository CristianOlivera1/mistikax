import type { Role } from "@/lib/constants";

export type SettingsTab =
  "general" | "shipping" | "payments" | "team" | "appearance";

export type SiteSettings = {
  storeName: string;
  description: string;
  contactEmail: string;
  whatsapp: string;
  address: string;
  stockThreshold: number;
  shippingLimaCents: number;
  shippingLimaOuterCents: number;
  shippingProvincesCents: number;
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  courierEnabled: boolean;
  freeShippingCents: number;
  leadTime: string;
  paymentCard: boolean;
  paymentTransfer: boolean;
  paymentCod: boolean;
  paymentWallet: boolean;
  transferInstructions: string;
  primaryColor: string;
  accentColor: string;
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
};

export const SETTINGS_TABS: Array<{
  value: SettingsTab;
  label: string;
}> = [
  { value: "general", label: "General" },
  { value: "shipping", label: "Envíos" },
  { value: "payments", label: "Pagos" },
  { value: "team", label: "Equipo" },
  { value: "appearance", label: "Apariencia" },
];
