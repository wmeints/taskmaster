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

## Testing

- **Components** — write Storybook stories with interaction tests (`*.stories.tsx`, placed next to the component) for every component you add. Run them with `npm run test:ui`.
- **Logic** — write Vitest unit tests (`*.test.ts`, placed next to the module) for any logic you add. Test through the module's public interface, not its internals. Run them with `npm run test:unit`.
