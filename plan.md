# Plan de migración — Mistikax

> **Estado:** Fases 0–12 completadas. Catálogo, ventas, contenido, ajustes, autenticación con roles y equipo persisten en Supabase Postgres con Drizzle y Supabase Auth; las subidas de medios viven en Supabase Storage. El panel funciona de punta a punta y la tienda pública está implementada. Queda la Fase 13 (pruebas, accesibilidad medida y cierre).

Este plan convierte el panel de `dashboard.html` en una aplicación Next.js 16 con componentes reutilizables, y deja preparada la migración futura de `client.html`. La prioridad es que cada pantalla del admin quede cubierta, que el código sea mantenible y que la tienda pueda reutilizar la misma base técnica.

## Decisiones cerradas

| Tema | Decisión |
| --- | --- |
| Estructura | Una sola app Next.js con route groups `(store)` y `(admin)`; un despliegue |
| Base de datos | Supabase Postgres, con Drizzle ORM y migraciones en el repo |
| Autenticación | Supabase Auth con `@supabase/ssr` y cookies, con dos roles por ahora: `admin` y `editor` |
| UI | shadcn/ui + Tailwind CSS v4 + Iconify |
| Temas | Dos temas sobre una misma base de primitivas: admin denso y tienda editorial |
| Imágenes | Contenido en `public/images`, logos en `public/svg`; subidas en el bucket privado `mistikax-media` de Supabase Storage, servidas por `/media/[...path]` |
| Datos | Server Components para lectura, Server Actions + Zod para escritura |
| Idioma | Código, archivos, rutas y slugs de página en inglés; copy de UI en español (`es-PE`) |
| Paquete | pnpm |
| Despliegue | Node autoalojado; ya no requiere disco persistente, porque los medios viven en Supabase Storage |

## Ruta rápida

| # | Fase | Resultado | ¿Necesita Supabase? |
| --- | --- | --- | --- |
| 0 | Fundaciones | Completada: Next en `src/`, shadcn, temas, fuentes, login visual, scripts | No |
| 1 | Shell y kit del admin | Completada: navegación, layout, primitivas y Resumen con fixtures | No |
| 2 | Catálogo (UI) | Completada: productos, editor, categorías e inventario con fixtures | No |
| 3 | Ventas y contenido (UI) | Completada: pedidos, clientes, descuentos, CMS y ajustes con fixtures | No |
| 4 | Catálogo de punta a punta | Completada: Drizzle, seed, CRUD real y subidas a Supabase Storage | Sí |
| 5 | Ventas y contenido de punta a punta | Completada: pedidos, transacciones, CMS y ajustes persistentes | Sí |
| 6 | Autenticación, roles y equipo | En curso: auth, proxy, perfiles, roles y tabla de equipo listos; falta validar el login con una cuenta real | No |
| 6 | Auth y roles | Login, sesiones, permisos y equipo | Sí |
| 7 | Tienda: shell, footer y home | Shell de tienda, navegación, búsqueda y portada con datos reales | Sí (lectura del catálogo) |
| 8 | Tienda: catálogo | `/catalog` con filtros, orden, búsqueda y paginación | Sí (lectura) |
| 9 | Tienda: producto | `/product/[id]` con galería, tallas, carrito y relacionados | Sí (lectura) |
| 10 | Tienda: carrito | Cookie firmada, drawer y `/cart` | Sí (lectura) |
| 11 | Tienda: checkout | Formulario, pedido pendiente y WhatsApp | Sí (lectura y escritura) |
| 12 | Tienda: páginas, guía y SEO | Páginas informativas, guía de tallas, FAQ, 404, SEO y sitemap | Sí (lectura) |
| 13 | Calidad y salida | Tests, accesibilidad, rendimiento y checklist de lanzamiento | Yes |

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
│  │  │  ├─ checkout/
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ exito/page.tsx
│  │  │  ├─ paginas/[slug]/page.tsx
│  │  │  ├─ guia-de-tallas/page.tsx
│  │  │  ├─ faq/page.tsx
│  │  │  └─ not-found.tsx
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
│  │  └─ media/[...path]/route.ts   # sirve objetos desde Supabase Storage
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

- **Tienda:** rutas en inglés: `/catalog`, `/product/[id]`, `/cart`, `/checkout`, `/pages/[slug]`, `/shipping`, `/size-guide`, `/faq`. Los slugs de página también van en inglés; el copy visible sigue en español.
- **Admin:** URLs en inglés, porque es una herramienta interna y coincide con el dominio del código. `/admin/products`, `/admin/orders`, `/admin/content/pages`.
- Los slugs de categoría y producto conservan el texto comercial en español por SEO; los slugs de página y todos los segmentos de ruta usan inglés.
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
| `@supabase/supabase-js`, `@supabase/ssr` | Auth, sesiones con cookies y Admin API | Instalado (Fase 6) |
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
| `product_images` | `id`, `product_id`, `path`, `alt`, `position` | La posición 0 es la principal; `path` es la URL `/media/...` del objeto en Storage |
| `product_sizes` | `product_id`, `size`, `stock` | Clave compuesta; el stock es por talla, como en el prototipo |
| `colors` | `id`, `name`, `hex` | Paleta normalizada; el prototipo usa claves como `ng`, `bl`, `az` |
| `product_colors` | `product_id`, `color_id` | Relación N:M |
| `orders` | `id`, `number`, `customer_name`, `email`, `phone`, `city`, `address`, `status`, `payment_method`, `shipping_cents`, `subtotal_cents`, `total_cents`, `customer_id`, `coupon_code`, `discount_cents`, `note`, `created_at`, `updated_at` | `status`: `pending`, `paid`, `shipped`, `delivered`, `cancelled`; `number` es el número humano; `customer_id` vincula al cliente logueado; `coupon_code` y `discount_cents` registran el descuento aplicado |
| `order_items` | `id`, `order_id`, `product_id`, `product_name`, `size`, `color_name`, `unit_price_cents`, `quantity` | Guarda snapshot del nombre, talla y color; el producto puede archivarse |
| `order_status_history` | `id`, `order_id`, `status`, `changed_by`, `created_at` | Historial visible en el detalle |
| `coupons` | `id`, `code`, `kind`, `value`, `uses`, `max_uses`, `expires_at`, `active` | `kind`: `percent` o `fixed`; `value` es porcentaje entero o centavos; `max_uses` = 0 significa sin límite |
| `pages` | `id`, `slug`, `title`, `body`, `seo_description`, `status`, `updated_at` | `body` es texto plano con párrafos separados por línea en blanco |
| `faqs` | `id`, `question`, `answer`, `position` | Orden explícito |
| `media` | `id`, `path`, `object_key`, `source`, `mime`, `bytes`, `width`, `height`, `checksum`, `created_at` | Metadatos del objeto en Supabase Storage; `source` distingue `catalog` de `upload` |
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

### Fase 0 — Fundaciones y sistema de diseño · Completada ✅

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

### Fase 1 — Shell del admin, primitivas y Resumen · Completada ✅

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

### Fase 2 — Catálogo: UI completa · Completada ✅

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

