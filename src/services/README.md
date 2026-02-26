# Service layer

All API access from the UI goes through this layer. **Do not call `fetch('/api/...')` or API URLs directly in components.**

## Usage

- **Client components:** Use `useApi(() => someService.someMethod())` or call service methods in event handlers (e.g. `authService.login(payload)`).
- **Server components:** Prefer the server data layer (`@/lib/data/*`) or call the same API routes via the service client when you need to revalidate from the server.

## Structure

- **`client.ts`** — Reusable `request<T>(path, options)`; throws `ServiceError` on API errors.
- **`errors.ts`** — `ServiceError` with `code`, `status`, `details`; use `isUnauthorized`, `isNotFound`, etc.
- **`types/`** — Request/response types per domain (e.g. `auth.types.ts`, `catalog.types.ts`).
- **`*\.service.ts`** — Typed methods per domain (e.g. `authService`, `catalogService`).

## Adding a new domain

1. Add types under `types/<domain>.types.ts`.
2. Add `<domain>.service.ts` using `request()` from `client.ts`.
3. Export from `index.ts`.
