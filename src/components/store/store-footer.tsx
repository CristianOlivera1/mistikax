import Link from "next/link";
import type { SiteSettings } from "@/features/settings/types";
import { buildWhatsAppLink } from "@/lib/whatsapp";

type StoreFooterProps = {
  categories: Array<{ id: string; name: string }>;
  settings: SiteSettings;
};

export function StoreFooter({ categories, settings }: StoreFooterProps) {
  return (
    <footer className="bg-clay border-t border-white/10 pt-20 pb-10 text-white">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="mb-20 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div>
            <Link
              href="/"
              className="font-heading mb-8 block text-3xl font-semibold tracking-[0.2em]"
            >
              MISTIKAX
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-white/80">
              {settings.description} Para niños, jóvenes y adultos. Calidad que
              se nota.
            </p>
          </div>
          <div>
            <h4 className="mb-8 text-xs font-bold tracking-widest text-white/60 uppercase">
              Tienda
            </h4>
            <ul className="space-y-4 text-sm font-medium">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    className="hover:text-white/70"
                    href={`/catalog?category=${category.id}`}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-8 text-xs font-bold tracking-widest text-white/60 uppercase">
              Ayuda
            </h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link className="hover:text-white/70" href="/size-guide">
                  Guía de tallas
                </Link>
              </li>
              <li>
                <Link className="hover:text-white/70" href="/pages/envios">
                  Envíos
                </Link>
              </li>
              <li>
                <Link className="hover:text-white/70" href="/pages/cambios">
                  Cambios y devoluciones
                </Link>
              </li>
              <li>
                <Link className="hover:text-white/70" href="/pages/nosotros">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link className="hover:text-white/70" href="/pages/contacto">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-8 text-xs font-bold tracking-widest text-white/60 uppercase">
              Contacto
            </h4>
            <ul className="space-y-6 text-sm">
              <li>
                <span className="mb-1 block text-xs text-white/60">
                  Dirección
                </span>
                {settings.address}
                <br />
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="hover:text-white/70"
                >
                  {settings.contactEmail}
                </a>
              </li>
              <li>
                <span className="mb-1 block text-xs text-white/60">
                  Ventas / WhatsApp
                </span>
                <a
                  href={buildWhatsAppLink(
                    settings.whatsapp,
                    "Hola, tengo una consulta",
                  )}
                  target="_blank"
                  rel="noopener"
                  className="font-heading text-xl tracking-wide hover:text-white/80"
                >
                  {settings.whatsapp}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-[10px] tracking-widest text-white/50 uppercase md:flex-row">
          <p>
            © {new Date().getFullYear()} Mistikax Tienda de Ropa. Todos los
            derechos reservados.
          </p>
          <div className="flex gap-6">
            <Link
              href="/pages/privacidad"
              className="hover:text-white"
            >
              Política de privacidad
            </Link>
            <Link
              href="/pages/terminos-del-servicio"
              className="hover:text-white"
            >
              Términos del servicio
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
