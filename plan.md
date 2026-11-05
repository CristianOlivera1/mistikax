# Plan de migración — Mistikax

> **Estado:** Fase 3 completada. `dashboard.html` y `client.html` siguen siendo la referencia visual; el panel ya tiene shell, Resumen, catálogo, ventas y contenido con fixtures. La autenticación real (Supabase Auth) y la base de datos siguen pendientes.

Este plan convierte el panel de `dashboard.html` en una aplicación Next.js 16 con componentes reutilizables, y deja preparada la migración futura de `client.html`. La prioridad es que cada pantalla del admin quede cubierta, que el código sea mantenible y que la tienda pueda reutilizar la misma base técnica.

## Decisiones cerradas

| Tema | Decisión |
| --- | --- |
| Estructura | Una sola app Next.js con route groups `(store)` y `(admin)`; un despliegue |
| Base de datos | Supabase Postgres, con Drizzle ORM y migraciones en el repo |
| Autenticación | Supabase Auth con `@supabase/ssr` y cookies, con dos roles por ahora: `admin` y `editor` |
| UI | shadcn/ui + Tailwind CSS v4 + Iconify |
| Temas | Dos temas sobre una misma base de primitivas: admin denso y tienda editorial |
| Imágenes | Locales: contenido en `public/images`, logos en `public/svg`, subidas en `storage/uploads`; sin Supabase Storage |
| Datos | Server Components para lectura, Server Actions + Zod para escritura |
| Idioma | Código, archivos y base de datos en inglés; copy de UI en español (`es-PE`) |
| Paquete | pnpm |
| Despliegue | Node autoalojado con disco persistente; el sistema de archivos local es requisito |

## Ruta rápida

| # | Fase | Resultado | ¿Necesita Supabase? |
| --- | --- | --- | --- |
| 0 | Fundaciones | Completada: Next en `src/`, shadcn, temas, fuentes, login visual, scripts | No |
| 1 | Shell y kit del admin | Completada: navegación, layout, primitivas y Resumen con fixtures | No |
| 2 | Catálogo (UI) | Completada: productos, editor, categorías e inventario con fixtures | No |
| 3 | Ventas y contenido (UI) | Completada: pedidos, clientes, descuentos, CMS y ajustes con fixtures | No |
| 4 | Catálogo de punta a punta | Drizzle, seed, CRUD real y subidas locales | Sí |
| 5 | Ventas y contenido de punta a punta | Pedidos, transacciones, CMS y ajustes persistentes | Sí |
| 6 | Auth y roles | Login, sesiones, permisos y equipo | Sí |
| 7 | Tienda pública | Migración completa de `client.html` | Sí |
| 8 | Calidad y salida | Tests, accesibilidad, rendimiento y checklist de lanzamiento | Sí |

Las fases 0 a 3 se pueden ejecutar sin tocar Supabase. La fase 4 es el primer punto donde se conecta la base de datos.

---

## 1. Estado actual

### Medición de los prototipos

| Archivo | Tamaño | Líneas | Qué contiene |
| --- | --- | --- | --- |
| `dashboard.html` | ~68 KB | ~479 | Admin completo: CSS, datos seed, router hash y todas las vistas en un archivo |
| `client.html` | ~49 KB | ~560 | Tienda: home, catálogo, producto, carrito, checkout por WhatsApp y páginas informativas |

Ambos usan Tailwind por CDN, fuentes de Google por `<link>`, un router basado en `location.hash` y plantillas de string con `innerHTML`. `dashboard.html` persiste todo en `localStorage`; `client.html` mantiene el carrito en el navegador. No hay backend, autenticación ni tests de los prototipos.

La Fase 0 dejó en `src/app` el layout raíz, los dos temas, las fuentes locales, el placeholder de tienda, el placeholder de admin y `/login`. La Fase 1 añadió el shell del panel y el Resumen. La Fase 2 añadió el catálogo (productos, categorías e inventario) con fixtures. La Fase 3 añadió pedidos, clientes, descuentos, contenido, medios y ajustes con fixtures; la base de datos se conecta en la Fase 4.

La migración es una reescritura de la capa de presentación, no un copiado de HTML. Los strings con `${...}` no se pueden trasladar a JSX sin convertirlos en componentes y sin eliminar los riesgos de inyección.

### Inventario del admin

| Módulo | Funcionalidad actual | Ruta objetivo | Fase |
| --- | --- | --- | --- |
| Resumen | KPIs, gráfico de ventas, pedidos pendientes, stock bajo, recientes, más vendidos | `/admin` | 1 |
| Productos | Tabla con búsqueda y filtros, duplicar, eliminar, estados | `/admin/products` | 2 |
| Editor de producto | Información, imágenes, stock por talla, colores, SEO, publicación, precio | `/admin/products/new` · `/admin/products/[id]` | 2 |
| Categorías | Lista y formulario; tipo de talla por categoría | `/admin/categories` | 2 |
| Inventario | Stock bajo por producto y talla | `/admin/inventory` | 2 |
| Pedidos | Tabs por estado, búsqueda, tabla, detalle, historial, notas | `/admin/orders` · `/admin/orders/[id]` | 3 |
| Clientes | Derivados de los pedidos; búsqueda | `/admin/customers` | 3 |
| Descuentos | CRUD, activación, vencimiento y usos | `/admin/coupons` | 3 |
| Portada y banners | Barra de anuncio, hero, orden y visibilidad de secciones, preview | `/admin/content/home` | 3 |
| Páginas | Lista, creación, editor, SEO, estado y preview | `/admin/content/pages` · `/admin/content/pages/[id]` | 3 |
| Preguntas frecuentes | CRUD y orden | `/admin/content/faqs` | 3 |
| Medios | Grid, subida, copiar URL, eliminar | `/admin/media` | 3 |
| Configuración | General, envíos, pagos, equipo y apariencia | `/admin/settings?tab=general` | 3 |
| Shell | Sidebar responsive, breadcrumbs, búsqueda global, notificaciones, toasts | `(admin)/admin/layout.tsx` | 1 |

