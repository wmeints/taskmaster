# Taskmaster

A task-list app built with Next.js 16, React 19, Tailwind CSS 4 and shadcn/ui. Data lives in
[Neon](https://neon.tech) Postgres, accessed through [Drizzle ORM](https://orm.drizzle.team), and users sign in
with Neon Auth.

## Prerequisites

- **Node.js 20** or newer
- **pnpm** — the version is pinned in `package.json` (`packageManager`); run `corepack enable` and Corepack
  picks it up for you
- **A Neon project** with Neon Auth enabled. Use a dedicated branch for development rather than the default
  (production) branch.

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create a Neon branch for development. With the Neon CLI, `neon checkout <name>` creates one using the
   branch policy in `neon.ts` (non-default branches expire after 7 days).

3. Create `.env.local` in the project root with the values for that branch, taken from the Neon Console
   (**Connect** for the connection strings, **Auth** for the Neon Auth settings):

   ```bash
   # Pooled connection, used by the app
   DATABASE_URL=postgresql://...-pooler.../neondb?sslmode=require
   # Direct connection, used by migrations
   DATABASE_URL_UNPOOLED=postgresql://.../neondb?sslmode=require

   NEON_AUTH_BASE_URL=https://...
   # Any long random string, e.g. `openssl rand -base64 32`
   NEON_AUTH_COOKIE_SECRET=...
   ```

   `.env*` files are git-ignored; never commit them.

4. Apply the database migrations:

   ```bash
   pnpm db:migrate
   ```

## Running in development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The page reloads as you edit files.

To browse the database, run `pnpm db:studio` to open Drizzle Studio.

## Building for production

```bash
pnpm build
pnpm start
```

`pnpm build` creates an optimized build in `.next/`; `pnpm start` serves it on port 3000. The same environment
variables must be set where the build runs.

## Testing

| Command          | What it runs                                                                       |
| ---------------- | ---------------------------------------------------------------------------------- |
| `pnpm test:unit` | Vitest unit tests (`*.test.ts`) against an in-memory Postgres (PGlite) — no Neon needed |
| `pnpm test:ui`   | Storybook interaction tests in a headless Chromium browser                         |
| `pnpm test`      | Both of the above                                                                  |
| `pnpm lint`      | ESLint                                                                             |

The UI tests need a Playwright browser. Install it once with:

```bash
pnpm exec playwright install chromium
```

To work on components in isolation, run `pnpm storybook` and open [http://localhost:6006](http://localhost:6006).

## Changing the database schema

1. Edit the table's file in `lib/db/schema/`.
2. Run `pnpm db:generate` to write a migration into `db/migrations/`, and read the generated SQL.
3. Run `pnpm db:migrate` against your development branch to try it out.
4. Commit the SQL file together with the updated `db/migrations/meta/` snapshot.

See `CLAUDE.md` for the project's architecture and coding guidelines.