### Fase 3 — Ventas y contenido: UI completa · Completada ✅

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

### Fase 4 — Catálogo de punta a punta y medios locales · Completada ✅

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

**Estado:** completada. El esquema reside en `src/db/schema` (`categories`, `colors`, `products`, `product_colors`, `product_images`, `product_stock`, `media` con origen `catalog`/`upload`); las migraciones de Drizzle se aplicaron a Supabase y el seed está en `src/db/seed.mts`, reproducible con `pnpm db:seed`. Las queries de catálogo e inventario son async con Drizzle y `getStockStatus`/`getStockTotal` derivan del mapa de stock del producto. Las Server Actions de producto (crear, editar con slug inmutable, archivar, duplicar), categoría (crear, editar, borrar con restricción) y media (subida y borrado con imagen en uso) validan con Zod; los uploads van a `storage/uploads/YYYY/MM/<uuid>.<ext>` con MIME real y bloqueo de path traversal y se sirven por `app/media/[...path]/route.ts` con cache inmutable. `src/lib/env.ts` valida `DATABASE_URL` y `UPLOAD_DIR`; la Fase 7 mantiene el requisito de `CART_COOKIE_SECRET`. `pnpm lint`, `pnpm typecheck` y `pnpm build` pasan. **Gate de conexión resuelto ✅:** el pooler de Supabase no tolera conexiones concurrentes en este entorno, así que `src/db/index.ts` usa `max: 1` con `connect_timeout` de 10 s y las lecturas de tienda son secuenciales; con eso el home y las rutas dinámicas responden 200 con datos reales.

**Nota del pool:** con `max: 1`, ejecutar en secuencia las consultas Drizzle independientes en tienda y admin; no agruparlas con `Promise.all`.

### Fase 5 — Ventas, contenido y ajustes de punta a punta · Completada ✅

**Objetivo:** persistir pedidos, clientes, descuentos, CMS y configuración.

- Implementar pedidos, items, historial, clientes derivados, cupones y CMS con Drizzle.
- Crear el servicio de pedidos: cálculo de totales en servidor, snapshot de items, transición de estados y restauración de stock en una transacción.
- Conectar las acciones de pedido, notas, cupones, portada, páginas, FAQs y configuración.
- Convertir `export` en una exportación real (o retirarlo) y eliminar el reset de demo.
- Añadir pruebas de dinero, stock, totales y transiciones antes de seguir.

**Salida:** el flujo de pedidos funciona contra la base; cancelar restaura stock una sola vez; cada cambio queda en el historial; los ajustes alimentan la tienda; las pruebas de dominio pasan.

**Estado:** completada. El esquema `src/db/schema/orders.ts` (`orders`, `order_items` con snapshot, `order_status_history`, `coupons`) y `content.ts` (`pages`, `faqs`, `home_content`, `home_sections`, `site_settings`) se aplicó con la migración `0002`. El seed (`pnpm db:seed`) carga 180 pedidos, 371 items, 667 eventos de historial, 3 cupones, 5 páginas, 3 preguntas, las 7 secciones de portada y la fila única de ajustes. Las queries de pedidos, clientes derivados, cupones, contenido, ajustes y Resumen son async con Drizzle; el Resumen calcula la serie diaria con SQL agrupado por día de Lima. El servicio puro `features/orders/service.ts` valida transiciones, totales y deltas de stock, con 8 pruebas en Vitest (`pnpm test`). La acción de transición bloquea el pedido en la transacción, registra el evento en el historial y restaura el stock una sola vez al cancelar solo desde `pending`/`paid`; las notas internas, cupones, páginas, FAQs (con reordenamiento), portada y los cuatro grupos de ajustes guardan con Zod. `GET /admin/orders/export` descarga los pedidos en JSON con `Cache-Control: no-store`. Las páginas del admin que consultan la base son dinámicas para no prerenderizar datos. `pnpm lint`, `pnpm typecheck` y `pnpm build` pasan.

**Siguiente:** Fase 7, shell, footer y home de la tienda.

### Fase 6 — Autenticación, roles y equipo · Completada ✅

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

**Estado:** completada ✅. Migraciones `0003`–`0006`: `profiles` con `admin`/`editor`/`customer`, RLS de lectura propia, trigger `handle_new_user` con el primer usuario como administrador y saneo del rol antiguo. `src/proxy.ts` refresca la sesión en `/admin`, `/login` y `/account`; `(admin)/admin/layout.tsx` valida `getUser()` + `profiles` y aplica `canAccessAdminPath`, y las acciones usan `requireRole` o comprueban el rol. `/login` autentica con `signInWithPassword` en una Server Action, rechaza cuentas inactivas o `customer` y cierra sesión con `signOutAction`. El equipo vive en Ajustes → Equipo: listar, cambiar rol y desactivar con la Admin API (baneo permanente), con guardas para no quitarse el acceso ni dejar el panel sin administradores. Verificado en vivo: `/login` responde 200, `/admin` sin sesión responde 307 → `/login`, y la cuenta `oliverachavezcristian@gmail.com` inicia sesión correctamente con `role = admin` y `active = true`. Las invitaciones por email siguen deshabilitadas a propósito hasta configurar SMTP en Supabase.

### Fase 7 — Tienda: shell, footer y home · Completada ✅

**Objetivo:** montar el marco de la tienda con datos reales del catálogo y la portada completa del prototipo. La especificación de la tienda y sus decisiones está en la sección 7.

Las fases 7 a 12 corren en paralelo al trabajo del dashboard con reglas de convivencia: `pnpm lint`, `pnpm typecheck` y `pnpm build` en verde al cierre de cada fase, revisión visual a 375, 768 y 1280, y sin editar los archivos en los que trabaja el dashboard (`features/*/queries.ts`, `db`, `media`). La Fase 7 y la 8 sólo requieren lectura de catálogo (Fase 4); la 11 además del servicio de pedidos de la Fase 5; la 12 el CMS de la Fase 5.

- `(store)/layout.tsx` con `.theme-store`, render dinámico y metadata pública; `AnnouncementBar` desde `home_content`; `StoreHeader` con logo, nav curada en `src/lib/nav.ts` (`STORE_NAV`), búsqueda hacia `/catalog?q=...` y menú móvil a pantalla completa; `StoreFooter` con categorías activas, ayuda y contacto desde `site_settings`.
- Portada por secciones en el orden y visibilidad de `home_sections`: hero, compra por edad, categorías, más vendidos, beneficios, novedades, pasos y FAQ (3 primeras).
- Consultas de tienda de solo lectura en `features/catalog/store-queries.ts`: destacados, novedades, mejor vendido por grupo de edad y categorías con imagen representativa y conteo.
- Estados vacíos y skeletons con la forma del grid; mientras la base de la Fase 4 no esté servible, la portada no se rompe.

**Salida:** portada navegable con paridad visual de `client.html`; header, footer y menú móvil responsive y accesibles por teclado.