### Funciones de demostración que no se migran tal cual

- `Restablecer datos`: elimina el seed de `localStorage`. En producción se reemplaza por migraciones y un seed controlado.
- `Exportar JSON`: puede convertirse en una exportación real desde la base; no se implementa hasta la fase 5.
- Equipo sin autenticación: la tabla de miembros existe, pero los roles no protegen nada. Se conecta en la fase 6.
- Imágenes base64 y URLs de Unsplash: el catálogo ya usa SVG locales; las subidas y el resto de assets locales llegan en las fases 4 y 7.
- Datos diarios simulados: el gráfico del Resumen se calcula desde pedidos reales, no desde una tabla `daily_sales`.

---

## 2. Arquitectura objetivo

```text
Request
  ├─ /(store)/...    → StoreLayout    → feature components → queries
  ├─ /(admin)/...    → auth guard     → AdminLayout      → feature components
  │                                                   → server actions → db
  └─ /(auth)/login   → LoginForm     → Supabase Auth
```

### Estructura de carpetas

```text
mistikax/
├─ public/
│  ├─ images/                      # imágenes de contenido versionadas
│  └─ svg/                         # logos e isotipos existentes
├─ storage/
│  └─ uploads/                     # gitignored; volumen persistente en producción
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx                # html, idioma, metadata raíz
│  │  ├─ globals.css               # Tailwind v4 + tokens de los dos temas
│  │  ├─ error.tsx
│  │  ├─ not-found.tsx
│  │  ├─ robots.ts
│  │  ├─ sitemap.ts
│  │  ├─ (auth)/
│  │  │  └─ login/page.tsx
│  │  ├─ (store)/
│  │  │  ├─ layout.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ catalogo/page.tsx
│  │  │  ├─ producto/[slug]/page.tsx
│  │  │  ├─ carrito/page.tsx
│  │  │  ├─ checkout/page.tsx
│  │  │  ├─ paginas/[slug]/page.tsx
│  │  │  ├─ guia-de-tallas/page.tsx
│  │  │  └─ faq/page.tsx
│  │  ├─ (admin)/
│  │  │  └─ admin/
│  │  │     ├─ layout.tsx
│  │  │     ├─ page.tsx
│  │  │     ├─ products/
│  │  │     │  ├─ page.tsx
│  │  │     │  ├─ new/page.tsx
│  │  │     │  └─ [id]/page.tsx
│  │  │     ├─ categories/page.tsx
│  │  │     ├─ inventory/page.tsx
│  │  │     ├─ orders/
│  │  │     │  ├─ page.tsx
│  │  │     │  └─ [id]/page.tsx
│  │  │     ├─ customers/page.tsx
│  │  │     ├─ coupons/page.tsx
│  │  │     ├─ content/
│  │  │     │  ├─ home/page.tsx
│  │  │     │  ├─ pages/
│  │  │     │  │  ├─ page.tsx
│  │  │     │  │  ├─ new/page.tsx
│  │  │     │  │  └─ [id]/page.tsx
│  │  │     │  └─ faqs/page.tsx
│  │  │     ├─ media/page.tsx
│  │  │     └─ settings/page.tsx
│  │  └─ media/[...path]/route.ts   # sirve uploads locales
│  ├─ components/
│  │  ├─ ui/                        # shadcn generado; no se bifurca
│  │  ├─ admin/                     # shell y patrones del panel
│  │  ├─ store/                     # shell y patrones de la tienda
│  │  ├─ shared/                    # piezas usadas por ambas áreas
│  │  └─ icons/                     # wrapper de Iconify
│  ├─ features/
│  │  ├─ products/
│  │  │  ├─ components/
│  │  │  ├─ queries.ts
│  │  │  ├─ actions.ts
│  │  │  ├─ schema.ts
│  │  │  └─ types.ts
│  │  ├─ categories/
│  │  ├─ inventory/
│  │  ├─ orders/
│  │  ├─ customers/
│  │  ├─ coupons/
│  │  ├─ content/
│  │  ├─ media/
│  │  ├─ settings/
│  │  ├─ auth/
│  │  ├─ cart/
│  │  └─ checkout/
│  ├─ db/
│  │  ├─ schema/
│  │  │  ├─ catalog.ts
│  │  │  ├─ orders.ts
│  │  │  ├─ content.ts
│  │  │  ├─ profiles.ts
│  │  │  └─ index.ts                # agregador de esquema para Drizzle Kit
│  │  ├─ migrations/
│  │  ├─ client.ts
│  │  └─ seed.ts
│  ├─ lib/
│  │  ├─ auth.ts                    # requireUser / requireRole
│  │  ├─ env.ts
│  │  ├─ format.ts
│  │  ├─ money.ts
│  │  ├─ uploads.ts
│  │  ├─ utils.ts
│  │  └─ supabase/
│  │     ├─ client.ts
│  │     ├─ server.ts
│  │     └─ admin.ts
│  ├─ hooks/
│  ├─ proxy.ts                      # convención de Next 16; solo redirecciones
│  └─ types/
├─ tests/
│  └─ e2e/                          # Playwright; Vitest va junto al módulo
├─ components.json
├─ drizzle.config.ts
├─ .env.example
├─ CLAUDE.md
└─ plan.md
```

### Límites entre capas

| Capa | Puede importar | No puede importar |
| --- | --- | --- |
| `app` | `features`, `components`, `lib` | lógica de negocio propia |
| `features/*` | `db`, `lib`, `components/ui`, `components/shared`, `components/admin` | `app` ni internals de otra feature |
| `components/admin` y `store` | `components/ui`, `components/shared`, `lib` | `db` ni acciones de features |
| `components/ui` | `lib/utils` | `features`, `db` o `app` |

Reglas adicionales:

