# HavenOps – Full Development Plan

## Overview

HavenOps is a single-tenant home service management system designed for a cleaning business. It includes client booking, automated employee assignment, scheduling, and job tracking across web, mobile, and desktop platforms.

---

## Tech Stack

### Frontend (current)

- React 19 + TypeScript (Vite 8)
- React Router 7
- Tailwind CSS v4 with `@tailwindcss/vite`
- Zustand: **`authStore`**, **`havenopsStore`**, **`themeStore`** (appearance preference + `localStorage`)
- Vitest + Testing Library + jsdom
- Centralized UI kit under `frontend/src/components/ui` (Button variants including **`highlight`**, Card, Field, Input, Select, Textarea, Table, Badge, Alert, PageHeader, StatCard, StatsGrid, FormGrid, RowActions, Muted, responsive table helpers, etc.)
- **Brand theme** in `frontend/src/styles/theme.css`: cleaning-service palette (**`#1e1e1e`**, **`#e5e5e5`**, **`#618b79`**, **`#f9d249`**) with **light** and **dark** modes via `html[data-theme]`; tokens include `highlight`, `nav-hover`, `backdrop`, job status colors
- **`ThemeSync`** + inline script in `index.html` to avoid theme flash; preference **Light / Dark / System** (`localStorage` key `havenops-theme-preference`)
- **`ThemePreferenceControl`**: sidebar (authenticated) + fixed corner on auth pages
- **`Modal`**: reusable dialog (portal, backdrop, Escape); **Add employee** flow uses it
- **Layout:** **`AdminShell`** — desktop sidebar with icons; **mobile** Material-style **top app bar**, **bottom navigation** (multi-tab admin; single-role + **Account** tab), **account bottom sheet** (theme, email, logout); safe-area aware
- **Public marketing `LandingPage`** at **`/`** (hero, feature cards, CTAs to register / staff login); signed-in users are redirected to `roleHome`
- **`RequireAuth`**, role gates in `App.tsx` (`AdminGate`, `EmployeeGate`, `ClientGate`); admin app lives under **`/dashboard`**
- **Route-level code splitting:** **`React.lazy`** + **`Suspense`** in `App.tsx` — each top-level page (`marketing/`, `auth/…`, `admin/`, `employee/`, `client/`) loads as its own **Vite async chunk**; global fallback UI while chunks load
- **(Planned)** **TanStack Query** (`@tanstack/react-query`, formerly React Query) for **server state**: `useQuery` / `useMutation` for jobs, clients, employees, and related API calls; **cache**, **invalidation**, **loading/error** semantics, deduped requests; **`QueryClientProvider`** at app root. Migrate incrementally from **`havenopsStore`** list-fetch patterns; keep **Zustand** for **auth** and **theme** (and any purely client UI state)

### Frontend (planned)

- Capacitor (Android)
- Electron (Windows desktop)
- **Maps:** embed a **map library** for location UX (e.g. **Leaflet** + `react-leaflet`, or **MapLibre GL** / Mapbox-style stack). Use it for **client** address + coordinate picking and for **read-only** job/client location views for **employees** (and admin). Store **API keys** (if any) in env; prefer OSS tiles (e.g. OpenStreetMap) where licensing allows.

### Backend (current)

- Go with Chi router
- REST API mounted at **`/api`**
- **In-memory store** implementing `store.Store` (`internal/store/memory.go`) — swap for SQLite/Postgres later without changing handler contracts
- JWT access tokens (HS256), bcrypt passwords (`internal/auth`)
- Optional first-run admin seed via environment variables
- Optional **demo dataset**: **`HAVENOPS_SEED_DEMO=1`** — sample clients, employees, client user, jobs (`internal/bootstrap/seed_demo.go`); shared demo password documented in logs / Makefile
- **Makefile** in `backend/` — `make help`, `run`, `test`, `fmt`, `vet`, `build`, `release` (cross-compile), `checksums`, etc. Run from `backend/`; on Windows use Git Bash, MSYS2, or WSL if `make` is unavailable and invoke the documented `go` commands instead.

### Backend (planned)

- SQLite (initial) → PostgreSQL (future), with migrations

---

## Core Features (MVP)

### 1. Authentication & roles

