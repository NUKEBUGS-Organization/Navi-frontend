# Navi Frontend – Best Practices & Conventions

This document describes how we structure the project and write code so it stays consistent, maintainable, and scalable.

---

## 1. Folder structure

```
src/
├── App.tsx
├── main.tsx
├── assets/                 # Static assets (images, fonts)
├── components/             # Shared / reusable UI components
│   ├── ui/                 # Primitive or design-system components
│   │   └── index.ts
│   ├── layout/             # Layout building blocks (Header, Sidebar, Card)
│   │   └── index.ts
│   └── index.ts            # Barrel export for components
├── constants/              # App-wide constants (colors, routes, labels)
│   ├── theme.ts
│   ├── routes.ts
│   └── index.ts
├── hooks/                  # Custom React hooks
│   └── index.ts
├── roles/                  # Role-based areas (admin, employee)
│   ├── admin/
│   │   ├── layout/
│   │   └── pages/
│   └── employee/
│       └── pages/
├── routers/                # Route definitions and guards
│   └── routes.tsx
├── types/                  # Shared TypeScript types and interfaces
│   ├── initiative.ts
│   ├── task.ts
│   └── index.ts
├── utils/                  # Pure helpers (formatting, validation)
│   ├── slugify.ts
│   └── index.ts
└── services/               # API client (when added)
    └── api.ts
```

- **components/** – Reusable pieces used in more than one page. Prefer small, single-purpose components.
- **pages/** – One main component per route; pages compose components and hooks.
- **constants/** – No magic strings/numbers; colors, route paths, and copy live here.
- **types/** – Shared interfaces; avoid defining the same shape in multiple files.
- **hooks/** – Reusable state/logic; keep pages thin.
- **utils/** – Pure functions; easy to test and reuse.

---

## 2. Component approach

### Rules

- **One component per file** – File name matches component name (e.g. `StatusBadge.tsx` → `StatusBadge`).
- **Co-locate when possible** – If a component is only used in one place, keep it next to that page (e.g. `pages/admin/initiatives/InitiativeCard.tsx`).
- **Shared components** – Anything used in 2+ places goes under `components/` (or `components/ui/`, `components/layout/`).
- **Composition** – Prefer small components composed in pages rather than one huge page file.
- **Props** – Use explicit TypeScript interfaces for props; avoid `any`.

### Naming

- **Components**: PascalCase (`StatusBadge`, `TaskDetailPanel`).
- **Files**: PascalCase for components (`StatusBadge.tsx`), camelCase for hooks/utils (`useAuth.ts`, `slugify.ts`).
- **Folders**: lowercase (`components`, `pages/admin`).

### Barrel exports

- Use `index.ts` in key folders to re-export public API, so imports stay clean:
  - `import { StatusBadge, Card } from '@/components'`
  - `import { THEME_BLUE, ROUTES } from '@/constants'`

---

## 3. Path aliases

Use `@/` for `src/` so imports don’t depend on deep relative paths:

```ts
import { StatusBadge } from '@/components';
import { THEME_BLUE } from '@/constants';
import type { Initiative } from '@/types';
import { slugify } from '@/utils';
```

Configured in `tsconfig.app.json` and `vite.config.ts`.

---

## 4. Theme and constants

- **Colors** – Define once in `constants/theme.ts` (e.g. `THEME_BLUE`, `TEAL`, `NAVY`) and import everywhere. No raw hex in page/component files.
- **Routes** – Central route paths in `constants/routes.ts` to avoid typos and simplify refactors.
- **Labels/copy** – For repeated UI text (e.g. nav items), consider constants or a small i18n layer later.

---

## 5. Types

- Put shared domain types in `types/` (e.g. `Initiative`, `Task`, `AssessmentResult`).
- Use `interface` for object shapes and export from `types/index.ts`.
- Prefer `type` for unions and simple aliases. Avoid `any`; use `unknown` when type is truly dynamic.

---

## 6. Hooks

- Custom hooks in `hooks/` with `use` prefix (e.g. `useAuth`, `useLocalStorage`).
- Hooks encapsulate state and side effects; pages use hooks and render UI.
- Keep hooks pure and testable; no direct UI in hooks.

---

## 7. Utils

- Pure functions only (no hooks, no DOM).
- One concern per file (e.g. `formatDate.ts`, `slugify.ts`).
- Export from `utils/index.ts` for a single entry point.

---

## 8. Routing

- Route definitions live in `routers/routes.tsx`.
- Route paths and names come from `constants/routes.ts` where possible.
- For protected routes, use a wrapper component or a small guard in the router.

---

## 9. Naming consistency

- **Pages**: PascalCase, descriptive (`AdminDashboard`, `InitiativeDetail`).
- **Components**: PascalCase, noun or noun phrase (`StatusBadge`, `TaskDetailPanel`).
- **Hooks**: `use` + PascalCase (`useAuth`, `useInitiative`).
- **Utils**: camelCase (`slugify`, `formatDate`).
- **Constants**: UPPER_SNAKE_CASE (`THEME_BLUE`, `ROUTES.ADMIN_DASHBOARD`).

---

## 10. What to avoid

- **No duplicate constants** – Especially colors and route paths; use `constants/`.
- **No giant files** – Split large pages into smaller components and hooks.
- **No `any`** – Prefer proper types or `unknown` with checks.
- **No inline styles for repeated values** – Use theme/constants and Mantine props.
- **No business logic in UI** – Move to hooks or utils.

---

## Migration strategy

1. **Phase 1** – Add `constants/`, `types/`, path aliases; migrate one page to use them.
2. **Phase 2** – Extract shared components (e.g. `StatusBadge`, `PageHeader`, cards) and use them in admin pages.
3. **Phase 3** – Introduce `hooks/` and `utils/`; move repeated logic out of pages.
4. **Phase 4** – Align folder structure with `pages/` and optional `app/` if we add more providers.

Apply changes incrementally so the app keeps running and we can test after each step.