- No hay archivos `index.ts` de reexportación. La única excepción es `src/db/schema/index.ts`, que Drizzle Kit usa para descubrir el esquema.
- Los módulos de servidor llevan `import "server-only"`.
- Las páginas no consultan la base directamente: llaman a `features/<dominio>/queries.ts`.
- Los filtros y tabs viven en `searchParams`, no en estado global.
- `src/proxy.ts` solo hace redirecciones grupales; la autorización se repite en el layout del admin y en cada acción protegida.
- En Next.js 16, `params` y `searchParams` son promesas. Se resuelven con `await`.

### Rutas y nombres

- **Tienda:** URLs en español, porque son públicas y SEO. `/catalogo`, `/producto/[slug]`, `/carrito`, `/checkout`, `/paginas/[slug]`, `/guia-de-tallas`, `/faq`.
- **Admin:** URLs en inglés, porque es una herramienta interna y coincide con el dominio del código. `/admin/products`, `/admin/orders`, `/admin/content/pages`.
- Esta es la única excepción a la regla de nombres en inglés: los segmentos públicos de la tienda son copy orientado al usuario, no API interna.
- **Login:** `/login`, fuera del layout protegido, para evitar bucles de redirección.
- Los slugs de producto y de página son estables. Un cambio de slug requiere redirect.
- Los identificadores de base de datos y de archivos son ingleses; los textos de interfaz son españoles.

---

## 3. Sistema de diseño

### Dos temas, una base

| Token | Admin | Tienda |
| --- | --- | --- |
| Tipografía | Geist + Geist Mono | Manrope, Oswald, Montserrat y Space Mono |
| Base | 13px, densidad alta | 16px, escala editorial |
| Fondo | `#fafafa` / tarjetas blancas | `#FEFDFB` / superficies `#F9F7F5` |
| Texto | `#171717`, muted `#666666` | `#1A1A1A`, muted `#7F7F7F` |
| Acento | Azul `#0070f3` | Premium `#D4C5B9` / hover `#A89B90` |
| Bordes | `#eaeaea` | `#E8E8E8` |
| Radio | 8px | 0px |
| Controles | 32px de alto | Bloques amplios, sin radio |
| Estados | `ok`, `warn`, `bad`, `violet` | `success`, `error` |

Implementación:

- `src/app/globals.css` contiene `@import "tailwindcss"` y los tokens con `@theme`.
- Los layouts aplican `.theme-admin` o `.theme-store`; no hay selector de tema ni modo oscuro en el alcance actual.
- Los componentes usan tokens semánticos de shadcn (`background`, `foreground`, `card`, `muted`, `border`, `primary`, `destructive`). Los colores de marca de la tienda se exponen como tokens propios (`premium`, `surface`, `taupe`).
- Las fuentes se cargan con `next/font`, no con `<link>` a Google Fonts. El admin carga Geist; la tienda carga solo los pesos que usa.
- La base de 13px del admin se ajusta en los tokens tipográficos del tema, no con `style` en cada pantalla.
- No se crea `tailwind.config.js`: Tailwind v4 es CSS-first.

### Componentes

| Capa | Contenido | Regla |
| --- | --- | --- |
| `components/ui` | Button, Card, Input, Label, Select, Textarea, Switch, Dialog, Sheet, Tabs, Table, Badge, Command, Dropdown, Tooltip, Skeleton, Sonner | Generado por shadcn; se ajusta por variantes y tokens, no se bifurca |
| `components/shared` | `PageHeader`, `SectionCard`, `StatCard`, `StatusBadge`, `EmptyState`, `Money`, `DateText`, `ProductThumb`, `ConfirmDialog`, `FormField` | Sin lógica de negocio |
| `components/admin` | `AdminSidebar`, `AdminTopbar`, `Breadcrumbs`, `CommandPalette`, `DataTable`, `FilterBar`, `TabsNav` | Solo presentación y navegación |
| `components/store` | `StoreHeader`, `StoreFooter`, `ProductCard`, `ProductGrid`, `CartSheet`, `Hero`, `SectionHeading` | Reutilizable entre páginas de tienda |
| `features/*/components` | Formularios y piezas específicas del dominio | Pueden llamar acciones y usar tipos de la feature |

### Iconos

- Un único wrapper en `components/icons` sobre `@iconify/react/offline`.
- Set por defecto: `lucide`. Los logos de marca siguen siendo SVG locales, no iconos de UI.
- Solo se empaqueta el subconjunto de iconos usado (`src/components/icons/icon-data.ts`); no se consulta `api.iconify.design` en runtime.
- Los componentes generados de shadcn conservan sus imports internos de `lucide-react`; el código de la aplicación usa exclusivamente el wrapper de Iconify. Los botones que solo tienen icono requieren `aria-label`.
- Cada reemplazo de `ic('...')` del prototipo se mapea a un icono Lucide equivalente; al añadir un icono nuevo, se agrega al subconjunto local.

### Dependencias

| Dependencia | Uso | Estado |
| --- | --- | --- |
| `shadcn`, `radix-ui`, `class-variance-authority`, `cn` | Primitivas, variantes y `cn()` | Instalado en Fase 0 |
| `lucide-react` | Iconos internos de los componentes shadcn | Instalado, solo en `components/ui` |
| `tw-animate-css` | Animaciones de shadcn | Instalado |
| `@iconify/react`, `@iconify-json/lucide` | Iconos de la aplicación y subconjunto local | Instalado |
| `sonner`, `cmdk` | Toasts y command palette | Instalado |
| `react-hook-form`, `@hookform/resolvers`, `zod` | Formularios y validación | Instalado |
| `server-only` | Protección de módulos de servidor | Instalado |
| `prettier`, `prettier-plugin-tailwindcss` | Formato consistente y orden de clases | Instalado |
| `recharts` | Gráfico de ventas del Resumen | Pendiente |
| `@tanstack/react-table` | Tablas con orden y paginación cuando haga falta | Pendiente |
| `drizzle-orm`, `postgres`, `drizzle-kit` | Base de datos y migraciones | Instalado en Fase 4 |
| `@supabase/supabase-js`, `@supabase/ssr` | Auth, sesiones con cookies y Admin API | Pendiente (Fase 6) |
| `date-fns` | Fechas y rangos | Pendiente |
| `vitest`, `@testing-library/react`, `playwright` | Pruebas | Pendiente |

