# HavenOps — Developer guide

Technical setup, stack, and repo conventions. For product and roadmap context, see **`PLAN.md`**. For a non-technical overview aimed at the business, see **`README.md`**.

---

## Stack

| Area | Technology |
|------|------------|
| **Frontend** | React 19, TypeScript, Vite 8, React Router 7, Tailwind CSS v4, TanStack Query, Zustand (auth + theme) |
| **Backend** | Go, Chi router, JWT (HS256), bcrypt, SQLite via `modernc.org/sqlite` (pure Go driver) |

---

## Repository layout

```
havenops/
├── backend/          # Go API (cmd/server, internal/, Makefile)
├── frontend/         # Vite React SPA
├── PLAN.md           # Product & technical plan, phases, API outline
├── README.md         # Business-facing overview
└── DEVELOPER_GUIDE.md
```

---

## Prerequisites

- **Go** 1.22+ (API)
- **Node.js** 20+ and **npm** (SPA)
- Optional: **GNU Make** (Git Bash / MSYS2 / WSL on Windows) for `backend/Makefile`; you can run the same commands with `go` and `npm` directly.

---

## Quick start

### 1. API (default port **8080**)

```bash
cd backend
go run ./cmd/server
```

Or:

```bash
cd backend
make run
```

The server uses **SQLite** only. Default database file: **`havenops.db`** in the process working directory (override with `HAVENOPS_SQLITE_PATH`).

**Optional demo data** (sample clients, employees, jobs, users):

```bash
# Unix-style shell
HAVENOPS_SEED_DEMO=1 make run
```

**Windows PowerShell:**

```powershell
cd backend
$env:HAVENOPS_SEED_DEMO="1"; go run ./cmd/server
```

Demo accounts share password **`havenops123`** (also logged at startup). See `backend/Makefile` for examples.

### 2. Frontend (dev server)

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite proxies **`/api`** to **`http://127.0.0.1:8080`**. Open the URL Vite prints (usually `http://localhost:5173`).

### 3. Production-style frontend build

```bash
cd frontend
npm run build
npm run preview   # optional: serve dist/
```

---

## Environment variables (backend)

| Variable | Purpose |
|----------|---------|
| `PORT` | Listen port (default **8080**) |
| `HAVENOPS_JWT_SECRET` | **Required in production** — signing key for access tokens |
| `HAVENOPS_SQLITE_PATH` | SQLite database file (default **`havenops.db`** in cwd) |
| `HAVENOPS_ADMIN_EMAIL` / `HAVENOPS_ADMIN_PASSWORD` | First-run admin seed; if **both** unset, defaults to `admin@havenops.local` / `havenops123`. Idempotent: existing admin is not recreated. |
| `HAVENOPS_SEED_DEMO` | Set to `1` to load demo clients, employees, jobs, and users |
| `HAVENOPS_EXPOSE_RECOVERY_TOKEN` | Dev-only: include recovery token in password-reset API JSON for testing |

---

## Testing

**Backend**

```bash
cd backend
go test ./...
# or: make test
```

**Frontend**

```bash
cd frontend
npm run test      # watch mode
npm run test:run  # single run (e.g. CI)
```

Optional: `make test-race` from `backend/` for race detector.

---

## Roles and main routes

| Role | Typical entry | Routes |
|------|----------------|--------|
| **Guest** | Landing | `/`, `/login`, `/login/client`, `/login/employee`, `/register`, password recovery |
| **Admin** | Staff sign-in | `/dashboard`, `/dashboard/jobs`, `/dashboard/clients`, `/dashboard/employees` |
| **Employee** | Staff sign-in | `/app` |
| **Client** | Client sign-in / register | `/portal` |

Marketing copy and public positioning live in **`frontend/src/pages/marketing/LandingPage.tsx`**.

---

## Related docs

- **`PLAN.md`** — Roadmap, data model, API summary, phases, deployment notes.  
- **`README.md`** — Business-centered feature overview (no stack detail).