**Estado:** completada ✅. Implementados: `(store)/layout.tsx` con tema, anuncio, header con nav curada (`STORE_NAV` en `src/lib/nav.ts`), búsqueda desplegable, menú móvil y carrito; `StoreFooter` con categorías activas, ayuda y contacto; home con hero, edades, categorías, más vendidos, beneficios, novedades, pasos y FAQ compuesto según `home_sections`; consultas de tienda en `features/catalog/store-queries.ts`; helper de WhatsApp en `src/lib/whatsapp.ts`; tokens `cacao` y `clay` en el tema tienda; `error.tsx` y `not-found.tsx` de tienda. El gate de la Fase 4 quedó resuelto (pool de una conexión + lecturas secuenciales) y el home responde 200 con productos reales; `pnpm lint`, `pnpm typecheck` y `pnpm build` pasan.

#### Fase 8 — Tienda: catálogo con filtros · Completada ✅

**Objetivo:** listar el catálogo activo con filtros compartibles por URL.

- `/catalog` con filtros en `searchParams` (`category`, `age`, `size`, `max`, `q`, `sale`, `sort`, `page`), títulos dinámicos según filtros y contador de resultados.
- `listStoreProducts` con filtrado y orden en SQL; opciones de talla derivadas de productos con stock; paginación de 24; estados vacío y de error; estado vacío con CTA para limpiar filtros.
- Sidebar de filtros en desktop y desplegable controlado por botón en móvil; cada cambio actualiza la URL sin saltar el scroll y el resultado es compartible.
- Rango del filtro de precio: límite máximo calculado del catálogo activo redondeado a decenas.

**Salida:** un enlace generado con filtros reproduce exactamente la vista en otro navegador; los filtros combinan sin resultados fantasma; paginación y orden conservan los filtros activos.

**Estado:** completada ✅. `/catalog` lee `category`, `age`, `size`, `max`, `q`, `sale`, `sort` y `page` desde `searchParams`; `listStoreProducts` filtra y ordena en servidor, deriva las tallas con stock y pagina de 24 en 24. Los filtros son enlaces compartibles (sin estado de cliente) con `<details>` en móvil, sidebar en desktop, formulario GET para el precio máximo, contador y estado vacío con CTA para limpiar.

#### Fase 9 — Tienda: producto · Completada ✅

**Objetivo:** construir la ficha de producto y su selección de compra.

- `/product/[id]` con `generateMetadata`, `notFound()` para id inexistente y breadcrumb Inicio / Categoría / Producto.
- Galería con miniaturas (más de una imagen cuando el producto tiene varias), etiqueta de descuento o "Nuevo" según `compare_at_cents`/`is_new`.
- `ProductPurchasePanel`: color y talla con las sin stock deshabilitadas y stock disponible como techo de cantidad; error de talla con `role="alert"`; agregar al carrito por server action y abrir el drawer; botón de compra directa por WhatsApp sin crear pedido.
- Acordeones: detalles desde la descripción del producto, cuidado literal, envíos y cambios con los umbrales de `site_settings`; dialog de guía de tallas por grupo de edad o calzado.
- Relacionados: misma categoría o grupo de edad, nuevos primero, límite 4, sin incluirse a sí mismo.

**Salida:** flujo de compra completo hasta el drawer con datos reales; sin stock no se puede agregar; metadata y JSON-LD de producto listos.

**Estado:** completada ✅. `/product/[id]` con `generateMetadata`, `notFound()`, breadcrumb, JSON-LD `Product`, galería con miniaturas, panel de compra (color, talla con stock real, cantidad topada, error con `role="alert"`, agregar por server action y compra directa por WhatsApp), acordeones, dialog de guía de tallas y relacionados de la misma categoría.

#### Fase 10 — Tienda: carrito · Completada ✅

**Objetivo:** mover el carrito del navegador a una cookie firmada del servidor.

- Cookie firmada `mistikax_cart` (diseño en la sección 7); acciones `addToCart`, `updateLineQty`, `removeLine`, `clearCart` con Zod y validación de stock.
- `CartSheet` (drawer accesible) y `/cart` compartiendo representación: líneas, cantidades, eliminar, no disponible, progreso de envío gratis y totales recalculados en servidor.
- Comportamiento con catálogo mutable: precio nuevo se muestra, producto archivado o sin stock se marca y se puede quitar; vacío con CTA al catálogo.
- Badge del header actualizado revalidando tras cada mutación.

**Salida:** el carrito sobrevive reinicios y cierres de navegador; las mutaciones validan stock y producto; ninguna línea muestra precios desactualizados como totales.

**Estado:** completada ✅. Cookie `mistikax_cart` firmada con HMAC (30 días, `httpOnly`, `sameSite=lax`), esquema Zod versionado, máximo 30 líneas y 99 unidades; `addToCartAction`, `updateCartQuantityAction`, `removeCartLineAction` y `clearCartAction` revalidan producto y stock; `/cart` y el drawer `CartSheet` comparten líneas, progreso de envío gratis, totales recalculados en servidor y estado vacío; el badge se actualiza al revalidar.

#### Fase 11 — Tienda: checkout y pedido pendiente · Completada ✅

**Objetivo:** convertir el checkout de WhatsApp en un pedido real persistido. Gate: servicio de pedidos de la Fase 5.

- `/checkout` con `CheckoutForm` validado (Zod + RHF en cliente y de nuevo en la acción), métodos de pago según `site_settings` y resumen de totales del servidor.
- Acción `createOrder` en transacción única tal como está diseñada en la sección 7; error de stock nombra la línea; en éxito se limpia el carrito y se navega a `/checkout/success` con token HMAC y resumen, botón para reabrir WhatsApp y CTA al catálogo.
- Mensaje de WhatsApp construido por el helper de la Fase 5; el cliente solo abre la URL recibida.
- Regresión cruzada: el pedido nuevo aparece en `/admin/orders` como Pendiente con items, historial y nota; cancelarlo restaura el stock.

**Salida:** de agregar al carrito a pedido pendiente visible en el admin, con stock decrementado y mensaje de WhatsApp correcto; recargar `/checkout/success` sin token no muestra datos del pedido.

**Estado:** completada ✅. `/checkout` muestra el formulario validado con Zod + RHF (y otra vez en la acción), métodos de pago filtrados por `site_settings`, campo de código de cupón y resumen del servidor. `createOrderAction` valida cada línea, valida cupón (activo, no expirado, `max_uses`, descuento porcentual o fijo con cap al subtotal), calcula subtotal/descuento/envío/total, inserta `orders` (con `customer_id`, `coupon_code`, `discount_cents`), `order_items` y `order_status_history`, descuenta stock e incrementa `uses` del cupón dentro de una transacción y limpia el carrito; devuelve número, token HMAC y URL de WhatsApp. `/checkout/success` solo muestra el pedido con token válido. Migración `0009_orders_customer_coupons.sql` aplicada. `paymentCard` y `paymentWallet` marcados como «Próximamente» en ajustes.

#### Fase 12 — Tienda: páginas informativas, guía de tallas, FAQ y 404 · Completada ✅

**Objetivo:** cerrar el mapa de contenidos de la tienda. Gate: CMS persistido de la Fase 5.

