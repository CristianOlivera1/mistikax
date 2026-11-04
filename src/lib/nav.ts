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

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findNavItem(pathname: string): NavItem | undefined {
  return ADMIN_NAV_ITEMS.filter((item) =>
    isNavItemActive(pathname, item.href),
  ).sort((a, b) => b.href.length - a.href.length)[0];
}
