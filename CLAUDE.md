# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Teaching starter app (CodingThailand) for a software-testing / unit-testing course: a small e-commerce site built with Next.js 16 (App Router, React 19), Prisma 7 + SQLite (via `better-sqlite3` driver adapter), Better Auth, shadcn/ui (`radix-rhea` style) and Tailwind CSS v4. UI text, code comments and the README are in Thai — keep new user-facing strings and comments in Thai to match.

## Commands

```bash
npm run dev                 # dev server on :3000 (npm run dev -- -p 3100 for another port)
npm run build               # production build — fails if BETTER_AUTH_SECRET is empty ("You are using the default secret")
npm run lint                # eslint (next core-web-vitals + typescript)
npx tsc --noEmit            # type check (no script for this)

npx prisma generate         # regenerate client into generated/prisma/ (gitignored — required after install or schema change)
npx prisma db push          # sync schema to prisma/dev.db (no migrations are used)
npx prisma studio           # GUI for the DB

npm run db:test:setup       # recreate prisma/test.db from schema + seed SQL (--empty for schema only)
npm run db:seed:orders      # insert deterministic orders for the last 90 days (ids >= 1000, idempotent); optional path arg e.g. prisma/test.db
```

No test framework is installed yet (no test script, no Jest/Vitest/Playwright config). Adding one is part of the course work.

Setup: `cp .env.example .env`, set `BETTER_AUTH_SECRET` (`npx @better-auth/cli secret`), `npm install`, `npx prisma generate`, `npx prisma db push`. Seed data is loaded from `docs/insert_data_ecom_example_50_products.sql` — note `docs/` is not currently present in this checkout, so the seed scripts that read it will fail until it is added.

## Current state of the repo

This is a stripped-down starter: several modules referenced by existing code are **missing** and `tsc` currently fails on them:
- `@/lib/product/product-service` (`getProductList`) and `@/lib/product/product-image` (`fileSystemImageExists`) — used by `src/app/(front)/page.tsx`
- `@/components/featured-products`, `@/app/(front)/components/CountCartItem` (used by `navbar.tsx`)
- `@/lib/admin/{period,revenue,stats}` — imported by `src/types/admin.ts`

The README also describes routes that don't exist here yet (`/product`, `/cart`, `/contact`, `/course`, `/admin`, `/admin/products`, `/api/admin/*`). `src/types/*.ts` define the intended shapes for these (product view models, admin API responses, cart items, courses) — use them as the contract when implementing the missing pieces.

## Architecture

**Route groups with separate root layouts.** `src/app/(front)/layout.tsx` and `src/app/(auth)/layout.tsx` each render their own `<html>`/`<body>` (there is no shared `src/app/layout.tsx`). `(front)` includes the `Navbar` (wrapped in `Suspense`) and a `react-toastify` `ToastContainer`; `(auth)` (login/signup) has no navbar. Both import `../globals.css`.

**Cache Components is enabled** (`cacheComponents: true` in `next.config.ts`). Pages/layouts that do dynamic work currently opt out with `export const instant = false` (marked TODO). Server components that hit the DB call `await connection()` and are wrapped in `<Suspense>` with a skeleton fallback.

**Dependency injection for testability.** Service functions take their dependencies as parameters rather than importing them — e.g. `getProductList(params, { prisma, imageExists, pageSize })`. Tests are meant to build their own `PrismaClient` pointed at `prisma/test.db` (via `npm run db:test:setup`, `DATABASE_URL="file:./prisma/test.db"`) and pass it in, so integration tests never touch `prisma/dev.db`. Follow this pattern for new services/repositories.

**Validation schemas live outside components.** Zod schemas (`src/lib/auth-schema.ts`) are separate from the forms so rules can be unit-tested without rendering. Forms use `react-hook-form` + `zodResolver` with shadcn `Field`/`Controller`. `MIN_PASSWORD_LENGTH` in `auth-schema.ts` must stay in sync with `minPasswordLength` in `src/lib/auth.ts`.

**Auth (Better Auth).**
- Server: `src/lib/auth.ts` (Prisma adapter, email+password, `autoSignIn: false`), mounted at `src/app/api/auth/[...all]/route.ts`. Server components read the session via `auth.api.getSession({ headers: await headers() })`.
- Client: `src/lib/auth-client.ts` declares the extra `role` field with `inferAdditionalFields` by hand instead of importing the server auth type — this keeps Prisma out of the client bundle. Don't import `@/lib/auth` from client code.
- `role` (`"user"` | `"admin"`) has `input: false`, so it can only be changed directly in the DB (`UPDATE user SET role='admin' ...`); users must log out/in for it to take effect.

**Prisma.** Schema in `prisma/schema.prisma`, config in `prisma.config.ts` (loads `.env` via `dotenv`). Client is generated with the `prisma-client` generator to `generated/prisma/` and imported via the `@generated/*` path alias (`@generated/prisma/client`). `src/lib/prisma.ts` exports a global singleton using `PrismaBetterSqlite3`. Auth models are PascalCase mapped to lowercase tables (`user`, `session`, …); shop tables (`products`, `categories`, `orders`, `order_items`, `customers`, `product_images`) are snake_case with mostly nullable columns — normalize nulls into view models (see `ProductRow` → `ProductViewModel` in `src/types/product.ts`). `order_items → products` has no cascade, so deleting an ordered product must be handled gracefully.

**Images.** Product images are files in `public/product-image/`; `product_images.image_name` references them and a picture is only exposed if the file exists. Remote images are allowed only from `www.fffuel.co` and `api.codingthailand.com`.

**External course API.** Courses come from `https://api.codingthailand.com/api/course`; `COURSE_API_URL` overrides it (intended for pointing at a mock server during e2e).

**E2E hooks.** Interactive elements carry `data-testid` attributes (`login-email`, `login-submit`, `nav-cart`, `nav-user-name`, `logout-button`, …). Preserve them and add them to new interactive UI.

Path aliases: `@/*` → `src/*`, `@generated/*` → `generated/*`. shadcn components go in `src/components/ui` (add via `npx shadcn add <component>`).
