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
- **Submitting** — handle submission in `form.handleSubmit(onSubmit)`; call server actions from `onSubmit` with the parsed, typed values. Use `formState.isSubmitting` for pending UI, and surface server errors with `form.setError` (use `"root"` for errors that are not tied to a field).
- **Testing** — cover validation rules with Vitest tests against the schema, and cover the form's behavior (error messages shown, submit called with valid values) with Storybook interaction tests.

## Testing

- **Components** — write Storybook stories with interaction tests (`*.stories.tsx`, placed next to the component) for every component you add. Run them with `npm run test:ui`.
- **Logic** — write Vitest unit tests (`*.test.ts`, placed next to the module) for any logic you add. Test through the module's public interface, not its internals. Run them with `npm run test:unit`.