- **Roles:** `admin`, `employee`, `client`
- **Client self-registration** (public): creates linked `User` + `Client` record
- **Employee accounts** created only by **admin** (modal form on Employees page): email + initial password; links `User` ↔ `Employee`
- **Login** (JWT Bearer on protected routes)
- **Password recovery:** request token + reset (no outbound email in MVP; dev can use `HAVENOPS_EXPOSE_RECOVERY_TOKEN=1` to receive token in API JSON for testing)
- **Environment:** `HAVENOPS_JWT_SECRET` (required in production), `HAVENOPS_ADMIN_EMAIL` / `HAVENOPS_ADMIN_PASSWORD` (optional seed admin), `HAVENOPS_EXPOSE_RECOVERY_TOKEN`, `HAVENOPS_SEED_DEMO`, `PORT`

### 2. Client management

- **No admin-created clients:** `POST /api/clients` returns **403**; clients come only from **self-service registration**
- **Admin:** read-only **directory** (`GET /clients` — full list)
- **Client:** sees only self; **only clients** may **`POST /jobs`** (booking) for own `client_id`
- **Employee:** clients that appear on assigned jobs (scoped list)

### 3. Job management

- **Booking:** **client accounts only** (admin and employee cannot create jobs via API)
- List/filter jobs by role (admin: all + manual assign; employee: assigned; client: own)
- Track status: `pending` → `assigned` → `in_progress` → `done`; `cancelled` allowed
- Admin: manual reassignment (`PATCH .../assign`)
- **Queued jobs:** if no employee is free in the scheduled **time window** (default slot + padding), job stays **`pending`** until manual assign or capacity changes

### 4. Employee management

- Admin: create employee with credentials (modal), list, activate/deactivate (`PATCH`)

### 5. Auto assignment

- **Schedule-aware:** among **active** employees with **no overlapping** non-terminal jobs (slot duration + buffer), choose **least loaded**; ties by employee ID
- If everyone overlaps that window → leave **unassigned** (queue)

### 6. Surfaces

- **Marketing landing:** **`/`** — product intro, client + staff entry points; unauthenticated unknown routes redirect to **`/`** (guests) or **`roleHome`** (signed-in)
- **Admin console:** **`/dashboard`**, **`/dashboard/jobs`**, **`/dashboard/clients`**, **`/dashboard/employees`**
- **Employee app:** `/app` — assigned jobs, status updates on assigned jobs only
- **Client portal:** `/portal` — own jobs, **Request booking** (gold CTA)
- **Public auth pages:** `/login`, `/register`, `/forgot-password`, `/reset-password`

### 7. Client location, home address & maps (planned)

- **Client portal — profile / location**
  - Edit **home address** (structured text, aligned with registration `address` field).
  - **Map** UI to **set or refine location**: draggable marker or tap-to-place, showing **latitude / longitude** (WGS84). Persist coordinates with the client record when saved.
  - Optional: geocode address → map center; reverse geocode pin → suggested address line (library or provider-dependent).
- **Employee app (and admin job context)**
  - For jobs the employee is assigned to, show the **client’s address** and **coordinates** when present.
  - **Embedded map** (read-only marker) so crew can open directions in the device maps app (link out) without leaving HavenOps.
- **Implementation notes**
  - Shared **map component** (client: interactive picker; staff: read-only) to keep styling consistent with the UI kit.
  - Respect **privacy**: only expose coordinates to roles that already see that client via job scope (employee: assigned jobs; admin: full directory / job rows).

### 8. UX & responsiveness (done)

- **Responsive typography** and form controls (mobile-first; `16px` inputs on small screens to reduce iOS zoom)
- **Tables:** desktop table / **stacked cards** below `md` (`TableDesktop`, `TableMobileList`, `DataField` — Jobs, Clients, Employees)
- **Theme:** light / dark / system; cleaning brand colors; **PageHeader** sage→gold accent bar

---

## Data model (logical)

### clients

- `id` (uuid), `name`, `phone`, `address`, `created_at`
- **(Planned)** `latitude`, `longitude` (nullable floats, WGS84) — set from client portal map picker; used for employee/admin map views and future routing

### employees

- `id` (uuid), `name`, `phone`, `is_active`, `created_at`

### jobs

- `id` (uuid), `client_id`, `assigned_employee_id`, `service_type`, `scheduled_at`, `status`, `notes`, `created_at`

### users (auth)

- `id`, `email`, `password_hash`, `role`, optional `client_id` / `employee_id`, `created_at`
- Recovery tokens stored in memory with consume-on-use semantics (replace with durable store + email in production)

---