- `/pages/[slug]` con `getPublishedPage` (párrafos por línea en blanco, sin HTML), CTA de WhatsApp y `notFound()` si no está publicada; seed de `shipping`, `returns`, `about`, `contact`, `privacy` y `terms-and-conditions`.
- `/size-guide` con las 6 tablas de `size-guide.ts`; `/faq` con todas las preguntas en acordeón nativo; 404 de tienda con vuelta al inicio.

**Salida:** todos los enlaces de header, footer y menú móvil tienen destino real; ninguna página muerta ni `href="#"`.

**SEO, sitemap y verificación técnica (cierre de la Fase 12):**

- Metadata y canonical por ruta según la sección 7; JSON-LD de `Product`, `BreadcrumbList` y `FAQPage`.
- `sitemap.ts` con productos activos y páginas publicadas; `robots.ts` con `noindex` en carrito y checkout; verificación de Open Graph en ruta raíz.
- Pago de deuda técnica: activos remotos faltantes reemplazados por locales; revisión visual de las vistas de tienda en los tres breakpoints; `pnpm lint`, `pnpm typecheck` y `pnpm build`.
- Prueba end-to-end manual registrada en el checklist: home → catálogo filtrado → producto → agregar → checkout → pedido en el admin → cancelación y restauración de stock.

**Salida de la Fase 12 (cierre de la tienda):** paridad funcional y visual con `client.html`; el checkout crea un pedido real que el admin gestiona; Lighthouse de accesibilidad y SEO en verde; imágenes locales; cero `innerHTML`, cero `localStorage` de carrito y cero URLs remotas.

**Estado:** completada ✅. `/pages/[slug]` sirve solo páginas `published` con soporte de markdown básico (`## `, `### `, `**negrita**`, listas con `- ` y párrafos por línea en blanco), metadata, canonical y CTA de WhatsApp; `/size-guide` incluye las tablas de ropa por edad y el calzado 28–44; `/faq` lista todas las preguntas con acordeón nativo y JSON-LD `FAQPage`; `not-found.tsx` de tienda con vuelta al inicio; `sitemap.ts` y `robots.ts` cubren productos activos, páginas publicadas y excluyen carrito/checkout. Pendiente de la Fase 13: la auditoría de accesibilidad medida y la prueba end-to-end con pedido real en el admin.

### Fase 13 — Calidad y salida · en curso

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

## 7. Plan de la tienda pública (`client.html`)

Este apartado define el inventario funcional de la tienda, el diseño del carrito y del checkout, y las decisiones cerradas para ejecutar la Fase 7. La tienda reutiliza la base técnica del admin (primitivas, tokens, validación, dominios, formato de dinero y fechas) sin compartir layout ni tema: `(store)` aplica `.theme-store`, sus rutas y slugs de página son públicos y en inglés, mientras los slugs de categoría y producto conservan el texto comercial en español.

### Medición del prototipo

`client.html` (49 KB, ~560 líneas) contiene: header fijo con nav curada, búsqueda desplegable y badge del carrito; menú móvil de pantalla completa; home de 7 secciones; catálogo con filtros de categoría, edad, talla, precio máximo, búsqueda y ofertas, más orden y estado vacío; página de producto con galería, colores, tallas, cantidad, acordeones, relacionados, guía de tallas en dialog y compra directa; carrito drawer con progreso de envío gratis; páginas informativas (`envios`, `cambios`, `nosotros`, `contacto`); guía de tallas con 6 tablas; FAQ; 404; footer.

Mapeo de la configuración y el contenido del prototipo:

| Prototipo | Destino en Next.js |
| --- | --- |
| `WA` | `site_settings.whatsapp` |
| `FREE` / `SHIP` | `site_settings.free_shipping_threshold_cents` / `site_settings.shipping_cents` |
| `CATS`, `AGES`, `C` (colores) | Tablas `categories`, enum `age_group`, tabla `colors` (Fase 4) |
| `PRODUCTS`, `DESC` | Tablas `products`, `product_images`, `product_sizes`, `product_colors` |
| `GUIDE`, `shoeGuide` | Constantes de contenido en `src/features/catalog/size-guide.ts`; copia editable en código, no en CMS |
| Beneficios, pasos, textos `INFO` | Copia literal en componentes de tienda; `contacto` y demás se convierten en páginas del CMS |
| FAQs de portada | Tabla `faqs` (las 3 primeras por `position`) |
| Hero y barra de anuncio | `home_content` y `home_sections` (Fase 5) |
| `localStorage['mx_cart']` | Cookie firmada `mistikax_cart` (servidor) |
| `#/catalogo?cat=...` | `/catalog?category=...` |
| `#/info/tallas` | `/size-guide` |

### Rutas

| Prototipo | Ruta Next |
| --- | --- |
| `#/` | `/` |
| `#/catalogo?cat=...&age=...&sale=1` | `/catalog?category=...&age=...&sale=1` |
| `#/producto/[id]` | `/product/[id]` |
| Carrito en drawer | `/cart` + `CartSheet` |
| Pedido por WhatsApp | `/checkout` + pedido pendiente + WhatsApp |
| `#/info/tallas` | `/size-guide` |
| `#/info/{envios,cambios,nosotros,contacto}` | `/pages/{about,returns,contact}` y `/shipping` (seed del CMS) |
| FAQ | `/faq` y `/pages/[slug]` |
| Footer: política y términos | `/pages/privacy` · `/pages/terms-and-conditions` (seed del CMS; en el prototipo son `href="#"`) |

- Los search params viven en la URL y son la única fuente de filtros: `category`, `age`, `size`, `max`, `q`, `sale`, `sort`, `page`. Los enlaces de portada, header y footer son URLs compartibles reales.
- Los valores de `age` en la URL son los valores del enum en inglés (`kids`, `teens`, `adults`), no los prototipos `nino|joven|adulto`; las etiquetas visibles son españolas.
- Los slugs de categoría y producto mantienen el texto del prototipo (`polos`, `camisas`, `jean-slim`): son contenido público y SEO.

### Inventario por pantalla