Las versiones se verifican al iniciar cada fase; no se instala una alternativa sin actualizar este plan.

### Qué se elimina

- Tailwind por CDN y el bloque `<style type="text/tailwindcss">`.
- Los strings de HTML y los event handlers inline.
- `localStorage` como base de datos.
- Las URLs de Unsplash del seed.
- Los modales, toasts, switches y tablas artesanales: pasan a shadcn/Sonner.
- El router hash y los `data-act` globales: pasan a rutas y Server Actions.

---

## 4. Inventario de componentes del admin

### Reemplazos transversales

| En el prototipo | En Next.js |
| --- | --- |
| `page()` | `PageHeader` + layout de página |
| `stat()` | `StatCard` |
| `tbl()` | `DataTable` sobre shadcn `Table` |
| `bdg()`, `oBdg()`, `pBdg()`, `sBdg()` | `StatusBadge` con variantes |
| `empty()` | `EmptyState` |
| `modal()` | `Dialog` o `AlertDialog` |
| `fld()`, `sw()` | `FormField`, `SwitchField` |
| `toast()` | Sonner |
| `renderNav()` | `AdminSidebar` |
| `ic()` | `Icon` de Iconify |
| `money()`, `fdate()` | `formatMoney`, `formatDate` |
| `thumb()`, `im()` | `ProductThumb` y `next/image` |
| Router hash | Rutas del App Router |
| `localStorage` | Drizzle + Postgres |

### Componentes por módulo

| Área | Componentes reutilizables |
| --- | --- |
| Shell | `AdminShell`, `AdminSidebar`, `NavGroup`, `NavItem`, `AdminTopbar`, `Breadcrumbs`, `CommandPalette`, `UserMenu`, `NotificationsMenu`, `MobileNav` |
| Resumen | `KpiGrid`, `SalesChart`, `AttentionList`, `RecentOrdersCard`, `TopProductsCard`, `RangeSelect` |
| Productos | `ProductsTable`, `ProductFilters`, `ProductForm`, `ProductInfoCard`, `ProductImagesCard`, `ImagePicker`, `ProductStockCard`, `StockGrid`, `ProductColorsCard`, `ProductSeoCard`, `ProductPublishCard`, `ProductOrganizationCard`, `ProductPriceCard`, `ProductRowActions` |
| Categorías | `CategoriesTable`, `CategoryDialog`, `CategoryForm`, `SizeTypeSelect` |
| Inventario | `InventoryTable`, `StockBadge`, `LowStockSummary` |
| Pedidos | `OrdersTable`, `OrderStatusTabs`, `OrderSearch`, `OrderSummary`, `OrderItemsCard`, `OrderCustomerCard`, `OrderTimeline`, `OrderNotes`, `OrderStatusActions`, `OrderTotals` |
| Clientes y descuentos | `CustomersTable`, `CustomerIdentity`, `CouponsTable`, `CouponDialog`, `CouponForm` |
| Contenido | `HomeContentForm`, `AnnouncementCard`, `HeroContentCard`, `SectionOrderList`, `HeroPreview`, `PagesTable`, `PageEditor`, `PagePreview`, `FaqList`, `FaqDialog`, `FaqPositionControls` |
| Medios | `MediaGrid`, `MediaCard`, `MediaUploader`, `MediaPicker`, `MediaCopyButton` |
| Ajustes | `SettingsTabs`, `GeneralSettingsForm`, `ShippingSettingsForm`, `PaymentSettingsForm`, `TeamTable`, `InviteMemberDialog`, `AppearanceForm` |
| Estados y feedback | `EmptyState`, `ErrorState`, `TableSkeleton`, `PageSkeleton`, `ConfirmDialog`, `FormField`, `FieldHint`, `FieldError` |

### Reglas de extracción

- Un componente se extrae cuando se repite o cuando su archivo deja de ser legible; no antes.
- Los formularios grandes se parten por sección (`ProductInfoCard`, `ProductStockCard`), no por campo.
- Las tablas reciben columnas y datos; no consultan la base.
- Los diálogos reciben `open`, `onOpenChange` y un formulario; no implementan su propio overlay.
- Las páginas no contienen lógica de negocio: componen features y layouts.
- Los client components se limitan a formularios, menús, drawers, filtros interactivos y gráficos.

---

## 5. Modelo de datos propuesto

Drizzle define el esquema en `src/db/schema`. Las migraciones viven en el repo; no se edita el esquema desde el panel de Supabase.

