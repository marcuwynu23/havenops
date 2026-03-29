# HavenOps

HavenOps is a **single-tenant** operations app for a residential cleaning business: **client self-registration and booking**, **schedule-aware auto-assignment** to staff, **job status** tracking, and **admin** tools for employees and the client directory.

The web app separates a **public marketing** site (`/`) from the **authenticated** admin (`/dashboard`), employee (`/app`), and client (`/portal`) experiences.

---

## Stack

| Area | Technology |
|------|------------|
| **Frontend** | React 19, TypeScript, Vite 8, React Router 7, Tailwind CSS v4, TanStack Query, Zustand (auth + theme) |
| **Backend** | Go, Chi router, JWT (HS256), bcrypt, in-memory store (swappable for SQLite/Postgres later) |

See **`PLAN.md`** for the full roadmap, data model, API summary, and phased delivery notes.

---

## Repository layout

```
havenops/
├── backend/          # Go API (cmd/server, internal/, Makefile)
├── frontend/         # Vite React SPA
└── PLAN.md           # Product & technical plan
```

---

## Prerequisites

- **Go** 1.22+ (for the API)
- **Node.js** 20+ and **npm** (for the SPA)
- Optional: **GNU Make** (Git Bash / MSYS2 / WSL on Windows) to use `backend/Makefile` targets; you can run the same commands with `go` directly.

---

## Quick start

### 1. API (port `8080` by default)

```bash
cd backend
go run ./cmd/server
```

Or, with Make:

```bash
cd backend
make run
```

**Optional demo data** (sample clients, employees, jobs, and users):

```bash
# Unix-style shell
HAVENOPS_SEED_DEMO=1 make run
```

On Windows **PowerShell**:

```powershell
cd backend
$env:HAVENOPS_SEED_DEMO="1"; go run ./cmd/server
```

When demo seed is enabled, demo users share the password **`havenops123`** (see `backend/Makefile` / server logs).

### 2. Frontend (dev server + API proxy)

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite proxies **`/api`** to **`http://127.0.0.1:8080`**, so open the URL Vite prints (usually `http://localhost:5173`) and use the app against your local API.

### 3. Production-style build (frontend)

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
| `HAVENOPS_ADMIN_EMAIL` / `HAVENOPS_ADMIN_PASSWORD` | Optional first-run **admin** user seed |
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

---

## Roles & main routes

| Role | Typical entry | Routes |
|------|----------------|--------|
| **Guest** | Landing | `/`, `/login`, `/login/client`, `/login/employee`, `/register`, password recovery |
| **Admin** | Staff sign-in | `/dashboard`, `/dashboard/jobs`, `/dashboard/clients`, `/dashboard/employees` |
| **Employee** | Staff sign-in | `/app` |
| **Client** | Client sign-in / register | `/portal` |

---

## Documentation

- **`PLAN.md`** — features, API outline, phases, testing strategy, deployment notes.

---

## License

No license file is included in this repository; add one if you intend to distribute or open-source the project.