| Vista | Contenido medido | Datos | Fase |
| --- | --- | --- | --- |
| Header | Logo, nav curada (Inicio, 3 edades, 3 categorías, Ofertas, Contacto), búsqueda, badge y CTA de carrito | `categories` (slugs validados), `site_settings`, `home_content` (anuncio), conteo del carrito | 7 |
| Menú móvil | Lista plana: inicio, edades, categorías, ofertas, guía, contacto | ídem | 7 |
| Home: hero | Imagen a pantalla, título, subtítulo y 2 CTA | `home_content.hero_*` | 7 |
| Home: compra por edad | 3 tarjetas expandibles con imagen de producto por edad | Mejor vendido activo por `age_group` | 7 |
| Home: categorías | Grid de 7 categorías + "Ver todo", nº de modelos por categoría | `categories` + conteo de productos activos | 7 |
| Home: más vendidos | 4 productos `is_best_seller` | queries de catálogo | 7 |
| Home: beneficios | Bloque editorial: calidad + envío, cambios, pago, ayuda | copia literal + umbral de envío de `site_settings` | 7 |
| Home: novedades | 4 productos `is_new` | queries de catálogo | 7 |
| Home: pasos | "Compra en 4 pasos" literal | copia literal | 7 |
| Home: FAQ | 3 preguntas con `details` nativo | `faqs` | 7 |
| Catálogo | Breadcrumb, título dinámico, contador, filtros (desktop sidebar / móvil toggle), orden, grid, estado vacío | `listStoreProducts` con filtros, opciones de talla con stock | 8 |
| Producto | Breadcrumb, galería, color, talla con stock, cantidad, agregar, compra directa, acordeones, relacionados, dialog de guía | `getStoreProduct(id)`, imágenes, stock por talla, colores | 9 |
| Carrito drawer / `/cart` | Líneas con talla y color, pasos de cantidad, eliminar, progreso de envío gratis, totales, CTA checkout y WhatsApp | cookie del carrito + productos vigentes | 10 |
| Checkout | Formulario, método de pago, totales recalculados, confirmación con número y mensaje de WhatsApp | acción `createOrder` | 11 |
| Páginas informativas | Título y párrafos, CTA WhatsApp | `pages` con `status = published` | 12 |
| Guía de tallas | 6 tablas: ropa y calzado por grupo de edad | `size-guide.ts` | 12 |
| FAQ | Acordeón completo | `faqs` ordenado | 12 |
| 404 de tienda | Mensaje y vuelta al inicio | — | 12 |
| Página inexistente de producto/página | `not-found.tsx` de tienda | — | 12 |

### Estructura de carpetas de la tienda

La tienda escribe archivos nuevos y no reutiliza los módulos internos del admin. Cada capa tiene una única responsabilidad, igual que en el panel:

```text
src/
├─ app/(store)/                    # solo rutas, layout, metadata y composición; cero lógica de dominio
│  ├─ layout.tsx                   # .theme-store, fuentes, header/footer, AnnouncementBar
│  ├─ page.tsx                     # compone secciones según home_sections
│  ├─ catalog/page.tsx             # Fase 8
│  ├─ product/[id]/page.tsx        # Fase 9
│  ├─ cart/page.tsx                # Fase 10
│  ├─ checkout/page.tsx            # Fase 11
│  ├─ checkout/success/page.tsx    # Fase 11
│  ├─ pages/[slug]/page.tsx        # Fase 12
│  ├─ size-guide/page.tsx
│  ├─ faq/page.tsx
│  └─ not-found.tsx
├─ components/store/               # presentación pura de tienda: no importa features ni db
│  ├─ announcement-bar.tsx
│  ├─ store-header.tsx
│  ├─ store-header-actions.tsx     # "use client": búsqueda y menú móvil
│  ├─ store-footer.tsx
│  ├─ hero.tsx, age-collection.tsx, categories-grid.tsx
│  ├─ benefits-block.tsx, steps-section.tsx, section-heading.tsx
│  ├─ product-card.tsx, product-grid.tsx
│  ├─ faq-accordion.tsx, breadcrumbs.tsx, pagination.tsx, empty-state-store.tsx
├─ features/catalog/
│  ├─ store-queries.ts             # server-only: lecturas publicables (nueva, separada de queries.ts del admin)
│  ├─ size-guide.ts                # Fase 9/12: matrices de tallas (copia de negocio)
├─ features/cart/                  # Fase 10
│  ├─ cookie.ts                    # server-only: firmar, leer y escribir la cookie
│  ├─ schema.ts                    # Zod de líneas y cookie v1
│  ├─ actions.ts                   # server actions de mutación
│  ├─ totals.ts                    # cálculo puro (Subtotal/Envío/Total); testable sin IO
│  └─ components/                  # cart-sheet, cart-line, cart-quantity, shipping-progress
├─ features/checkout/              # Fase 11
│  ├─ schema.ts                    # Zod del formulario
│  └─ components/                  # checkout-form (cliente), order-confirmation, whatsapp-button
├─ features/orders/                # ya existe; Fase 11 añade createOrder en actions.ts
├─ features/content/               # getPublishedPage / getFaqs (variantes de tienda en la Fase 12)
└─ features/settings/              # getStoreSettings (Fase 11): whatsapp, envío, métodos de pago
```

Reglas de separación en la tienda:

- `app/(store)` no consulta la base: solo llama a `features/<dominio>` y compone layouts.
- `components/store` no importa `features` ni `db`; recibe datos por props. Los bloques de `components/store` no pueden llamar acciones server (misma regla que `components/admin`).
- Las consultas de tienda viven separadas de las del admin: el admin lista borradores y archivados, la tienda solo publica activos con imagen y stock.
- Todo lo que sea dinero o stock se calcula en funciones puras (`totals.ts`) probadas con Vitest en la Fase 13; la UI solo formatea con `formatMoney`.
- Cada capa server-only lleva `import "server-only"`; el navegador nunca recibe secretos de cookie ni conexión a la base.
- Formularios validados con Zod en cliente y de nuevo en la server action.

### Componentes de la tienda y su capa

| Componente | Capa | Render | Uso |
| --- | --- | --- | --- |
| `StoreHeader`, `AnnouncementBar`, `StoreNav`, `SearchBar`, `MobileMenu` | `components/store` | header cliente mínimo (toggles de búsqueda y menú); contenido server | equivalente al header del prototipo |
| `StoreFooter` | `components/store` | servidor | footer con datos de settings y categorías |
| `Hero`, `AgeCollection`, `CategoriesGrid`, `BenefitsBar`, `StepsSection`, `SectionHeading` | `components/store` | servidor | secciones del home |
| `ProductCard`, `ProductGrid`, `ProductThumb` (reutilizada del admin) | `components/store` / `components/shared` | servidor | tarjetas en catálogo, home y relacionados |
| `ProductGallery`, `ProductAccordions`, `RelatedGrid` | `features/catalog/components` | servidor | página de producto |
| `ProductPurchasePanel` (compone `ColorSelector`, `SizeSelector`, `QuantityStepper`, `AddToCartForm`, `WhatsAppBuyButton`, error de talla) | `features/catalog/components` | cliente: es el único bloque interactivo del producto | reemplaza el estado `sel` del prototipo |
| `SizeGuideDialog`, `SizeGuideTable` | `features/catalog/components` | dialog cliente, tabla servidor | guía en producto y página dedicada |
| `CartSheet`, `CartLine`, `ShippingProgress`, `CartLinesActions` | `features/cart/components` | sheet cliente; líneas server; mutaciones por server actions | drawer y `/cart` |
| `CheckoutForm`, `OrderConfirmation`, `WhatsAppConfirmation` | `features/checkout/components` | form cliente con RHF + Zod; confirmación server | reemplaza el checkout directo del drawer |
| `StoreBreadcrumbs`, `StoreEmptyState`, `StorePagination`, `FaqAccordion` | `components/store` | servidor | utilidades de tienda |