| Tabla | Campos clave | Notas |
| --- | --- | --- |
| `categories` | `id`, `slug`, `name`, `size_type`, `position` | `size_type`: `clothing`, `footwear`, `one_size` |
| `products` | `id`, `slug`, `name`, `description`, `seo_description`, `category_id`, `age_group`, `status`, `price_cents`, `compare_at_cents`, `is_new`, `is_best_seller`, `sold_count`, `created_at`, `updated_at` | `status`: `active`, `draft`, `archived`; `age_group`: `kids`, `teens`, `adults` |
| `product_images` | `id`, `product_id`, `path`, `alt`, `position` | La posición 0 es la principal; `path` es relativo al directorio de uploads |
| `product_sizes` | `product_id`, `size`, `stock` | Clave compuesta; el stock es por talla, como en el prototipo |
| `colors` | `id`, `name`, `hex` | Paleta normalizada; el prototipo usa claves como `ng`, `bl`, `az` |
| `product_colors` | `product_id`, `color_id` | Relación N:M |
| `orders` | `id`, `number`, `customer_name`, `email`, `phone`, `city`, `address`, `status`, `payment_method`, `shipping_cents`, `subtotal_cents`, `total_cents`, `note`, `created_at`, `updated_at` | `status`: `pending`, `paid`, `shipped`, `delivered`, `cancelled`; `number` es el número humano |
| `order_items` | `id`, `order_id`, `product_id`, `product_name`, `size`, `color_name`, `unit_price_cents`, `quantity` | Guarda snapshot del nombre, talla y color; el producto puede archivarse |
| `order_status_history` | `id`, `order_id`, `status`, `changed_by`, `created_at` | Historial visible en el detalle |
| `coupons` | `id`, `code`, `kind`, `value`, `uses`, `expires_at`, `active` | `kind`: `percent` o `fixed`; `value` es porcentaje entero o centavos |
| `pages` | `id`, `slug`, `title`, `body`, `seo_description`, `status`, `updated_at` | `body` es texto plano con párrafos separados por línea en blanco |
| `faqs` | `id`, `question`, `answer`, `position` | Orden explícito |
| `media` | `id`, `path`, `filename`, `mime_type`, `size_bytes`, `width`, `height`, `created_by`, `created_at` | Metadatos del archivo local |
| `site_settings` | `id`, `store_name`, `description`, `email`, `whatsapp`, `address`, `currency`, `low_stock_threshold`, `shipping_cents`, `free_shipping_threshold_cents`, `lead_time`, `payment flags`, `transfer_instructions`, `primary_color`, `accent_color` | Fila única; alimenta la tienda y el admin |
| `home_content` | `announcement_enabled`, `announcement_text`, `hero_title`, `hero_subtitle`, `hero_cta`, `hero_link`, `hero_image`, `updated_at` | Fila única |
| `home_sections` | `id`, `kind`, `enabled`, `position` | Orden de las secciones de la portada |
| `profiles` | `id` (uuid, FK `auth.users`), `full_name`, `role`, `active`, `created_at` | Rol `admin`/`editor`; se crea con un trigger al registrarse; el email vive en `auth.users` |

Decisiones del modelo:

- **No hay tabla `customers` al inicio:** se derivan de los pedidos, como en el prototipo. Se añade cuando existan cuentas de cliente.
- **No hay `daily_sales`:** el gráfico se calcula agregando pedidos por día con SQL.
- **No hay tabla de carrito:** el carrito de invitado vive en una cookie firmada; los precios y el stock se revalidan al crear el pedido.
- **Dinero en centavos:** evita errores de coma flotante. La UI formatea con `Intl.NumberFormat("es-PE", ...)`.
- **Fechas en UTC:** se convierten a `es-PE` solo al renderizar.
- **Pedidos y productos no se borran físicamente:** se cancelan o archivan. Los items guardan snapshot.
- **Restaurar stock:** solo al cancelar un pedido que aún no fue enviado; se hace en una transacción junto con el historial.
- **Slugs estables:** si cambia el nombre, el slug no se regenera sin un redirect.

### Acceso a Supabase

- Los datos de la app usan `DATABASE_URL` (pooler) y `DIRECT_URL` (conexión directa para migraciones).
- Supabase Auth usa `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` mediante `@supabase/ssr`; las sesiones viven en cookies gestionadas por el servidor.
- `SUPABASE_SECRET_KEY` solo se usa en el servidor para operaciones de equipo (listar, invitar o desactivar usuarios). Nunca llega al cliente.
- Driver `postgres.js`; con el pooler de transacciones, `prepare: false`.
- No se usa la API REST de Supabase para datos de negocio. Toda consulta pasa por Drizzle en el servidor.
- El rol de base de datos debe tener los privilegios mínimos necesarios; no se expone la cadena de conexión al cliente.
- Supabase Auth gestiona `auth.users` y sus sesiones. La app mantiene `public.profiles` con rol y estado; el rol se lee de la base, nunca de `user_metadata`.
- RLS se habilita en las tablas expuestas como defensa en profundidad; la frontera de autorización sigue siendo el servidor.
- El seed inicial traduce los datos del prototipo a inglés, centavos y rutas locales de imagen. No se migran imágenes base64.

### Variables de entorno previstas

| Variable | Uso | Ámbito | Fase |
| --- | --- | --- | --- |
| `DATABASE_URL` | Conexión pooled de Postgres en runtime; `prepare: false` | Servidor | 4 |
| `DIRECT_URL` | Conexión directa solo para migraciones | Servidor | 4 |
| `UPLOAD_DIR` | Directorio de subidas locales; ruta absoluta en producción | Servidor | 4 |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase; cliente y servidor | Público | 6 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave publicable para Auth y sesiones; RLS protege los datos expuestos | Público | 6 |
| `SUPABASE_SECRET_KEY` | Admin API para gestionar usuarios del equipo; nunca en el cliente | Servidor | 6 |
| `CART_COOKIE_SECRET` | Firma de la cookie del carrito de invitado | Servidor | 7 |

`.env.example` se versiona con placeholders; los valores reales viven en `.env` y nunca se registran en git. La Fase 0 añadió la excepción `!.env.example` para que la plantilla sí se versione.

---

## 6. Fases de migración

### Fase 0 — Fundaciones y sistema de diseño · Completada

**Objetivo:** dejar el proyecto listo para recibir componentes, sin lógica de negocio.

- Mover `app/` a `src/app/` y actualizar `tsconfig` (`@/*` → `./src/*`).
- Inicializar shadcn/ui con Tailwind v4 y alias `@/components`, `@/lib/utils`, `@/hooks`, `@/components/ui`.
- Añadir las primitivas base: button, card, input, label, textarea, select, switch, dialog, sheet, tabs, table, badge, dropdown-menu, command, sonner, tooltip, skeleton, separator, alert-dialog, alert, checkbox, field.
- Definir tokens de admin y tienda en `globals.css`; cargar Geist, Manrope, Oswald, Montserrat y Space Mono con `next/font`.
- Crear `cn()`, `formatMoney`, `formatDate`, constantes de estados/roles/edades y validación de entorno con Zod.
- Crear la estructura inicial de `features`, `components` y `lib`; `db` y `tests` se añaden al iniciar sus fases.
- Añadir scripts `typecheck` y `format`; configurar Prettier con `prettier-plugin-tailwindcss` y Vitest cuando se escriba la primera prueba.
- Añadir `storage/uploads/*`, `!storage/uploads/.gitkeep` y `!.env.example` al `.gitignore`; crear `storage/uploads/.gitkeep` y documentar `UPLOAD_DIR`.
- Crear `/login` como pantalla visual con validación Zod y React Hook Form; la sesión real se conecta en la fase 6.

