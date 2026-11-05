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
- `/login` — admin sign-in page (validation is ready; session support is pending)
- `/admin` — dashboard with KPIs, a chart, and recent orders (sample data)
- `/admin/products`, `/admin/products/new`, `/admin/products/[id]` — catalog with search, filters, pagination, and a validated editor (sample data)
- `/admin/categories` — categories with size type and a create/edit dialog
- `/admin/inventory` — stock by size and low-stock alerts
- `/admin/orders`, `/admin/orders/[id]` — order list with status tabs, search and pagination; detail with items, totals, customer and history
- `/admin/customers` — customers derived from orders, with search
- `/admin/coupons` — coupon table and validated create/edit dialog
- `/admin/content/home` — announcement, hero and home-section editor with preview
- `/admin/content/pages`, `/admin/content/pages/new`, `/admin/content/pages/[id]` — page list and validated editor
- `/admin/content/faqs` — FAQ list, edit dialog and ordering controls
- `/admin/media` — local media grid with URL copy
- `/admin/settings?tab=general|shipping|payments|team|appearance` — tabbed settings forms and team overview

## Available scripts

```bash
pnpm dev        # start the development server
pnpm build      # create a production build
pnpm start      # serve the production build
pnpm lint       # run ESLint
pnpm typecheck  # run TypeScript without emitting files
pnpm format     # run Prettier and sort Tailwind classes
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
├─ db/           # Drizzle schema (phase 4)
└─ lib/          # utilities, constants, and environment configuration
```

Local assets are in `public/images` and `public/svg`. Runtime uploads will be stored in `storage/uploads`, outside `public`.

## Status

Phases 1, 2 and 3 are complete: the Next.js foundation in `src/`, shadcn/ui, Tailwind v4, admin and storefront themes, local fonts, sign-in UI, admin shell (sidebar, top bar, breadcrumbs, and command palette), dashboard, catalog, orders, customers, coupons, content, media and settings with typed fixtures and validated forms.

Supabase Auth and the database will be connected in later phases. There is currently no session or database; orders and customers share a single fixture source, while persistent mutations, media uploads and order transitions are planned for phases 4 and 5.

## Documentation

- [plan.md](plan.md) — phases, target structure, data model, and storefront migration.
- [CLAUDE.md](CLAUDE.md) — coding, architecture, UI, and security guidelines.