Criterio de capa: `components/store` no importa features (misma regla que `components/admin`); los bloques que llaman acciones o leen dominio van en `features/<dominio>/components`. No se crean componentes de un solo uso que solo reorganicen clases.

### Consultas y módulos nuevos

La tienda no reutiliza las queries del admin tal cual: el admin lista borradores y archivados, la tienda solo publica activos con imagen y stock. Nuevas funciones, todas con `import "server-only"`:

- `features/catalog/store-queries.ts` (variantes de tienda): `listStoreProducts(filters)`, `getStoreProduct(id)`, `getStoreRelatedProducts(id, categoryId, limit)`, `getStoreBestSellers(limit)`, `getStoreNewArrivals(limit)`, `getStoreTopSellingByAge()`, `getStoreCategoryShowcase()`, `listStoreProducts` devuelve las tallas con stock como opciones de filtro. Solo productos `status = active`, con al menos una imagen y stock en alguna talla.
- `features/content/queries.ts` (variantes de tienda): `getHomeSections()`, `getPublishedPage(slug)`, `listPublishedPages()`, `listFaqs()`.
- `features/settings/queries.ts`: `getStoreSettings()` (whatsapp, envío, envío gratis, métodos de pago activos).
- `features/cart/`: `cookie.ts` (server-only: leer/firmar/serializar), `actions.ts` (`addToCart`, `updateLineQty`, `removeLine`, `clearCart`), `schema.ts`, `components/`.
- `features/checkout/`: `schema.ts` (formulario), `components/`. La acción `createOrder` vive en `features/orders/actions.ts` y usa el servicio de pedidos de la Fase 5.
- `features/catalog/size-guide.ts`: matrices de medidas por grupo de edad y tabla de calzado 28–44 (copia de negocio; la fórmula `shoeGuide` del prototipo no se migra).

No se instalan dependencias nuevas: React Hook Form, Zod, Sonner y las primitivas shadcn necesarias (Sheet, Dialog, Accordion nativo vía `details`) ya están.

### Carrito (diseño cerrado)

- **Persistencia:** cookie `mistikax_cart` firmada con HMAC usando `CART_COOKIE_SECRET`, `httpOnly`, `sameSite = lax`, `secure` en producción, vida de 30 días, formato versionado `v1`. Contenido: `[{ productId, size, colorId, qty }]`; máximo 30 líneas y qty de 1 al stock disponible; el badge muestra la suma de cantidades.
- **Precios siempre calculados:** la cookie no guarda precios; el subtotal se recalcula en servidor leyendo el producto vigente en cada render. Si un producto se archiva o queda sin stock, la línea se muestra como no disponible con opción de quitarla; si el precio cambió, se muestra el nuevo.
- **Mutaciones:** server actions (`addToCart`, `updateLineQty`, `removeLine`, `clearCart`) que validan producto, talla y stock, ajustan la cookie con `await cookies()` y devuelven resultado tipado. No se consulta la base desde el cliente y no se guarda carrito en `localStorage`.
- **Reserva de stock:** ninguna. Agregar al carrito no bloquea stock; el control definitivo ocurre en el checkout. Además del checkout: `updateLineQty` y `addToCart` rechazan cantidades por encima del stock con mensaje en español.
- **Drawer y página:** el drawer (`CartSheet` sobre shadcn Sheet) comparte contenido con `/cart`; abrir el drawer no navega. El progreso de envío gratis se calcula contra `free_shipping_threshold_cents`.

### Checkout (diseño cerrado)

- **Campos:** nombre, email, teléfono, ciudad, dirección, nota opcional, código de cupón opcional y método de pago (`transfer` o `cash_on_delivery`, filtrados por los flags de `site_settings`). Validación en cliente con Zod + React Hook Form y de nuevo en la acción.
- **Acción `createOrder` (transacción única):** revalida cada línea contra la base (producto activo, talla con stock ≥ qty, precio vigente) → valida cupón si se proporcionó (activo, no expirado, límite de usos, descuento por porcentaje o fijo con tope al subtotal) → recalcula subtotal, descuento, envío (0 si subtotal − descuento ≥ umbral) y total → inserta `orders` (`status: pending`, número humano, `customer_id` si hay sesión, `coupon_code` y `discount_cents`), `order_items` con snapshot, primera entrada de `order_status_history` → decrementa stock por talla → incrementa `uses` del cupón → limpia la cookie del carrito → devuelve número, totales y la URL de WhatsApp ya construida. Cualquier stock insuficiente o cupón inválido devuelve error tipado; nada se persiste a medias.
- **Mensaje de WhatsApp:** generado en servidor (`features/orders/whatsapp.ts`, helper ya existente del admin) con líneas, talla, color y total; el cliente solo abre `wa.me` con la URL recibida. No se vuelve a calcular nada en el cliente.
- **Confirmación:** tras el éxito, `/checkout/success?order=...&number=...&token=...` donde `token` es un HMAC de vida corta firmado con `CART_COOKIE_SECRET`; la página verifica token y número antes de mostrar resumen del pedido (evita exponer pedidos adivinando números). Ofrece reabrir el chat de WhatsApp y volver al catálogo.
- **Compra directa del prototipo:** el botón "Comprar por WhatsApp" del producto se mantiene sin crear pedido (paridad); crea el pedido solo el checkout del carrito.
- **Cupones:** conectados al checkout. El formulario incluye un campo `couponCode`; la acción `createOrderAction` valida cupón activo, no expirado, límite de usos (`max_uses`), calcula el descuento (porcentaje o fijo con tope al subtotal), incrementa `uses` atómicamente y guarda `discount_cents` y `coupon_code` en la orden. El diálogo de cupones del admin incluye el campo «Límite de usos». Migración `0009_orders_customer_coupons.sql` aplicada.

### Reglas de renderizado y estado

- Server Components por defecto: header (contenido), footer, home, catálogo, producto (salvo panel de compra), páginas, guía, FAQ.
- `"use client"` solo en: toggles de header/menú móvil, `ProductPurchasePanel`, controles de línea del carrito, `CheckoutForm` y el dialog de guía de tallas.
- El badge del carrito y el contenido del drawer vienen del servidor; como toda página que lee la cookie es dinámica, la Fase 7 no aplica caching parcial; la optimización de streaming/cache se mide en la Fase 8.
- Los filtros del catálogo manipulan la URL con `router.push(..., { scroll: false })`, equivalente al `keepScroll` del prototipo.
- Todos los estados de página (loading, empty, error, success) existen: skeletons con la forma del grid, estado vacío con CTA al catálogo, página de error de tienda. Diálogos y drawer accesibles por teclado, foco visible y cierre con Escape.
- Imágenes con `next/image`: aspect 4/5 de tarjeta y producto, `sizes` por breakpoint, LCP priority solo en el hero; placeholder local equivalente a `PH` del prototipo.

### SEO

