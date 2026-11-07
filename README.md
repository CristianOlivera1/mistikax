# Mistikax

A menswear and footwear store in Peru (PEN) with an admin panel. The project is migrating the `dashboard.html` and `client.html` prototypes to a Next.js 16 app with reusable components.

## Requirements

- Node.js 24
- pnpm 11

## Development

```bash
pnpm install
pnpm dev
```

The app is available at `http://localhost:3000`.

Current routes:

- `/` — storefront placeholder
- `/login` — admin sign-in with Supabase Auth and cookie session
- `/admin` — dashboard with KPIs, a chart, low stock and recent orders from Postgres
- `/admin/products`, `/admin/products/new`, `/admin/products/[id]` — catalog with search, filters, pagination, and a validated editor
- `/admin/categories` — categories with size type and a create/edit dialog
- `/admin/inventory` — stock by size and low-stock alerts
- `/admin/orders`, `/admin/orders/[id]` — order list with status tabs, search and pagination; detail with items, totals, customer, history, status transitions and internal notes
- `/admin/orders/export` — JSON export of all orders with their items snapshot
- `/admin/customers` — customers derived from orders, with search
- `/admin/coupons` — coupon table with real create, edit and delete
- `/admin/content/home` — announcement, hero and home-section editor with preview
- `/admin/content/pages`, `/admin/content/pages/new`, `/admin/content/pages/[id]` — page list and editor with real save and publication
- `/admin/content/faqs` — FAQ list with create, edit, delete and persistent ordering
- `/admin/media` — local media grid, uploads and deletion for user files
- `/media/[...path]` — serves uploaded files from `storage/uploads` with immutable caching
- `/admin/settings?tab=general|shipping|payments|team|appearance` — tabbed settings forms and team overview

## Troubleshooting

Three environment issues blocked the dev server in November 2026. They are fixed; check them first if the app stops loading.

1. **Store pages stuck on the "Cargando la tienda" skeleton.** The store layout used `next/font/google`, and the compiler failed to resolve `@vercel/turbopack-next/internal/font/google/font`, so the layout never got past its Suspense fallback. The four families (Manrope, Oswald, Montserrat, Space Mono) now load from `@import` in `src/app/globals.css` and map through `.theme-store` variables. Do not reintroduce `next/font/google` in the store layout.
2. **Every request waited on one database connection.** `src/db/index.ts` used `max: 1`, which serialized the store layout's ten-plus queries and pushed the page past two minutes. The pool now uses `max: 10` and `idle_timeout: 60`, still with `prepare: false` for the Supabase pooler.
3. **`node_modules` corrupted after runner restarts.** Missing `next`, `react` and `drizzle-orm` produced confusing type and lint errors. `rm -rf node_modules && pnpm install` restores it, and no build or dev server should run while that reinstall is in progress.

Verified after the fixes: `/` returns 200 in about 4 s with real content, `/admin/orders` returns 200, and `pnpm typecheck`, `pnpm test`, `pnpm lint` and `pnpm build` pass.

## Available scripts

```bash
pnpm dev        # start the development server
pnpm build      # create a production build
pnpm start      # serve the production build
pnpm lint       # run ESLint
pnpm typecheck  # run TypeScript without emitting files
pnpm format     # run Prettier and sort Tailwind classes
pnpm db:generate # generate Drizzle migrations from the schema
pnpm db:migrate  # apply Drizzle migrations to Supabase Postgres
pnpm db:seed     # seed catalog, orders, coupons, CMS pages, FAQs, home and settings
pnpm test       # run Vitest unit tests (order totals, transitions and stock)
```

## Project structure

```text
src/
├─ app/          # routes, layouts, and metadata
│  ├─ (store)/   # public storefront
│  ├─ (admin)/   # private admin panel
│  └─ (auth)/    # sign-in
├─ components/   # shadcn/ui, shared components, and area-specific shells
├─ features/     # domain components, queries, actions, and schemas
├─ db/           # Drizzle schema, client, and seed
├─ drizzle/      # generated migrations
└─ lib/          # utilities, constants, and environment configuration
```

Local assets are in `public/images` and `public/svg`. Runtime uploads will be stored in `storage/uploads`, outside `public`.

## Status

Phases 1–5 are complete: the admin panel foundation, catalog with real Supabase Postgres persistence, product CRUD, archiving, duplication, inventory and category constraints, local media uploads served through `/media/[...path]`, and persistent orders, coupons, CMS pages, FAQs, home content and store settings. Order status transitions are transactional: cancelling restores stock once and every change is recorded in the order history. The admin Resumen computes its KPIs and daily series from real orders.

Phase 6 is in progress: Supabase Auth sessions, cookie refresh in `src/proxy.ts`, real sign-in and sign-out, and `profiles` with `admin`/`editor` roles. Team management (list, change role, deactivate) is next. Accounts are created in Supabase Auth: the first user becomes `admin` through migration `0003_profiles`, later users default to `editor`. Pending: uploads made by real users, and Playwright end-to-end coverage.

## Documentation

- [plan.md](plan.md) — phases, target structure, data model, and storefront migration.
- [CLAUDE.md](CLAUDE.md) — coding, architecture, UI, and security guidelines.