**Estado:** completada. `pnpm lint`, `pnpm typecheck` y `pnpm build` pasan; `/`, `/admin` y `/login` renderizan con sus temas y fuentes; no hay Supabase ni sesión.

**Siguiente:** Fase 1, shell del admin y primitivas de presentación.

### Fase 1 — Shell del admin, primitivas y Resumen

**Objetivo:** reconstruir el marco del panel y demostrar el kit de UI con datos tipados.

- `AdminLayout` con sidebar de 240px, drawer móvil, topbar, breadcrumbs, búsqueda global, notificaciones y menú de usuario.
- Command palette con navegación y búsqueda de productos.
- Primitivas: `PageHeader`, `StatCard`, `SectionCard`, `StatusBadge`, `EmptyState`, `ConfirmDialog`, `DataTable`, `FilterBar`, `TabsNav`, `FormField`, `SwitchField`, `ProductThumb`.
- Resumen con KPIs, gráfico Recharts, atención requerida, pedidos recientes y más vendidos, alimentado por fixtures tipados.
- Metadata `noindex` para todo el admin.
- Estados de carga con skeletons y estados vacíos.

**Salida:** todas las rutas del admin navegan con placeholders; el Resumen se ve como el prototipo; responsive en 375, 768 y 1280; navegación por teclado; sin `localStorage`.

**Estado:** completada. El layout incluye sidebar de 240px, drawer móvil, topbar, breadcrumbs, command palette, notificaciones y menú de usuario. El Resumen calcula KPIs y series desde fixtures tipados, con el rango en `searchParams`. `pnpm lint`, `pnpm typecheck` y `pnpm build` pasan. `FilterBar`, `TabsNav`, `FormField`, `SwitchField` y `ConfirmDialog` se extraen en las fases 2 y 3, cuando sus pantallas las usan.

**Siguiente:** Fase 2, catálogo con datos de prueba (completada).

### Fase 2 — Catálogo: UI completa · Completada

**Objetivo:** migrar las pantallas de catálogo a componentes con datos de prueba tipados.

- Lista de productos con búsqueda, filtros por categoría, edad y estado, y paginación; filtros en `searchParams`.
- Acciones de fila: duplicar y eliminar con confirmación.
- Editor de producto con las ocho secciones del prototipo: información, imágenes, stock por talla, colores, SEO, publicación, organización y precio.
- Formulario nuevo/edición con validación de cliente; el guardado queda pendiente de la fase 4.
- Categorías con tabla y diálogo de creación/edición; el tipo de talla controla las tallas disponibles.
- Inventario con stock bajo y detalle por talla.
- Imágenes de fixtures locales; se eliminan las URLs remotas.

**Salida:** paridad visual y de estados con `dashboard.html`; todos los formularios validan; no hay HTML strings, `dangerouslySetInnerHTML` ni persistencia simulada.

**Estado:** completada. El catálogo usa 18 productos y 7 categorías de fixture; la lista filtra por texto, categoría, edad y estado con paginación en `searchParams`; el editor valida con Zod y React Hook Form en sus ocho secciones; categorías tiene diálogo de creación/edición; inventario muestra el stock por talla y las alertas. Las 19 imágenes de producto son SVG locales. `pnpm lint`, `pnpm typecheck` y `pnpm build` pasan.

**Siguiente:** Fase 3, ventas y contenido (completada).

### Fase 3 — Ventas y contenido: UI completa · Completada

**Objetivo:** cubrir el resto del admin antes de conectar la base de datos.

- Pedidos: tabs por estado, búsqueda, tabla, detalle, items, resumen, cliente, historial, notas y acciones de estado deshabilitadas hasta la fase 5.
- Clientes derivados de pedidos de fixture.
- Descuentos: tabla, creación/edición, activación y vencimiento.
- Portada: barra de anuncio, hero, orden/visibilidad de secciones y preview.
- Páginas: lista, creación, editor con SEO y preview de párrafos.
- FAQs: lista, edición y reordenamiento.
- Medios: grid y placeholder de subida; la carga real llega en la fase 4.
- Configuración: general, envíos, pagos, equipo y apariencia; el equipo queda informativo hasta la fase 6.
- Retirar las acciones de demo (`reset`) y dejar `export` para la fase 5.

**Salida:** todas las rutas del inventario del admin existen y se ven como el prototipo; los formularios validan; las mutaciones muestran un aviso de "persistencia pendiente" o quedan deshabilitadas, sin fingir que guardan.

**Estado:** completada. Pedidos y clientes comparten un fixture detallado de 180 pedidos; la lista filtra por estado y texto con paginación de 20; el detalle muestra items, totales, cliente, historial y acciones deshabilitadas. Descuentos, portada, páginas, FAQ, medios y configuración tienen sus pantallas y formularios validados. La subida de medios, el guardado y las transiciones quedan marcados para las fases 4 y 5; el equipo para la Fase 6. `pnpm lint`, `pnpm typecheck` y `pnpm build` pasan.

**Siguiente:** Fase 4, catálogo de punta a punta y medios locales.

### Fase 4 — Catálogo de punta a punta y medios locales

**Objetivo:** conectar el catálogo a Supabase Postgres y habilitar la subida local de imágenes.