- `generateMetadata` en producto (título, `seo_description` o descripción, canonical `/product/[id]`, OG con la imagen principal) y en páginas CMS; metadata estática en catálogo, guía, FAQ y páginas informativas.
- JSON-LD: `Product` con `offers` en PEN y `availability` según stock, `BreadcrumbList` en catálogo y producto, `FAQPage` en `/faq`.
- `sitemap.ts`: `/`, `/catalog`, `/faq`, `/size-guide`, slugs de productos activos y páginas publicadas, con `lastModified` real.
- `robots.ts`: indexa la tienda; `noindex` en `/checkout`, `/checkout/success`, `/cart` (el noindex de admin ya vive en su layout).

### Decisiones cerradas

| Tema | Decisión | Razón |
| --- | --- | --- |
| Valores de URL | `age` usa `kids/teens/adults` (enum); categorías y slugs de producto en español como contenido | los datos son inglés; SEO público en español |
| Orden por defecto | `is_best_seller DESC, sold_count DESC`; `sort=new` = `created_at DESC`; `asc`/`desc` por precio | hace determinista la posición de portada y catálogo |
| Tarjetas de edad del home | imagen del producto mejor vendido activo de cada grupo | sin configuración nueva en el CMS para la v1 |
| Compra directa sin pedido | se mantiene como mensaje simple, sin stock ni número | paridad con el prototipo; el flujo real es el checkout |
| Cupones en checkout | implementados con validación completa y `max_uses` | el CRUD existía; ahora el checkout valida, aplica y registra el descuento |
| Página de éxito | `/checkout/success` con token HMAC | evita exponer pedidos por número secuencial |
| Guía de tallas | constantes TS, no CMS | contenido de negocio estable; la fórmula del prototipo es placeholder |
| Paginación del catálogo | 24 por página | el prototipo no pagina pero la base tendrá más productos que sus 18 |
| Render dinámico en v1 | toda página lee la cookie del carrito | simple y correcto; caché se evalúa midiendo en la Fase 8 |
| Nav del header | lista curada constante con fuente única `ALL_STORE_NAV`; items con `mobileOnly` para categorías extra en móvil | desktop incluye edades, categorías principales, ofertas, guía de tallas y contacto; móvil añade Camisas, Pantalones, Casacas y Accesorios |
| Políticas del footer | páginas sembradas en el CMS en vez de `href="#"` | contenido real y obligatorio para lanzamiento |

### Cambios de comportamiento

| Prototipo | Migración |
| --- | --- |
| Router hash | Rutas del App Router y `searchParams` |
| Carrito en el navegador | Cookie firmada + revalidación en servidor |
| Strings con `innerHTML` | JSX y componentes server/client |
| Imágenes remotas (Unsplash) | Assets locales del seed y uploads servidos por la ruta de medios |
| Fuentes por CDN | `next/font` (ya cargadas en la Fase 0) |
| CSS inline | Tokens y Tailwind |
| Pedido solo por WhatsApp | Pedido pendiente en base + mensaje de WhatsApp |
| Sin SEO real | Metadata, JSON-LD, sitemap y canonical |
| `document.title` manual | metadata por ruta |
| `data-act` globales y estado `sel` | server actions y estado local del panel de compra |

La tienda comparte con el admin: formato de dinero/fechas, modelos de producto, componentes de imagen, estados vacíos y validaciones. No comparte el layout ni el tema.

---

## 8. Riesgos y restricciones

1. **Medios en Supabase Storage.** Las subidas ya no dependen del disco local: viven en el bucket privado `mistikax-media` y se sirven por `/media/[...path]`. La `SUPABASE_SECRET_KEY` es server-only y el bucket se crea en la primera subida. `storage/uploads` queda solo como respaldo de lectura para archivos anteriores; no se escriben archivos nuevos ahí.
2. **Supabase para datos y Auth.** La autorización se implementa en el servidor con el rol de `public.profiles` y se prueba por rol; RLS queda como defensa en profundidad. La clave secreta y la cadena de conexión nunca llegan al cliente, y la autorización no depende de `user_metadata`.
3. **Dos temas.** La disciplina de tokens es obligatoria. Mezclar colores o tipografías entre admin y tienda rompe la coherencia y duplica estilos.
4. **Prototipos con datos simulados.** El seed no es dato de producción. Los precios del prototipo son decimales; la base usa centavos. Las fechas y los estados deben mapearse explícitamente.
5. **Next.js 16.** `middleware.ts` está reemplazado por `proxy.ts`; `params` y `searchParams` son promesas. La documentación de shadcn y Supabase Auth debe verificarse contra las versiones instaladas en la fase correspondiente.
6. **Invitaciones y correos.** Supabase Auth puede enviar invitaciones y recuperación de contraseña, pero requieren SMTP configurado; en la primera versión se crean usuarios y se cambian roles desde el panel, sin email.
7. **Pagos.** El alcance es WhatsApp/pedido pendiente. Una pasarela de pago es otro proyecto.
8. **Cuentas de cliente.** Se añadieron en la Fase 14 para la tienda (`/account`), con correo/contraseña y Google. El checkout prerrellena datos del cliente logueado y guarda `customer_id` en la orden; la cuenta muestra el historial de pedidos con estado, fecha y total. No hay wishlist.
9. **Contenido de páginas.** El renderer soporta markdown básico (`## `, `### `, `**negrita**`, listas con `- `), además de párrafos por línea en blanco. Si se necesita rich text completo, se planifica con un editor y sanitización.
10. **Borrado de productos.** No se borra un producto con historial; se archiva. Los pedidos guardan snapshots para no romperse.

## 9. Fuera de alcance

- Pagos en línea y conciliación.
- Wishlist y programa de puntos.
- Multi-tienda, multi-moneda o i18n.
- Modo oscuro y selector de tema.
- Realtime y Edge Functions.
- Envío de emails e invitaciones.
- Analítica, marketing y SEO avanzado más allá de lo listado.

## 10. Criterios de aceptación

