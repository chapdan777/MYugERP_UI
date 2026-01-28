# Frontend Rules

## Tech Stack (Mandatory)

- **React 18** + Vite
- **TypeScript** with `strict: true`
- **UI library:** **MUI v5 (Material UI)**
- **Styling:** **Emotion** (`@emotion/react`, `@emotion/styled`)
- Node.js **LTS** version

**Forbidden:** Ant Design, Chakra UI, Bootstrap, styled-components, SCSS, CSS Modules, or any other UI/styling libraries.

---

## Architecture (Feature-Sliced / Feature-First)

Use a **feature-sliced / feature-first architecture**.

### Base Structure

```text
src/
├── app/        # application initialization, providers, router, global config
├── pages/      # page-level compositions
├── widgets/    # large UI blocks (layout, header, sidebar)
├── features/   # business features (user scenarios)
├── entities/   # domain entities (User, Order, Product, etc.)
├── shared/     # shared UI kit, helpers, api, config
```

### Architecture Rules

- Code related to a feature **must live inside that feature**.
- **Dependency direction is strict and enforced**:
  - `pages` → `widgets` → `features` → `entities` → `shared`
- Lower layers **must not depend on higher layers**.
- **No diagonal dependencies** are allowed.
- Shared logic belongs to `shared`.
- Before adding new functionality, always define **ownership** (entity / feature).

---


## TypeScript Rules (Strict)

- `strict: true` **must always be enabled**.
- Usage of `any` is **forbidden**.
- `unknown` is allowed **only with explicit and local type narrowing**.
- Use `interface` or `type` for:
  - component props
  - domain models
  - API contracts
- Shared and domain-specific types must be placed in `entities` or `shared`.
- All exported functions, hooks, components, and types **must be documented with JSDoc**.
- JSDoc text **must be written in Russian** and describe **business intent**, not implementation details.

---


## React Rules

- **Function components only**.
- **Hooks only** for state and logic.
- Class components are **forbidden**.
- Business logic must live in:
  - custom hooks
  - `model` layer of features or entities
- UI components should be as **presentational and dumb** as possible.
- Prefer controlled inputs and controlled forms.
- **God components and god hooks are forbidden.**
- Each component and hook must have a **single responsibility**.

---


## State Management

### Server State — SWR (Mandatory)

- **SWR is the only allowed server-state solution**.
- All API calls must be wrapped in hooks:
  - `useUser`
  - `useOrders`
  - `useOrderById`
- React Query, Apollo Client, RTK Query and similar libraries are **forbidden**.

### Client / UI State — Zustand (Mandatory)

- **Zustand is the only allowed global client-state solution**.
- Store placement rules:
  - `shared/model` — global UI state
  - `entities/*/model` — entity-owned state
  - `features/*/model` — feature-owned state
- Redux, MobX, Recoil and Context-as-state are **forbidden**.
- Local UI state must stay inside components (`useState`, `useReducer`).

---

## UI & Styling — MUI v5 + Emotion

### MUI Rules

- Use **MUI v5 only**.
- Theme configuration must live in `app/providers`.
- Do not use inline styles.
- `sx` prop is allowed **only for simple local styling**.
- Shared UI components must be placed in `shared/ui`.

### Emotion Rules

- Allowed patterns:
  - `styled` API
  - `css` prop
- `styled-components`, SCSS, CSS Modules are **forbidden**.
- Inline styles (`style={{ ... }}`) are forbidden except for extreme edge cases with justification.

---

## Component Folder Structure

Inside `features`, `widgets`, and `pages`:

```text
feature-name/
├── index.tsx   # public API
├── ui/         # presentational components
├── model/      # state, hooks, business logic
├── lib/        # pure helpers
├── api/        # API wrappers (if not in shared)
```

---

## Linting & Formatting (Mandatory)

- **ESLint must be configured and enabled**.
- **Prettier must be configured and enabled**.
- ESLint and Prettier must work together (e.g. `eslint-config-prettier`).
- Code **must pass ESLint and Prettier checks**.
- CI pipeline **must fail** if linting or formatting fails.
- Disabling rules is allowed **only with explicit justification via comments**.

Code that does not pass linting is considered **invalid**.

---

## Testing (Mandatory)

- Tests are **required**.
- **Vitest is the only allowed test runner**.
- Testing libraries:
  - `@testing-library/react`
  - `@testing-library/user-event`
- Tests must cover:
  - business logic
  - hooks
  - critical UI behavior
- Features containing logic **must have tests**.
- A feature without tests is **not considered done**.
- Bug fixes **must include a regression test** when applicable.
- Tests must be runnable locally and in CI.

---


## General Code Guidelines

- Code must be explicit, readable, and predictable.
- Avoid hidden side effects and implicit behavior.
- Prefer maintainability and type safety over brevity.
- All deviations from rules must be explicitly justified.
- **All comments, code notes, and JSDoc inside the code must be written in Russian.**
- **TODO, FIXME, NOTE and placeholder comments are forbidden.**
- Public APIs (functions, components, hooks) should be documented using JSDoc (in Russian).
- **Rules text and documentation files are written in English.**

---

## Non-Negotiable Summary

- React 18 + Vite
- TypeScript `strict`
- MUI v5 + Emotion
- SWR + Zustand
- ESLint + Prettier
- Vitest + Testing Library
- Feature-sliced architecture

Any solution that violates these rules is considered **incorrect by definition**.

