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
