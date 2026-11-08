# Mistikax — AI Agent Rules

Mistikax is a menswear store in Peru (PEN) and its admin panel. The Next.js 16 App Router app is the product. `dashboard.html` and `client.html` are design references that are being migrated; `plan.md` is the source of truth for the target structure, component inventory, and migration order.

Read `plan.md` before changing folders, routes, the design system, the database, or authentication.

## 1. Non-negotiables

1. **English for all code.** Identifiers, types, file and folder names, database tables and columns, environment variables, branch names, comments, and commit messages are English. Spanish is only for user-facing copy and business content.
2. **No comments by default.** Add one only when it explains a non-obvious *why*: a browser workaround, a security decision, a data invariant, or a surprising third-party behavior. Never narrate what the code does, never leave commented-out code, and never add JSDoc that repeats the types.
3. **Supabase provides Postgres, Auth and Storage.** Use Drizzle ORM for application data, Supabase Auth through `@supabase/ssr` for identities and sessions, and Supabase Storage for runtime uploads. Do not add Realtime or Edge Functions.
4. **Runtime images live in Supabase Storage.** Committed content images live in `public/images`, brand logos stay in `public/svg`, and uploads live in the private `mistikax-media` bucket (`SUPABASE_STORAGE_BUCKET`), served through `/media/[...path]`. Never add S3, Cloudinary, or remote image URLs to production data.
5. **UI stack is fixed.** Use shadcn/ui primitives, Tailwind CSS v4, and Iconify icons for application UI. Vendored shadcn components may keep their internal `lucide-react` imports; do not add another icon set or use lucide icons in application code.
6. **TypeScript strict.** No `any`, no non-null assertions to silence errors, no `@ts-ignore`, and no disabled lint rules. Fix the type or validate the boundary with Zod.
7. **Server-first.** Server Components are the default. Add `"use client"` only to the smallest interactive leaf. Do not fetch initial page data from `useEffect`.
8. **Do not delete the HTML prototypes** until the migration is signed off. Do not copy their inline JavaScript patterns into React.

## 2. Current state

| Path | Role |
| --- | --- |
| `dashboard.html` | Admin prototype: hash router, inline Tailwind, seed data in `localStorage`, Spanish UI |
| `client.html` | Storefront prototype: hash router, product catalog, cart drawer, WhatsApp checkout |
| `src/app/` | Next.js 16 app: root layout, themes, store placeholder, admin shell with Resumen, catalog, sales, content, media, settings and login |
| `src/features/dashboard/` | Admin Resumen queries: KPIs, daily sales series, low stock, recent orders and top products from Postgres |
| `src/features/catalog/` | Product, category and inventory database queries, Zod actions and admin components; fixtures remain only as seed source |
| `src/features/orders/` | Order queries, transactional status transitions with stock restore, notes, WhatsApp helper, pure `service.ts` and detail presentation |
| `src/features/customers/` | Customers derived from database orders, with search |
| `src/features/coupons/` | Coupon queries, table and CRUD actions over Postgres |
| `src/features/content/` | Home, page and FAQ queries and editors persisted in Postgres |
| `src/features/media/` | Media database queries, upload/delete actions and grid; served through `app/media/[...path]` |
| `src/db/` | Drizzle client, catalog/media/orders/content schema, and reproducible seed for catalog, orders, coupons, CMS and settings |
| `src/features/settings/` | Store settings queries and persisted forms; the team view stays read-only until phase 6 |
| `public/svg/` | Brand logos |
| Supabase Storage `mistikax-media` | Private bucket for runtime uploads, organized as `YYYY/MM/<uuid>.<ext>` and served through `/media/[...path]` |
| `plan.md` | Migration roadmap and target architecture |

Store fonts load from `@import` in `src/app/globals.css`, not `next/font/google`; the latter breaks the store layout under Turbopack. The database pool in `src/db/index.ts` must keep `max` above one, or the store layout serializes all of its queries. See the README troubleshooting section for the full incident.

The prototypes are a visual reference, not an architecture reference. Their helper functions (`page()`, `tbl()`, `modal()`, `fld()`, `toast()`) map to React components; their `innerHTML` strings must become JSX.

