# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Teaching app (CodingThailand) for a software-testing / unit-testing course: an **online course-selling platform** (catalog, cart + coupons, fake payment, per-course refunds, lesson progress, certificates, reviews, admin dashboard) built with Next.js 16 (App Router, React 19), Prisma 7 + SQLite (via `better-sqlite3` driver adapter), Better Auth, shadcn/ui (`radix-rhea` style) and Tailwind CSS v4. UI text, code comments and the README are in Thai — keep new user-facing strings and comments in Thai to match.

The code itself is the teaching material: **every change must keep the code easy to unit test** (see Architecture). Requirements → user stories → test case design live in `docs/requirements/user-stories-and-test-cases.md`; keep its constants, error codes, function names and expected values in sync with the code.

## Commands

```bash
npm run dev                 # dev server on :3000 — another port needs BETTER_AUTH_URL to match, e.g.
                            # BETTER_AUTH_URL=http://localhost:3100 npm run dev -- -p 3100  (else login fails: "Invalid origin")
npm run build               # production build — fails if BETTER_AUTH_SECRET is empty
npm run lint                # eslint (next core-web-vitals + typescript)
npx tsc --noEmit            # type check (no script for this)

npx prisma generate         # regenerate client into generated/prisma/ (gitignored — required after install or schema change)
npx prisma db push          # sync schema to prisma/dev.db (no migrations are used)
npm run db:seed             # prisma/seed.ts → wipes domain data + @example.com users, inserts demo data (orders relative to today)
npm run db:test:setup       # recreate prisma/test.db from schema + seed (--empty for schema only)
```

No test framework is installed **on purpose** (no test script, no Vitest/Jest/Playwright config) — adding one is part of the course work. Seed accounts: `admin@example.com`, `user@example.com`, `student01…20@example.com`, password `password123`.

## Architecture

**Layers (functional core, imperative shell).** Inner layers never import outer ones.

1. **Pure rules** — `src/lib/**/*-rules.ts`, `*-policy.ts`, `progress.ts`, `allocate-discount.ts`, `checkout-quote.ts`, `catalog-params.ts`, `course-sort.ts`, `*-mapper.ts`, `admin/{period,revenue,stats}.ts`, `auth/authorize.ts`, `shared/*.ts`. They must not import Prisma, `next/*` or `fetch`, and must not call `new Date()`/`Date.now()`/`Math.random()` or read `process.env` — pass everything in.
2. **Repositories** — each `*-repository.ts` exports `interface XxxRepository` + `createPrismaXxxRepository(db: DbClient)` (`DbClient = PrismaClient | Prisma.TransactionClient`). They return domain types via pure mappers, never raw Prisma models. `src/lib/repositories.ts` bundles them (`createPrismaRepositories`) and defines `UnitOfWork.run(fn)` for transactions.
3. **Services** — `createXxxService(deps)` in `*-service.ts`; depend only on repository interfaces and ports (`Clock`, `PaymentGateway`, `CodeGenerator`, `fetch`). Never import `@/lib/prisma` or `@/lib/container`.
4. **Shell** — Server Actions (`src/app/**/actions.ts`), Route Handlers (`src/app/api/admin/*`) and pages: authorize (`authorizeUser`/`authorizeAdmin`) → parse with zod (`parseWithSchema`) → call `services.*` from `src/lib/container.ts` → map with `toActionState` / `errorResponse`. Only `src/lib/auth/session.ts` and the shell may use `headers()`/`redirect()`.

`src/lib/container.ts` (`server-only`) is the single composition root; tests must not import it — they build services with fakes or with `createPrismaRepositories(testPrisma)` pointed at `prisma/test.db`.

**Errors.** Business errors are returned as `Result<T>` (`src/lib/shared/result.ts`), not thrown. Codes + Thai messages live only in `src/lib/shared/errors.ts`; HTTP mapping in `shared/http.ts`.

**Money & time.** All money is `Int` satang (`formatTHB`, `bahtToSatang` in `shared/money.ts`; forms take baht and convert in the zod transform). Business dates use `Asia/Bangkok` (`toDateKey`, `toBusinessYear` in `shared/clock.ts`).

