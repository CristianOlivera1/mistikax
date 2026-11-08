import { TERMS_AND_CONDITIONS } from "./legal";
import type { ContentPage, FaqItem, HomeContent } from "./types";

const DAY_MS = 86_400_000;

function daysAgo(days: number): string {
  return new Date(Date.now() - days * DAY_MS).toISOString();
}

export const HOME_CONTENT: HomeContent = {
  announcement: {
    visible: true,
    text: "Envío gratis desde S/ 200 · Cambios en 7 días",
  },
  hero: {
    title: "Mistikax",
    subtitle:
      "Ropa y calzado para hombre. Para niños, jóvenes y adultos, en todas las tallas.",
    cta: "Ver catálogo",
    link: "/catalog",
    image: "/images/products/camisa-lino.svg",
  },
  sections: [
    { id: "age", label: "Compra por edad", visible: true },
    { id: "categories", label: "Categorías", visible: true },
    { id: "best-sellers", label: "Más vendidos", visible: true },
    { id: "benefits", label: "Beneficios", visible: true },
    { id: "new", label: "Novedades", visible: true },
    { id: "steps", label: "Compra en 4 pasos", visible: true },
    { id: "faq", label: "Preguntas frecuentes", visible: true },
  ],
};

export const PAGES: ContentPage[] = [
  {
    id: "about",
    title: "Nosotros",
    body: "Mistikax es una tienda de ropa y calzado para hombre.\n\nVestimos a niños, jóvenes y adultos con prendas cómodas y de buena calidad.",
    seoDescription: "Conoce Mistikax, ropa y calzado para hombre.",
    status: "published",
    updatedAt: daysAgo(12),
  },
  {
    id: "shipping",
    title: "Envíos",
    body: "Preparamos tu pedido en 24 a 48 horas.\n\nEl envío es gratis desde S/ 200.",
    seoDescription: "Tiempos, costos y cobertura de envío.",
    status: "published",
    updatedAt: daysAgo(8),
  },
  {
    id: "returns",
    title: "Cambios y devoluciones",
    body: "Tienes 7 días para cambiar la talla.\n\nLa prenda debe estar sin uso y con etiquetas.",
    seoDescription: "Cambios y devoluciones dentro de los 7 días.",
    status: "published",
    updatedAt: daysAgo(8),
  },
  {
    id: "contact",
    title: "Contacto",
    body: "Escríbenos por WhatsApp o a hola@mistikax.com.",
    seoDescription: "Canales de atención de Mistikax.",
    status: "published",
    updatedAt: daysAgo(20),
  },
  {
    ...TERMS_AND_CONDITIONS,
    updatedAt: daysAgo(2),
  },
  {
    id: "privacy",
    title: "Política de privacidad",
    body: "",
    seoDescription: "",
    status: "draft",
    updatedAt: daysAgo(30),
  },
];

export const FAQS: FaqItem[] = [
  {
    id: "faq-1",
    question: "¿Cómo elijo mi talla y qué pasa si no me queda?",
    answer:
      "Cada producto tiene su guía de tallas. Si no te queda, cambias la talla dentro de los 7 días.",
  },
  {
    id: "faq-2",
    question: "¿Cuánto tarda el envío y cuánto cuesta?",
    answer:
      "Preparamos tu pedido en 24-48 horas. El envío es gratis desde S/ 200.",
  },
  {
    id: "faq-3",
    question: "¿Qué formas de pago aceptan?",
    answer: "Tarjeta, transferencia y pago contra entrega según tu zona.",
  },
];