## API (`/api/...`)

All resource routes require **`Authorization: Bearer <jwt>`** unless noted.

### Auth (public)

- `POST /api/auth/register` — client signup
- `POST /api/auth/login`
- `POST /api/auth/recovery/request`
- `POST /api/auth/recovery/reset`

### Auth (protected)

- `GET /api/auth/me`

### Clients

- `POST /api/clients` — **403** (self-service registration only)
- `GET /api/clients` — scoped by role
- **(Planned)** `PATCH /api/clients/me` or `PATCH /api/clients/{id}` — **client** may update own **`address`**, **`latitude`**, **`longitude`** (validate ranges; optional admin override later). Responses include coordinates when present so the portal and job views can render maps.

### Employees

- `POST /api/employees` — admin only; body includes email + password for linked user account
- `GET /api/employees`
- `PATCH /api/employees/{id}`

### Jobs

- `POST /api/jobs` — **client accounts only** (server sets `client_id`); admin/employee **403**
- `GET /api/jobs` — query filters: `employee_id`, `client_id` as applicable to role
- `PATCH /api/jobs/{id}/status`
- `PATCH /api/jobs/{id}/assign` — admin-oriented reassignment

### Other

- `GET /health` — liveness (root router, not under `/api`)

---

## Business logic

### Auto assignment

- Active employees only; **exclude** those **busy** in the new job’s time window (non-terminal jobs + default slot length + padding)
- Among eligible, **minimum active job count**; lexicographic tie-break on employee ID
- No eligible employee → job remains **pending**

### Status flow

- `pending` → `assigned` → `in_progress` → `done`
- Cancel anytime (`cancelled`)

### Authorization (summary)

- **Admin:** list/create employees; read clients; all jobs + **assign**; **no** job create, **no** client create via API
- **Employee:** assigned jobs; status updates only on those; scoped clients list; **no** job create
- **Client:** own jobs + **create** job (booking)

### Future constraints

- Overlapping schedules as first-class rules, buffer editor UI, background “retry assign” for queued jobs

---

## Frontend structure

### Pages

- Organized under **`pages/marketing`**, **`pages/auth/login|register|recovery`**, **`pages/admin`**, **`pages/employee`**, **`pages/client`** — each default export **lazy-imported** from `App.tsx` for smaller initial bundle
- **`LandingPage`** (`/`)
- `Dashboard`, `JobsPage`, `ClientsPage`, `EmployeesPage` (admin; nested under `/dashboard`)
- `EmployeeApp`, `ClientPortal` (planned: **client location / map** editor on portal; **job-level map** for employees)
- `LoginPage` (chooser), `ClientLoginPage`, `EmployeeLoginPage`, `RegisterPage`, `ForgotPasswordPage`, `ResetPasswordPage`

### Components

- **`BookingForm`** (client portal only; primary submit **`highlight`** / gold)
- **`JobTable`** (admin / employee / client modes + responsive list)
- **(Planned)** **`LocationMap`** / **`ClientLocationEditor`** — map library wrapper; client portal **picker** + employee **read-only** job/client location; optional **`AddressFields`** shared with registration
- **`Modal`**, **`ThemeSync`**, **`ThemePreferenceControl`**
- **`AdminShell`** (desktop sidebar + mobile app bar / bottom nav / account sheet); nav config includes **`icon`** + **`mobileLabel`**
- `RequireAuth`, role gates in `App.tsx`
- Reusable UI under `components/ui/` and **`components/layout/`**

### State

- **`authStore`:** token, user, login/register/logout, `roleHome` (admin → `/dashboard`)
- **`havenopsStore`:** lists refresh for admin workflows (**today**); **(planned)** superseded or thinned in favor of **TanStack Query** query keys + `invalidateQueries` after mutations
- **`themeStore`:** `light` | `dark` | `system`, persisted

### Data fetching (planned)

- **TanStack Query** as the standard for anything that talks to **`/api`**: shared **`queryClient`** config (stale time, retry), **`useQuery`** for GET-style data, **`useMutation`** + **`onSuccess` invalidation** for PATCH/POST flows (e.g. job status, assign, booking)
- **`api.ts`** functions remain thin fetch wrappers; hooks (or small `queries/` modules) compose them with React Query

---

## Development phases

### Phase 1 – Backend MVP — **done**

- Go server, Chi, models, REST under `/api`, in-memory `Store` interface + tests