- Validar el proyecto de Supabase existente y las variables `DATABASE_URL` y `DIRECT_URL` ya configuradas en `.env`.
- Confirmar `UPLOAD_DIR` y `CART_COOKIE_SECRET` en `.env`; las variables de Supabase Auth ya están en la plantilla para la Fase 6.
- Implementar `src/db/schema` para catálogo, colores, imágenes y medios; generar la migración inicial.
- Crear `src/db/seed.ts` con los datos del prototipo, precios en centavos y rutas locales.
- Sustituir las fixtures por `features/<dominio>/queries.ts` con Drizzle.
- Implementar Server Actions con Zod para producto, categoría, stock, duplicado, archivo y borrado lógico.
- Implementar el servicio de uploads: `storage/uploads/YYYY/MM/<uuid>.<ext>`, límite de tamaño, MIME real, nombre aleatorio y rechazo de path traversal.
- Servir los archivos con `app/media/[...path]/route.ts` y cache inmutable; usar `next/image` en las vistas.
- Implementar la galería de medios, el selector de imágenes y las miniaturas del producto.
- Reemplazar cualquier imagen remota o base64 por assets locales.

**Salida:** un producto se crea, edita, archiva y duplica y persiste tras recargar; el stock por talla se guarda; las categorías respetan sus constraints; una imagen subida sigue disponible tras reiniciar; `pnpm build` pasa; no se usa Supabase Storage ni la API REST de datos.

**Estado:** en curso. `drizzle-orm`, `postgres` y `drizzle-kit` están instalados. La conexión a Supabase rechaza la contraseña de `DATABASE_URL` y `DIRECT_URL` con `28P01`; no se generaron ni aplicaron migraciones para no tocar una base que aún no se puede inspeccionar.

### Fase 5 — Ventas, contenido y ajustes de punta a punta

**Objetivo:** persistir pedidos, clientes, descuentos, CMS y configuración.

- Implementar pedidos, items, historial, clientes derivados, cupones y CMS con Drizzle.
- Crear el servicio de pedidos: cálculo de totales en servidor, snapshot de items, transición de estados y restauración de stock en una transacción.
- Conectar las acciones de pedido, notas, cupones, portada, páginas, FAQs y configuración.
- Convertir `export` en una exportación real (o retirarlo) y eliminar el reset de demo.
- Añadir pruebas de dinero, stock, totales y transiciones antes de seguir.

**Salida:** el flujo de pedidos funciona contra la base; cancelar restaura stock una sola vez; cada cambio queda en el historial; los ajustes alimentan la tienda; las pruebas de dominio pasan.

### Fase 6 — Autenticación, roles y equipo

**Objetivo:** cerrar el admin y aplicar permisos reales.

- Instalar `@supabase/supabase-js` y `@supabase/ssr`; las variables ya están en `.env.example`.
- Crear los clientes de Supabase (navegador, servidor con cookies y admin con la clave secreta solo en servidor); `proxy.ts` refresca la sesión en cada request.
- Crear la migración de `public.profiles` (`id` uuid con FK a `auth.users`, `full_name`, `role`, `active`) y el trigger que crea el perfil al registrarse; el primer administrador se promueve con un seed/SQL controlado.
- Conectar el `/login` existente con `signInWithPassword` mediante una Server Action y agregar el cierre de sesión.
- Proteger `(admin)/admin/layout.tsx` con `getUser()` y el rol de `profiles`; `proxy.ts` solo redirige de forma gruesa.
- Aplicar la matriz de roles en layouts y acciones:

| Rol | Acceso |
| --- | --- |
| `admin` | Todo, incluido pedidos, clientes, descuentos, equipo y ajustes |
| `editor` | Catálogo, contenido y medios |

- No autorizar con `getSession()` ni con `user_metadata`; el rol se lee de `profiles` en cada request protegido.
- Conectar la tabla de equipo: listar perfiles, cambiar rol y desactivar con la Admin API; invitaciones y recuperación por email quedan para cuando haya SMTP configurado en Supabase.
- Mantener dos roles mientras el panel sea pequeño; si más adelante se necesita separar ventas, se añade `sales` con su propia migración de permisos.
- Ocultar navegación no permitida, pero repetir la autorización en el servidor.

**Salida:** sin sesión, `/admin` redirige a `/login`; cada rol solo accede a lo suyo; las acciones rechazan roles indebidos; no hay secretos en el cliente.

### Fase 7 — Tienda pública (`client.html`)

**Objetivo:** migrar la tienda reutilizando la misma base de UI, datos y formato.

- Home: hero, compra por edad, beneficios, pasos, destacados y FAQ.
- Catálogo: filtros por edad, categoría, talla, precio y oferta; orden y búsqueda; URLs compartibles.
- Producto: galería, selector de talla/color/cantidad, acordeones, relacionados y agregar al carrito.
- Carrito: cookie firmada, drawer, progreso de envío gratis y actualización de cantidades.
- Checkout: formulario validado, totales recalculados en servidor, creación de pedido pendiente y apertura de WhatsApp con el número de pedido.
- Páginas informativas, guía de tallas, FAQ y 404.
- SEO: metadata por producto/página, canonical, JSON-LD de producto y breadcrumbs, `sitemap.ts` y `robots.ts`.
- Reemplazar el header/footer y todos los estilos inline por componentes y tokens.

**Salida:** paridad funcional y visual con `client.html`; los enlaces del prototipo funcionan como rutas; el checkout crea un pedido real; el admin lo ve; Lighthouse de accesibilidad y SEO en verde; las imágenes son locales.

### Fase 8 — Calidad y salida

**Objetivo:** dejar el proyecto verificable y desplegable.

- Vitest para dinero, stock, totales, transiciones de pedido, slugs y permisos.
- Playwright para login, CRUD de producto, cambio de estado de pedido y checkout.
- Auditoría de accesibilidad: labels, foco, teclado, contraste, diálogos y reduced motion.
- Rendimiento: fuentes locales, imágenes optimizadas, límites de JavaScript en cliente, LCP y CLS medidos.
- CI con lint, typecheck, build y tests.
- Documentar variables de entorno, backups de base + uploads, volumen persistente y restauración.
- Checklist de paridad final y aprobación para retirar o archivar los HTML.

**Salida:** checks verdes, checklist firmado, despliegue con volumen persistente y backups probados.

---

## 7. Visión futura: migración de `client.html`

### Rutas

