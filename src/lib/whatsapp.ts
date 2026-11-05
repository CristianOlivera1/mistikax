export type WhatsAppLinkTarget = "product" | "consultation" | "order";

const WA_BASE = "https://wa.me";

export function buildWhatsAppLink(phone: string, message: string): string {
  return `${WA_BASE}/${phone}?text=${encodeURIComponent(message)}`;
}