### Phase 2 – Frontend MVP — **done**

- Vite React app, API client with Bearer token, job views, Vitest
- **Public landing** at **`/`** (value proposition, register + staff sign-in); **admin shell** routes under **`/dashboard`** so marketing and app URLs stay separate

### Phase 3 – Employee system — **done**

- Employee endpoints, auto-assignment, employee app route

### Phase 4 – Auth & portals — **done**

- JWT, bcrypt, registration (client), admin-provisioned employees, login, recovery, role-based API + UI, client portal

### Phase 5 – Centralized UI, tooling & product polish — **done**

- Tailwind v4, UI primitives, theme tokens, Makefile
- **Lazy route imports** (`React.lazy` + `Suspense`) and **pages/** layout by area (marketing, auth, admin, employee, client)
- **Self-service clients only** + **client-only booking** (API + UI)
- **Schedule-aware** assignment + **queued** pending jobs
- **Demo seed** (`HAVENOPS_SEED_DEMO`)
- **Responsive** tables/typography/forms
- **Light/dark/system** theme + **cleaning brand** palette
- **Mobile-native-style** shell (bottom nav, sheet, safe areas)
- **Modal** add-employee; **PageHeader** brand accent

### Phase 5b – TanStack Query (planned)

- Add **`@tanstack/react-query`**, `QueryClientProvider`, Devtools (dev only, optional)
- Port **admin** list views and **mutations** (job assign/status, employee create/toggle, booking) from **`havenopsStore`** to **`useQuery` / `useMutation`**; align **`EmployeeApp` / `ClientPortal`** direct **`api.ts`** calls with the same pattern where useful
- Tests: wrap render helpers with a test **`QueryClientProvider`**

### Phase 6 – Persistence

- SQLite + migrations (or Postgres), map `Store` to database

### Phase 7 – Desktop & mobile

- Electron, Capacitor

### Phase 8 – Enhancements

- Calendar UI, notifications, rate limiting, offline support, automated retry for queued assignments

### Phase 9 – Client location & maps (planned)

- Backend: extend **`clients`** with **`latitude`** / **`longitude`**; authenticated **client** `PATCH` for address + coordinates; include coords in job/client payloads where role allows
- Frontend: **map library** dependency, env for any provider keys; **client portal** section to set home address + map pin; **employee** (and admin) job UI showing **client address + map** when coordinates exist
- Tests: API validation for geo bounds; smoke tests for map mount (optional mock)

---

## Testing strategy

### Backend

- `go test ./...` (handlers, assignment, bootstrap seed demo idempotency); optional `make test-race`

### Frontend

- `npm run test` / `npm run test:run` — Vitest (API module, store, landing + login smoke routing); **(planned)** React Query test utilities when Phase 5b lands

---

## Security

- JWT Bearer for API; bcrypt for passwords
- CORS allowlist for local Vite dev origins
- Input validation on handlers; production must set `HAVENOPS_JWT_SECRET`
- Rate limiting and audit logging — future

---

## Deployment

### Local

- Backend: `make run` or `go run ./cmd/server` from `backend/`; optional `HAVENOPS_SEED_DEMO=1`
- Frontend: `npm run dev` from `frontend/`
- Docker Compose (API + DB) — optional / future when DB lands

### Production

- VPS, reverse proxy (e.g. NGINX), secure secrets, disable recovery token exposure

---

## Future enhancements

- **GPS-based assignment** and **route optimization** (builds on stored client coordinates and crew locations)
- SMS / email (recovery, notifications)
- Payments, multi-tenant

---

## Definition of done (MVP)

- Admin manages **employees** (modal create with credentials); **views** client directory; manages **all jobs** and **reassigns**; **no** admin client or job creation
- Clients **self-register** and use the portal to **book** (gold CTA) and track jobs
- Jobs **auto-assign** when an employee is **free** in the slot; otherwise stay **pending**
- Employees sign in, see **assigned** work, update status; **mobile-friendly** shell and **theme** toggle
- Auth flows end-to-end; recovery token delivery TBD outside dev
- **Demo seed** optional for local demos; Makefile supports backend **build/test/release**
- **Landing** introduces the product; **logout** returns guests to **`/`**

---

## Notes

- Keep the system simple and fast; avoid overengineering for the single-tenant MVP
- In-memory store: process restart loses data until Phase 6 persistence
- Focus on real business usage; Capacitor/Electron follow after web + persistence are stable
