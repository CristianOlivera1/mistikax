export type AdminBadgeCounts = {
  pendingOrders: number;
  lowStock: number;
};

export type AdminSearchItem = {
  id: string;
  label: string;
  href: string;
  group: string;
  icon: string;
};

export type NavBadge = keyof AdminBadgeCounts;

export type NavItem = {
  label: string;
  href: string;
  icon: string;
  badge?: NavBadge;
};

export type NavGroup = {
  label: string | null;
  items: NavItem[];
};

export const ADMIN_NAV: NavGroup[] = [
  {
    label: null,
    items: [
      { label: "Resumen", href: "/admin", icon: "lucide:layout-dashboard" },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { label: "Productos", href: "/admin/products", icon: "lucide:package" },
      { label: "Categorías", href: "/admin/categories", icon: "lucide:layers" },
      {
        label: "Inventario",
        href: "/admin/inventory",
        icon: "lucide:archive",
        badge: "lowStock",
      },
    ],
  },
  {
    label: "Ventas",
    items: [
      {
        label: "Pedidos",
        href: "/admin/orders",
        icon: "lucide:shopping-cart",
        badge: "pendingOrders",
      },
      { label: "Clientes", href: "/admin/customers", icon: "lucide:users" },
      { label: "Descuentos", href: "/admin/coupons", icon: "lucide:percent" },
    ],
  },
  {
    label: "Contenido",
    items: [
      {
        label: "Portada y banners",
        href: "/admin/content/home",
        icon: "lucide:layout-template",
      },
      {
        label: "Páginas",
        href: "/admin/content/pages",
        icon: "lucide:file-text",
      },
      {
        label: "Preguntas frecuentes",
        href: "/admin/content/faqs",
        icon: "lucide:info",
      },
      { label: "Medios", href: "/admin/media", icon: "lucide:image" },
    ],
  },
  {
    label: "Sistema",
    items: [
      {
        label: "Configuración",
        href: "/admin/settings",
        icon: "lucide:settings",
      },
    ],
  },
];

export const ADMIN_NAV_ITEMS = ADMIN_NAV.flatMap((group) => group.items);

export type AdminRole = "admin" | "editor";

const EDITOR_HREFS = new Set([
  "/admin",
  "/admin/products",
  "/admin/categories",
  "/admin/inventory",
  "/admin/content/home",
  "/admin/content/pages",
  "/admin/content/faqs",
  "/admin/media",
]);

const EDITOR_PREFIXES = [
  "/admin/products",
  "/admin/categories",
  "/admin/inventory",
  "/admin/content",
  "/admin/media",
];

export function filterAdminNavForRole(role: AdminRole): NavGroup[] {
  if (role === "admin") return ADMIN_NAV;

  return ADMIN_NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => EDITOR_HREFS.has(item.href)),
  })).filter((group) => group.items.length > 0);
}

export function canAccessAdminPath(role: AdminRole, pathname: string): boolean {
  if (role === "admin") return true;
  if (pathname === "/admin") return true;

  return EDITOR_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findNavItem(pathname: string): NavItem | undefined {
  return ADMIN_NAV_ITEMS.filter((item) =>
    isNavItemActive(pathname, item.href),
  ).sort((a, b) => b.href.length - a.href.length)[0];
}

export type StoreNavItem = {
  label: string;
  href: string;
};

export const STORE_NAV: StoreNavItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Niños", href: "/catalog?age=kids" },
  { label: "Jóvenes", href: "/catalog?age=teens" },
  { label: "Adultos", href: "/catalog?age=adults" },
  { label: "Polos", href: "/catalog?category=polos" },
  { label: "Calzado", href: "/catalog?category=calzado" },
  { label: "Gorras", href: "/catalog?category=gorras" },
  { label: "Ofertas", href: "/catalog?sale=1" },
  { label: "Contacto", href: "/pages/contacto" },
];

export const STORE_MOBILE_NAV: StoreNavItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Niños", href: "/catalog?age=kids" },
  { label: "Jóvenes", href: "/catalog?age=teens" },
  { label: "Adultos", href: "/catalog?age=adults" },
  { label: "Polos", href: "/catalog?category=polos" },
  { label: "Camisas", href: "/catalog?category=camisas" },
  { label: "Pantalones", href: "/catalog?category=pantalones" },
  { label: "Casacas", href: "/catalog?category=casacas" },
  { label: "Calzado", href: "/catalog?category=calzado" },
  { label: "Gorras", href: "/catalog?category=gorras" },
  { label: "Accesorios", href: "/catalog?category=accesorios" },
  { label: "Ofertas", href: "/catalog?sale=1" },
  { label: "Guía de tallas", href: "/size-guide" },
  { label: "Contacto", href: "/pages/contacto" },
];
