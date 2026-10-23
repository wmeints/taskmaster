# Next.js

This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Architecture guidelines

## UI components: atomic design

Structure every user interface component using atomic design:

- **Atoms** — the smallest building blocks (button, input, label, icon). The shadcn primitives in `components/ui/` are atoms.
- **Molecules** — small groups of atoms that work together as a unit (a labeled form field, a search box).
- **Organisms** — larger, self-contained sections built from molecules and atoms (a task list, a header, a sign-in form).
- **Templates** — page-level layouts that arrange organisms without real content.
- **Pages** — templates filled with real data; these are the route files in `app/`.

Place new components in `components/atoms/`, `components/molecules/`, `components/organisms/` and `components/templates/`. A component may only compose components from its own level or lower — never from a higher level.

## Logic modules: deep modules with narrow interfaces

Design logic modules (everything under `lib/` and other non-UI code) as deep modules:

- Expose a small, simple public interface that hides substantial implementation complexity behind it.
- Keep implementation details (helpers, internal types, data access specifics) private to the module; export only what callers need.
- Prefer fewer, more powerful functions over many shallow pass-through functions or thin wrappers.
- Callers should not need to understand the module's internals or call functions in a particular order to use it correctly.

## Database: Drizzle ORM on Neon

The app talks to Neon Postgres through [Drizzle ORM](https://orm.drizzle.team) over `node-postgres` (`pg`), using the pooled `DATABASE_URL` with `attachDatabasePool` for Vercel Fluid compute. Do not add another driver or ORM, and do not write raw `pool.query` calls.

- **Layout**
  - `lib/db/index.ts` — the `db` client. Only `lib/db/queries/` imports it.
  - `lib/db/schema/` — **one file per table** (`lists.ts`, `tasks.ts`, `subtasks.ts`, `list-members.ts`, `list-invites.ts`), each holding the table and its `relations()`. `schema/index.ts` re-exports every table the app migrates.
  - `lib/db/schema/users.ts` — Neon Auth's `neon_auth."user"` table, read-only. Neon Auth owns and migrates it, so keep it **out of** `schema/index.ts` (otherwise Drizzle Kit generates migrations for it) and import it from `@/lib/db/schema/users` where a query joins on users.
  - `lib/db/queries/` — **the only place queries live**. One file per area (`tasks.ts`, `sharing.ts`, `accounts.ts`), all exported through `queries/index.ts`. `access.ts` holds the shared access rules ("lists the user owns or was given", "tasks the user can see") and stays private to the module.
  - Domain modules (`lib/tasks`, `lib/sharing`, `lib/accounts`) and routes call the queries module, never `db` or the schema directly. A domain module may re-export a query under its domain name (`export { insertList as createList } from "@/lib/db/queries"`) instead of wrapping it in a pass-through function.
- **Schema**
  - Spell out every column name in snake_case (`userId: text("user_id")`) and every constraint and index name, matching Postgres's own naming (`tasks_list_id_fkey`, `list_members_pkey`, `lists_user_id_idx`). Declare foreign keys with `foreignKey({ name, ... })` in the table's extra config rather than `.references()`, which invents names that differ from the existing database.
  - Use `timestamp(..., { withTimezone: true })`, `date(..., { mode: "string" })` for calendar dates, and `.$type<...>()` to narrow text columns to the domain's union types.
  - User ids are stored as `text`; Neon Auth keys users by `uuid`, so join with `` sql`${users.id}::text` ``.
- **Queries**
  - Build queries with the query builder (`db.select`, `insert`, `update`, `delete`) or the relational API (`db.query.<table>.findMany` with `with:` for nested rows). Fall back to `` sql`...` `` only for expressions Drizzle has no operator for, and always interpolate values so they become parameters; never build SQL with string concatenation.
  - Filter every read and write done on a user's behalf with the access rules in `access.ts`, so a user can never touch rows they have no access to.
  - Select only the columns the caller needs, and let return types be inferred from the query (`Awaited<ReturnType<typeof findTasks>>`) instead of hand-writing row types.
  - Wrap statements that must succeed or fail together in `db.transaction`.
- **Migrations**
  - Change a schema file, then run `pnpm db:generate` (`drizzle-kit generate`) to write a migration into `db/migrations/`, and commit the SQL and the `meta/` snapshot together. Read the generated SQL before committing it. Never edit a migration that has already been applied.
  - Apply migrations with `pnpm db:migrate` (`lib/db/migrate.mts`), which uses the direct `DATABASE_URL_UNPOOLED` connection. Test migrations on a Neon branch before applying them to the default branch. Do not use `drizzle-kit push` against shared branches.
- **Testing** — unit-test queries and domain modules against a real in-memory Postgres, not mocked SQL strings: mock the client with `vi.mock("@/lib/db", () => import("@/lib/db/testing"))`, call `resetDatabase()` in `beforeEach`, seed rows through `db` from `@/lib/db/testing`, and assert on the results through the module's public interface.

# Development workflow

## Red-green-refactor

Write all code using the red-green-refactor cycle:

1. **Red** — write a failing test that describes the next small piece of behavior. Run it and confirm it fails for the expected reason.
2. **Green** — write the minimum code needed to make the test pass.
3. **Refactor** — clean up the code and tests while keeping all tests green.

Repeat in small increments. Do not write production code without a failing test that requires it.

## Reuse shadcn components

Use shadcn components as much as possible to promote reuse. Before building a new atom, check whether a shadcn component exists for it and add it with `npx shadcn@latest add <component>` into `components/ui/`. Compose molecules and organisms from these primitives rather than writing custom equivalents.

## Forms: React Hook Form with Zod

Build every form in the application with [React Hook Form](https://react-hook-form.com) and [Zod](https://zod.dev). Do not manage form state with `useState`, uncontrolled `FormData` reads, or native HTML validation attributes alone.

- **Schema first** — define a Zod schema for each form and derive its type with `z.infer<typeof schema>`. Never hand-write a separate type for form values.
- **Shared validation** — put schemas used by both the client and a server action in `lib/` (e.g. `lib/auth/schemas.ts`) so the server re-validates the same input with `schema.safeParse(...)`. Never trust client-side validation alone.
- **Wire up with the resolver** — `useForm({ resolver: zodResolver(schema), defaultValues })` from `@hookform/resolvers/zod`. Always provide `defaultValues` for every field.
- **Compose with shadcn `Field` atoms** — render each input through react-hook-form's `Controller` and the primitives in `components/ui/field.tsx` (`FieldGroup`, `Field`, `FieldLabel`, `FieldDescription`, `FieldError`). Set `data-invalid={fieldState.invalid}` on `Field` and `aria-invalid={fieldState.invalid}` on the control. Do not hand-roll error markup.
- **Never GET** — give every `<form>` `method="post"`. A form submitted before the page hydrates falls back to its method, and with GET the browser puts every field, passwords included, in the URL. ESLint enforces this.
- **Submitting** — handle submission in `form.handleSubmit(onSubmit)`; call server actions from `onSubmit` with the parsed, typed values. Use `formState.isSubmitting` for pending UI, and surface server errors with `form.setError` (use `"root"` for errors that are not tied to a field).
- **Testing** — cover validation rules with Vitest tests against the schema, and cover the form's behavior (error messages shown, submit called with valid values) with Storybook interaction tests.

## Testing

- **Components** — write Storybook stories with interaction tests (`*.stories.tsx`, placed next to the component) for every component you add. Run them with `npm run test:ui`.
- **Logic** — write Vitest unit tests (`*.test.ts`, placed next to the module) for any logic you add. Test through the module's public interface, not its internals. Run them with `npm run test:unit`.
- **End-to-end** — describe user journeys as Cucumber feature files in `e2e/features/*.feature`, executed by Playwright through [playwright-bdd](https://vitalets.github.io/playwright-bdd). Run them with `pnpm test:e2e`.
  - **Happy flows only.** End-to-end tests are slow and expensive, so cover each user goal with one scenario for its main success path (sign up, plan a task, share a list…). Leave alternative flows, validation errors and failure modes (wrong password, empty title, no access, server errors) to unit tests, schema tests and Storybook interaction tests. Before adding a scenario, check that it is a new happy flow rather than a variation of an existing one.
  - Write steps in the user's language, naming the person who acts (`When Ada adds the task "Buy milk"`), so steps work in scenarios with several people. Put step definitions in `e2e/steps/<area>.steps.ts`, reuse existing steps before adding new ones, and import `Given`/`When`/`Then` from `e2e/steps/fixtures.ts`.
  - Find elements by role, label and accessible name, never by CSS classes or test ids.
  - Wrap interactions that call a server action in `saving(page, ...)` so the change is stored before the next step; never use fixed timeouts. The one exception is the back-off in the sign-up steps, which retries when Neon Auth rate-limits sign-ups.
  - Every person gets a fresh browser and a unique email address, so scenarios run in parallel and never depend on each other or on existing data.
  - The tests sign up real users, so they read their settings from `.env.e2e`, which must point at a dedicated Neon test branch. Never point it at the branch in `.env.local` or the default branch; `e2e/environment.ts` refuses to run if you do.