## 3. Stack

| Layer | Choice | State |
| --- | --- | --- |
| Framework | Next.js 16 App Router, React 19 | Installed |
| Language | TypeScript 5, strict | Installed |
| Styling | Tailwind CSS v4, CSS-first tokens | Installed |
| Components | shadcn/ui, Radix primitives, `cva` | Installed |
| Icons | Iconify, local `lucide` subset | Installed |
| Database | Supabase Postgres, Drizzle ORM, `postgres.js` | Installed for catalog, media, orders, customers, coupons, content and settings |
| Auth | Supabase Auth with `@supabase/ssr`; roles in `profiles` | Planned |
| Validation | Zod; React Hook Form on client forms | Installed |
| Admin UI | TanStack Table, Recharts | Recharts installed; TanStack Table planned |
| Feedback | Sonner, cmdk | Installed |
| Tests | Vitest, Testing Library, Playwright | Vitest installed with order service tests; Testing Library and Playwright planned |
| Package manager | pnpm | Installed |

Do not install a dependency that is not listed in `plan.md` without asking first. When a listed dependency is not installed yet, do not silently replace it with another one.

## 4. Architecture rules

- One Next.js app with route groups. Storefront lives under `src/app/(store)`; admin lives under `src/app/(admin)/admin`; login lives under `src/app/(auth)`.
- Every file, folder, route segment and CMS page slug is English (`/catalog`, `/product/[id]`, `/cart`, `/checkout`, `/pages/[slug]`, `/pages/terms-and-conditions`, `/size-guide`). Public copy and category/product slugs stay in Spanish (`polos`).
- `src/app` only handles routing, layouts, metadata, and page composition. Domain logic belongs in `src/features/<domain>`.
- A feature owns its components, queries, actions, schemas, and types. Cross-feature imports go through public module files, never through another feature's internals.
- `src/components/ui` is vendored shadcn code. Do not fork it; add variants with `cva` and theme through tokens. Shared app primitives live in `src/components/shared`; area-specific patterns live in `src/components/admin` or `src/components/store`.
- No barrel `index.ts` files, except `src/db/schema/index.ts`, which Drizzle Kit uses to discover the schema. Import from concrete files everywhere else.
- Use kebab-case file names (`product-form.tsx`), PascalCase component exports, and `use-*` hook names.
- Named exports everywhere except Next.js special files (`page.tsx`, `layout.tsx`, `error.tsx`, `loading.tsx`, `route.ts`).
- No TypeScript `enum`. Use `as const` objects and union types.
- `params` and `searchParams` are Promises in Next.js 16. Await them before use.
- `src/proxy.ts` is the Next.js 16 request boundary. Refresh the Supabase Auth session there and use it only for coarse redirects; always re-check the session and role in the admin layout and in every protected server action.
- Guard server-only modules with `import "server-only"`: database clients, auth helpers, upload utilities, and anything that reads secrets.
- URL search params are the source of truth for filters, tabs, and pagination. Do not mirror them in client state.
- Validate every mutation twice: in the form with Zod, and again in the server action before touching the database.
- Keep components focused. Extract a component when it is reused or when a file stops fitting on one screen; do not create abstractions for a single use.
- Do not add `useMemo`, `useCallback`, or `React.memo` by default. Measure first.

## 5. Data and security