- [ ] Todas las rutas del inventario del admin existen y reutilizan componentes, sin HTML strings.
- [ ] Ningún flujo depende de `localStorage`; los datos persisten en Postgres.
- [ ] Las mutaciones validan en cliente y servidor; los errores se muestran sin romper la página.
- [ ] Los roles se aplican en servidor, no solo en la navegación.
- [ ] Las imágenes se sirven desde Supabase Storage con validación de MIME, cache y cabeceras correctas.
- [ ] La tienda tiene paridad con `client.html`, URLs compartibles, metadata y sitemap.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm build`, Vitest y Playwright pasan.
- [ ] La checklist de accesibilidad y rendimiento está medida, no solo declarada.
- [ ] Existe un backup probado de base y uploads.
- [ ] Los HTML se archivan o eliminan solo después de la aprobación.

## 11. Próximo paso

Las fases 0 a 12 están completadas ✅. La Fase 14 (cuentas de cliente) está implementada con historial de pedidos, cupones en checkout y vinculación de `customer_id`. La Fase 4 se desbloqueó con el pool de una conexión y lecturas secuenciales; la tienda (7–12) está implementada con rutas en inglés.

1. Terminar la Fase 13: pruebas Vitest de `totals.ts`, `size-guide.ts` y transiciones de pedido, más Playwright para login, CRUD de producto y checkout.
2. Medir accesibilidad y rendimiento en las tres vistas principales (home, catálogo, producto) y registrar los resultados en la checklist.
3. Probar el pedido completo en `/admin/orders` (crear desde `/checkout`, verlo pendiente y cancelarlo con restauración de stock).
4. Documentar las variables de entorno, el backup de base y del bucket, y el flujo de subida en Supabase Storage.
5. Aprobar la paridad final antes de archivar los HTML del prototipo.

---

## 12. Cuentas de cliente y acceso con Google (Fase 14)

**Estado:** implementada; consentimiento real de Google verificado. Historial de pedidos y vinculación de `customer_id` implementados.

**Alcance:** cuentas para la tienda, sin tocar el checkout de invitado ni el acceso del equipo.

- Rutas: `/account/sign-in`, `/account/sign-up` y `/account`; callback PKCE en `/auth/callback`. Todas las rutas y nombres de archivo van en inglés; solo el copy visible es español. El header muestra «Entrar» sin sesión y, con sesión, el nombre del cliente con un menú a `/account` y el cierre de sesión; el menú móvil incluye las mismas opciones y el footer mantiene «Mi cuenta».
- Con sesión, `/checkout` prerrellena nombre y correo; teléfono, ciudad y dirección se completan en el pedido.
- Métodos: correo/contraseña (`signInWithPassword` y `signUp`) y Google (`signInWithOAuth` con `prompt=select_account`). El registro guarda `full_name` en `user_metadata` y el trigger de `auth.users` crea el perfil con rol `customer`, que queda fuera del panel: `getAdminSession()` solo acepta `admin` o `editor` activos y el equipo filtra esos dos roles.
- `proxy.ts` refresca la sesión y redirige `/account/*` sin sesión a `/account/sign-in`; las páginas de entrar y registro redirigen a `/account` cuando ya hay sesión.
- El panel mantiene solo correo/contraseña: Google no aporta nada al equipo y añadiría una vía de acceso que no se gestiona por rol. `/login` redirige a `/admin` solo si el usuario tiene perfil activo, de modo que una cuenta de cliente no provoca un bucle de redirecciones.
- Configuración en Supabase: proveedor Google habilitado con su Client ID y Secret, y en Authentication → URL Configuration las Redirect URLs `http://localhost:3000/auth/callback` y `https://<dominio>/auth/callback`.
- Correo: sin SMTP propio, la confirmación de registro usa el remitente de Supabase. Con «Confirm email» activo, el registro muestra «revisa tu bandeja»; con auto-confirmación, entra directo.
- Pendiente: probar el consentimiento de Google en local, el registro con confirmación y el cierre de sesión; añadir «olvidé mi contraseña» cuando haya SMTP configurado.
5. Aprobar la paridad final antes de archivar los HTML del prototipo.

## 12. Endurecimiento de seguridad aplicado

Auditoría del cliente y de la sesión (2026-11-08), verificada contra la base real y el servidor de desarrollo.

- [x] RLS activo en las 17 tablas de `public` y grants de `anon`/`authenticated` revocados (`drizzle/0007_security_hardening.sql`); PostgREST responde 401 `42501`.
- [x] Migración `0009_orders_customer_coupons.sql` aplicada: `customer_id`, `coupon_code` y `discount_cents` en `orders`; `max_uses` en `coupons`; índice `orders_customer_id_idx`.
- [x] Eliminada la Server Action `lookupOrderForConfirmation`, que exponía pedidos por `ord_N` sin token.
- [x] Token de confirmación con caducidad de 24 h y comparación en tiempo constante.
- [x] Número de pedido serializado con `pg_advisory_xact_lock`; sin colisiones por concurrencia.
- [x] Rate limit de 10 pedidos cada 10 minutos por IP en `createOrderAction`.
- [x] Origen canónico (`NEXT_PUBLIC_SITE_URL`) para los callbacks de Supabase; documentado en `.env.example`.
- [x] JSON-LD escapado con `serializeJsonLd` en producto y FAQ.
- [x] CSP, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` y HSTS en producción desde `next.config.ts`.
- [x] `getCustomerSession` rechaza perfiles inactivos; topes en filtros y cantidades; `robots.txt` excluye `/account`.
- [x] Verificado: `/`, `/catalog`, `/product/[id]`, `/size-guide`, `/faq` y `/cart` responden 200; `/admin` sin sesión redirige a `/login`; `pnpm typecheck`, `pnpm lint` y `pnpm build` terminan en 0.

Pendiente de la Fase 13: pedido end-to-end (checkout → admin → cancelación con reposición), rate limit compartido entre instancias (hoy en memoria) y auditoría de accesibilidad medida.

---

## 13. Medios en Supabase Storage

**Estado:** implementado el 2026-11-08 con el bucket privado `mistikax-media`.

**Decisión:** las subidas del panel dejan el disco local y viven en Supabase Storage. Se conserva la URL pública `/media/<object_key>` servida por `src/app/media/[...path]/route.ts`, así que los valores de `media.path` y `product_images.path` no cambian y el catálogo sigue funcionando.

- **Bucket:** `mistikax-media`, privado. Se crea automáticamente en la primera subida con `SUPABASE_SECRET_KEY`; el nombre se puede cambiar con `SUPABASE_STORAGE_BUCKET`. Límite de 5 MB y MIME permitidos: PNG, JPEG, WebP, GIF y SVG.
- **Clave del objeto:** `YYYY/MM/<uuid>.<ext>`, la misma que `media.object_key`. Cada fila guarda `path = /media/<object_key>`, `source = upload`, MIME, bytes y checksum SHA-256.
- **Subida:** `writeUploadFile` valida los magic bytes con `detectImage` antes de llamar a Storage; si falla el insert en `media`, la acción borra el objeto recién subido.
- **Lectura:** `readUploadFile` descarga del bucket y la ruta responde con `Cache-Control: public, max-age=31536000, immutable`, `X-Content-Type-Options: nosniff` y CSP `default-src 'none'; sandbox`. Si el objeto no está en el bucket, intenta `storage/uploads` como respaldo legado; ese directorio ya no recibe archivos nuevos.
- **Borrado:** elimina el objeto del bucket y el archivo legado si existe; las filas `catalog` siguen protegidas y una imagen en uso por un producto no se puede borrar.
- **Seguridad:** la service key solo se usa en módulos `server-only`; el bucket es privado y el cliente nunca recibe la clave ni URLs firmadas. El SVG se sirve con CSP sandbox para que no ejecute scripts.
- **Migración:** los objetos subidos antes del cambio se copiaron con el `object_key` y el `mime` de `media`. Se verificó con una descarga real y con una petición a la URL pública del bucket, que debe fallar.
- **Catálogo:** las fotos reales de producto y el hero viven en `catalog/<id>.<ext>` del mismo bucket. `src/features/catalog/media-manifest.ts` guarda path, MIME, bytes y checksum para que `pnpm db:seed` las reinserte sin leer archivos locales.
- **Pendiente:** probar una subida desde `/admin/media` con una cuenta real y definir el respaldo del bucket (Supabase incluye los objetos en los backups del proyecto; no hay versionado por defecto).
