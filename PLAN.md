# HavenOps – Full Development Plan

## Overview
HavenOps is a single-tenant home service management system designed for a cleaning business. It includes client booking, automated employee assignment, scheduling, and job tracking across web, mobile, and desktop platforms.

---

## Tech Stack

### Frontend
- React (Vite)
- TypeScript
- Capacitor (Android)
- Electron (Windows Desktop)

### Backend
- Go (Chi Router)
- REST API
- SQLite (initial) → PostgreSQL (future)

---

## Core Features (MVP)

### 1. Client Management
- Create client
- Store name, phone, address
- View client list

### 2. Job Management
- Create job
- Assign service type
- Schedule datetime
- Track status:
  - pending
  - assigned
  - in_progress
  - done
  - cancelled

### 3. Employee Management
- Create employee
- Activate/deactivate employee
- View employees

### 4. Auto Assignment System
- Assign job automatically on creation
- Strategy: Least busy employee

### 5. Employee App
- View assigned jobs
- Update job status

### 6. Admin Dashboard
- View all jobs
- Reassign jobs manually
- Monitor operations

---

## Database Schema

### clients
- id (uuid)
- name
- phone
- address
- created_at

### employees
- id (uuid)
- name
- phone
- is_active
- created_at

### jobs
- id (uuid)
- client_id (fk)
- assigned_employee_id (fk)
- service_type
- scheduled_at
- status
- notes
- created_at

---

## API Endpoints

### Clients
- POST /clients
- GET /clients

### Employees
- POST /employees
- GET /employees

### Jobs
- POST /jobs
- GET /jobs
- GET /jobs?employee_id=
- PATCH /jobs/:id/status
- PATCH /jobs/:id/assign

---

## Business Logic

### Auto Assignment
- Filter active employees
- Count active jobs per employee
- Assign to employee with lowest count

### Status Flow
- pending → assigned → in_progress → done
- Can cancel anytime

### Constraints
- Prevent overlapping schedules (future)
- Add buffer time between jobs (future)

---

## Frontend Structure

### Pages
- Admin Dashboard
- Clients Page
- Jobs Page
- Employees Page
- Employee App (mobile)

### Components
- BookingForm
- JobList
- CalendarView (future)
- EmployeeJobList

---

## Development Phases

### Phase 1 – Backend MVP
- Setup Go server
- Implement models
- Create REST endpoints
- Add in-memory store
- Write tests

### Phase 2 – Frontend MVP
- Setup Vite React
- Create booking form
- Display job list
- Connect API

### Phase 3 – Employee System
- Employee endpoints
- Auto assignment logic
- Employee job view

### Phase 4 – Persistence
- Integrate SQLite
- Add migrations

### Phase 5 – Desktop & Mobile
- Wrap with Electron
- Integrate Capacitor

### Phase 6 – Enhancements
- Calendar UI
- Notifications
- Auth system
- Offline support

---

## Testing Strategy

### Backend
- Unit tests for handlers
- Auto assignment tests
- Edge cases (no employees, inactive employees)

### Frontend
- Component tests (Vitest)
- API integration tests

---

## Security (Basic)
- Token-based auth (admin + employee)
- Input validation
- Rate limiting (future)

---

## Deployment

### Local
- Docker Compose (API + DB)

### Production
- VPS hosting
- Reverse proxy (NGINX)

---

## Future Enhancements
- GPS-based assignment
- Route optimization
- SMS notifications
- Payment integration
- Multi-tenant support

---

## Definition of Done (MVP)
- Can create client
- Can create job
- Job auto-assigns employee
- Employee can view job
- Employee can mark job done
- Admin can monitor all jobs

---

## Notes
- Keep system simple and fast
- Avoid overengineering
- Focus on real business usage