- Money is stored as integer cents in the database (`price_cents`, `shipping_cents`, `total_cents`). Format it only at the UI edge with `Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" })`.
- Database writes go through feature server actions or domain services. Never query the database from a Client Component.
- Catalog and order queries live in `features/<domain>/queries.ts`; mutations live in `features/<domain>/actions.ts` and must return a typed result instead of leaking raw errors.
- Orders are never hard-deleted. Cancel them, record the transition in `order_status_history`, and restore stock inside one transaction.
- Products are archived, not deleted, when they have order history. Slugs are stable; if a slug must change, add a redirect.
- Use UTC timestamps in the database and format dates in `es-PE` at the edge.
- `DATABASE_URL` and `DIRECT_URL` are server-only. Use the pooled connection at runtime with `prepare: false`; use the direct connection only for migrations.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are public by design; any table they can reach through the Data API must have RLS enabled and explicit grants. `SUPABASE_SECRET_KEY`, `DATABASE_URL`, and `DIRECT_URL` are server-only, bypass RLS, and must never reach the browser.
- Supabase Auth is the identity provider. Validate the session with `getUser()` in server code; `getSession()` is not an authorization check and `user_metadata` is user-editable. Read the role from `public.profiles` and enforce it server-side.
- The dashboard has two roles for now: `admin` and `editor`. Admin manages everything; editor manages catalog, content, and media. Enforce them server-side in layouts and actions; hiding a button is not authorization.
- Environment variables are validated with Zod in `src/lib/env.ts`. Never expose a secret with a `NEXT_PUBLIC_` prefix; only the Supabase URL and publishable key are public.
- Uploads must validate MIME type and magic bytes, reject path traversal, generate a random file name, enforce a size limit, and never trust the original filename. Store uploads in the private Supabase Storage bucket and serve them through the media route.
- Never write new uploads to local disk. `storage/uploads` is only a legacy read fallback for files created before the Storage migration.

## 6. UI rules

- Two themes share one primitive base: `.theme-admin` and `.theme-store`, applied by the corresponding layout. There is no theme switcher and no dark mode in the current scope.
- Style with semantic tokens (`bg-background`, `text-muted-foreground`, `border-border`, `bg-primary`). Do not scatter hex values or arbitrary colors through components.
- Tailwind CSS v4 is CSS-first: tokens live in `src/app/globals.css` with `@theme`. Do not create `tailwind.config.js`.
- Admin density: 13px base text, 32px controls, 8px radius, dense tables. Storefront: editorial typography, square corners, generous spacing, beige palette.
- UI copy is Spanish (`es-PE`), including admin labels. Currency is `S/`. Keep business copy from the prototypes unless the user asks to change it.
- Icons: `<Icon icon="lucide:..." />` from `@iconify/react`, default 16px in admin and 18–20px in the storefront. Icon-only buttons need an `aria-label`. Bundle icon data locally; never call `api.iconify.design` at runtime.
- Use `next/image` with explicit dimensions or `fill` plus `sizes`, meaningful `alt`, and `priority` only for the LCP image. Local assets only.
- Every page handles four states: loading, empty, error, and success. Use skeletons for layout-shaped loading, not spinners over content.
- Use shadcn Dialog/Sheet/AlertDialog for overlays, Sonner for toasts, and cmdk for the command palette. Do not build custom modal or toast primitives.
- Forms use labels, descriptions, and inline errors. Preserve keyboard navigation, visible focus, and reduced-motion behavior.
- Render user content as text. Do not use `dangerouslySetInnerHTML`; page bodies are plain text with blank-line paragraphs unless a sanitized rich-text editor is explicitly planned.
- Admin metadata sets `robots: { index: false, follow: false }` at the admin layout level; do not override it on individual pages.

## 7. Working agreement

- Read the current phase in `plan.md` before starting. Do not jump to Supabase, auth, or uploads before their phase gate.
- Make the smallest change that satisfies the request. Do not refactor unrelated code or rename files without need.
- When moving files, update imports, `tsconfig` paths, and the route tree in the same change.
- Before saying a task is complete, run the checks that cover it:
  - UI or types: `pnpm lint`, `pnpm typecheck`, and `pnpm build`.
  - Data logic: the focused Vitest file, plus `pnpm build`.
  - Do not claim a check passed if it was not run.
- Do not commit, push, open a PR, run migrations against a shared database, or deploy unless explicitly asked.
- Never print, commit, or send secrets from `.env` files. Never read a secret file just to inspect it.
- If a request conflicts with these rules, say so and propose the smallest compliant alternative.

## 8. Definition of done

- Code and file names are English; UI copy is Spanish.
- No comments that restate the code.
- Server Components by default; client code limited to interactive leaves.
- No `any`, no suppressed errors, no unused code.
- Responsive at 375px, 768px, and 1280px; keyboard accessible.
- Data validated at the boundary; authorization checked server-side.
- Runtime images live in Supabase Storage; Supabase provides Postgres, Auth and Storage.
- `pnpm lint` and `pnpm build` pass.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