**Key rules** (constants are exported — don't hardcode): coupon `PERCENT` floors to satang and respects `maxDiscountSatang`, never exceeds subtotal, one per order; discount is allocated per item (`allocateDiscount`, remainder to last item) and stored as `OrderItem.paidSatang`; refunds per item within `REFUND_WINDOW_DAYS = 7` and progress ≤ `REFUND_MAX_PROGRESS_PERCENT = 20` (refund → item `REFUNDED`, enrollment `REVOKED`, review deleted); certificate at 100% (`CT-YYYY-XXXXXX`); checkout reserves inside a transaction (re-checks enrollment + blocks a second PENDING order for the same course within `PENDING_ORDER_TTL_MINUTES`), charges outside it, records `paymentRef` immediately and compensates (`paymentGateway.refund` + FAILED) if marking PAID fails; `total = 0` skips the gateway. Refund guards are in the write (`updateMany where status = PAID`) and the gateway refund runs inside the transaction. Concurrency-sensitive writes must put the guard in the write or catch P2002 (`isUniqueConstraintError`), never check-then-act. Fake cards: `4242424242424242` ok, `4000000000000002` declined, `4000000000000119` throws.

**Route groups with separate root layouts.** `(front)` (Navbar + Footer), `(auth)` (login/signup) and `(admin)` (sidebar; layout calls `requireAdmin()`, actions re-check) each render their own `<html>`/`<body>` with `ThemeProvider` (next-themes, dark mode) and import `../globals.css`.

**Cache Components is enabled** (`cacheComponents: true`). Pages set `export const instant = false` (TODO) and do dynamic work (DB, session, `params`/`searchParams`) inside an async component wrapped in `<Suspense>` that calls `await connection()` first.

**Client state.** Cart = zustand `persist` in `src/stores/cart-store.ts`; reducers (`addItem`, `removeItem`, `setCouponCode`, `cartSubtotal`) are exported pure functions. Prices in the cart are display-only — the server recomputes via `checkout.quote()`. Use `useHydrated()` before rendering localStorage-backed values. Admin forms use `useActionState` + `useActionFormSubmit` (onSubmit) because React 19 resets `<form action>` even on validation errors.

**Validation schemas live outside components** — use `requiredNumber()` for required numeric form fields (`z.coerce.number()` turns `""` into 0) (`src/lib/validation/*`, `src/lib/auth-schema.ts`). `MIN_PASSWORD_LENGTH` must stay in sync with `minPasswordLength` in `src/lib/auth.ts`.

**Auth (Better Auth).** Server `src/lib/auth.ts` (Prisma adapter, email+password, `autoSignIn: false`) mounted at `src/app/api/auth/[...all]/route.ts`. Client `src/lib/auth-client.ts` declares `role` via `inferAdditionalFields` — don't import `@/lib/auth` from client code. `role` (`"user"` | `"admin"`) has `input: false`; change it in the DB only. Login honours `?next=` via `safeRedirectPath`.

**Prisma.** Schema `prisma/schema.prisma`, config `prisma.config.ts` (loads `.env`, seed = `tsx prisma/seed.ts`). Client generated to `generated/prisma/`, imported as `@generated/prisma/client`. Models are PascalCase/camelCase mapped to snake_case tables; status columns are `String` with allowed values in `src/lib/shared/status.ts`. `order_items → courses` is `Restrict` (sold courses can't be deleted — unpublish instead).

**Images.** Course covers are SVGs in `public/course-image/` (generated by `scripts/generate-course-images.ts`). Remote images only from `www.fffuel.co` and `api.codingthailand.com` (free-course pictures).

**External API.** `/free-courses` uses `https://api.codingthailand.com/api/course` (`{ data: [...] }`); `COURSE_API_URL` overrides it (read only in `container.ts`).

**E2E hooks.** Interactive elements carry `data-testid` (`login-*`, `signup-*`, `nav-cart`, `nav-cart-count`, `nav-user-name`, `logout-button` (inside the user dropdown), `course-card-{slug}`, `add-to-cart`, `coupon-input`, `coupon-apply`, `card-number`, `checkout-submit`, `lesson-complete`, `progress-percent`, `refund-button-{itemId}`, `review-submit`, `admin-*`, …). Preserve them and add them to new interactive UI.

Path aliases: `@/*` → `src/*`, `@generated/*` → `generated/*`. shadcn components go in `src/components/ui` (add via `npx shadcn add <component>`; avoid overwriting existing files).
