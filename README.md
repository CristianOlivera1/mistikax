# Mistikax

Tienda de ropa y calzado para hombre (Perú, PEN) y su panel de administración. El proyecto está migrando los prototipos `dashboard.html` y `client.html` a una app Next.js 16 con componentes reutilizables.

## Requisitos

- Node.js 24
- pnpm 11

## Desarrollo

```bash
pnpm install
pnpm dev
```

La app queda disponible en `http://localhost:3000`.

Rutas actuales:

- `/` — placeholder de la tienda
- `/login` — pantalla de acceso del panel (validación lista; sesión pendiente)
- `/admin` — Resumen con KPIs, gráfico y pedidos recientes (datos de ejemplo)
- `/admin/products`, `/admin/products/new`, `/admin/products/[id]` — catálogo con búsqueda, filtros, paginación y editor validado (datos de ejemplo)
- `/admin/categories` — categorías con tipo de talla y diálogo de creación/edición
- `/admin/inventory` — stock por talla y alertas de stock bajo
- `/admin/orders`, `/admin/customers`, `/admin/coupons`, `/admin/content/*`, `/admin/media`, `/admin/settings` — rutas del panel con placeholders

## Scripts

```bash
pnpm dev        # servidor de desarrollo
pnpm build      # build de producción
pnpm start      # servir el build
pnpm lint       # ESLint
pnpm typecheck  # TypeScript sin emitir
pnpm format     # Prettier + orden de clases de Tailwind
```

## Estructura

```text
src/
├─ app/          # rutas, layouts y metadata
│  ├─ (store)/   # tienda pública
│  ├─ (admin)/   # panel privado
│  └─ (auth)/    # login
├─ components/   # shadcn/ui, shared y shell por área
├─ features/     # dominio: components, queries, actions y schemas
├─ db/           # esquema Drizzle (fase 4)
└─ lib/          # utilidades, constantes y entorno
```

Los assets locales viven en `public/images` y `public/svg`; las subidas de runtime irán a `storage/uploads`, fuera de `public`.

## Estado

Fases 1 y 2 completadas: base Next.js en `src/`, shadcn/ui, Tailwind v4, temas de admin y tienda, fuentes locales, login visual, shell del panel (sidebar, topbar, breadcrumbs y command palette), Resumen y catálogo de productos, categorías e inventario con fixtures tipados y editor validado.

La autenticación real (Supabase Auth) y la base de datos se conectan en fases posteriores. No hay sesión ni base de datos en este momento; el guardado real de las mutaciones llega con la Fase 4.

## Documentación

- [plan.md](plan.md) — fases, estructura objetivo, modelo de datos y migración de la tienda.
- [CLAUDE.md](CLAUDE.md) — reglas de código, arquitectura, UI y seguridad.