| Prototipo | Ruta Next |
| --- | --- |
| `#/` | `/` |
| `#/catalogo?cat=...&age=...&sale=1` | `/catalogo?category=...&age=...&sale=1` |
| `#/producto/[id]` | `/producto/[slug]` |
| Carrito en drawer | `/carrito` + `CartSheet` |
| Pedido por WhatsApp | `/checkout` + pedido pendiente + WhatsApp |
| `#/paginas/[id]` | `/paginas/[slug]` |
| Guía de tallas | `/guia-de-tallas` |
| FAQ / información | `/faq` y `/paginas/[slug]` |

### Componentes

`StoreHeader`, `AnnouncementBar`, `StoreNav`, `MobileMenu`, `SearchBar`, `StoreFooter`, `Hero`, `AgeCollection`, `BenefitsBar`, `StepsSection`, `SectionHeading`, `ProductCard`, `ProductGrid`, `ProductGallery`, `SizeSelector`, `ColorSelector`, `QuantityStepper`, `AddToCartButton`, `CartSheet`, `CartLine`, `ShippingProgress`, `CheckoutForm`, `OrderSummary`, `SizeGuideTable`, `InfoPage`, `FaqAccordion`, `WhatsAppButton`, `Breadcrumbs`, `EmptyState`, `Pagination`.

### Cambios de comportamiento

| Prototipo | Migración |
| --- | --- |
| Router hash | Rutas del App Router y `searchParams` |
| Carrito en el navegador | Cookie firmada + revalidación en servidor |
| Strings con `innerHTML` | JSX y componentes server/client |
| Imágenes remotas | Assets locales o rutas de uploads |
| Fuentes por CDN | `next/font` |
| CSS inline | Tokens y Tailwind |
| Pedido solo por WhatsApp | Pedido pendiente en base + mensaje de WhatsApp |
| Sin SEO real | Metadata, JSON-LD, sitemap y canonical |

La tienda comparte con el admin: formato de dinero/fechas, modelos de producto, componentes de imagen, estados vacíos y validaciones. No comparte el layout ni el tema.

---

## 8. Riesgos y restricciones

1. **Imágenes locales vs. hosting serverless.** Escribir en disco requiere un servidor Node con volumen persistente. Vercel u otro serverless no sirve para subidas locales. Si más adelante se cambia a un bucket, habrá que migrar el servicio de medios; no se hace ahora porque el requisito es almacenamiento local.
2. **Supabase para datos y Auth.** La autorización se implementa en el servidor con el rol de `public.profiles` y se prueba por rol; RLS queda como defensa en profundidad. La clave secreta y la cadena de conexión nunca llegan al cliente, y la autorización no depende de `user_metadata`.
3. **Dos temas.** La disciplina de tokens es obligatoria. Mezclar colores o tipografías entre admin y tienda rompe la coherencia y duplica estilos.
4. **Prototipos con datos simulados.** El seed no es dato de producción. Los precios del prototipo son decimales; la base usa centavos. Las fechas y los estados deben mapearse explícitamente.
5. **Next.js 16.** `middleware.ts` está reemplazado por `proxy.ts`; `params` y `searchParams` son promesas. La documentación de shadcn y Supabase Auth debe verificarse contra las versiones instaladas en la fase correspondiente.
6. **Invitaciones y correos.** Supabase Auth puede enviar invitaciones y recuperación de contraseña, pero requieren SMTP configurado; en la primera versión se crean usuarios y se cambian roles desde el panel, sin email.
7. **Pagos.** El alcance es WhatsApp/pedido pendiente. Una pasarela de pago es otro proyecto.
8. **Cuentas de cliente.** No existen en el prototipo. Se añaden después; no se diseñan ahora para no bloquear el checkout de invitado.
9. **Contenido de páginas.** El editor del prototipo es texto plano. No se migra a HTML libre; si se necesita rich text, se planifica con un editor y sanitización.
10. **Borrado de productos.** No se borra un producto con historial; se archiva. Los pedidos guardan snapshots para no romperse.

## 9. Fuera de alcance

- Pagos en línea y conciliación.
- Cuentas de cliente, wishlist y programa de puntos.
- Multi-tienda, multi-moneda o i18n.
- Modo oscuro y selector de tema.
- Supabase Storage, Realtime o Edge Functions.
- Envío de emails e invitaciones.
- Analítica, marketing y SEO avanzado más allá de lo listado.

## 10. Criterios de aceptación

- [ ] Todas las rutas del inventario del admin existen y reutilizan componentes, sin HTML strings.
- [ ] Ningún flujo depende de `localStorage`; los datos persisten en Postgres.
- [ ] Las mutaciones validan en cliente y servidor; los errores se muestran sin romper la página.
- [ ] Los roles se aplican en servidor, no solo en la navegación.
- [ ] Las imágenes son locales y se sirven con validación y cache correctos.
- [ ] La tienda tiene paridad con `client.html`, URLs compartibles, metadata y sitemap.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm build`, Vitest y Playwright pasan.
- [ ] La checklist de accesibilidad y rendimiento está medida, no solo declarada.
- [ ] Existe un backup probado de base y uploads.
- [ ] Los HTML se archivan o eliminan solo después de la aprobación.

## 11. Próximo paso

Las fases 1, 2 y 3 están completadas. Continuar con la Fase 4: conectar el catálogo y los medios a Supabase Postgres.

1. Validar la conexión de `DATABASE_URL`/`DIRECT_URL` y crear el esquema Drizzle de catálogo, colores, imágenes y medios.
2. Generar la migración inicial y un seed con los datos de fixture, precios en centavos y rutas locales.
3. Sustituir las fixtures de catálogo por consultas Drizzle y acciones de servidor con Zod.
4. Implementar subidas locales con validación de MIME, tamaño, nombres aleatorios y protección contra path traversal.
5. Servir las subidas con `app/media/[...path]/route.ts` y conectar el selector de medios.

Hasta completar esa fase, el guardado y las mutaciones permanecen deshabilitados o muestran el aviso de persistencia pendiente.
