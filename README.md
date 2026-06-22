# AutoCRM — Enterprise Automobile CRM Platform

> A production-grade CRM system inspired by Tata Motors dealership operations.
> Full-stack: Next.js 15 · FastAPI · PostgreSQL · Zustand · React Query · Recharts · dnd-kit

---

## Quick Start

### 1. Prerequisites
- Node.js 20+, Python 3.12+, PostgreSQL 16, (optional) Docker

### 2. Backend

```bash
cd backend
pip install -r requirements.txt

# Copy and configure .env
cp .env.example .env

# Create tables & seed demo data
PYTHONPATH=. python app/db/init_db.py
PYTHONPATH=. python app/db/seed.py

# Start server
PYTHONPATH=. uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local      # set NEXT_PUBLIC_API_URL
npm install
npm run dev                     # http://localhost:3000
```

### 4. Docker (all-in-one)

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

---

## Demo Credentials (password: `Demo@123`)

| Role              | Email                      |
|-------------------|----------------------------|
| Super Admin       | admin@autocrm.in           |
| Branch Manager    | manager.chg@autocrm.in     |
| Sales Executive   | sales1@autocrm.in          |
| Service Advisor   | service1@autocrm.in        |
| Finance Executive | finance1@autocrm.in        |
| Customer Support  | support1@autocrm.in        |

---

## Architecture

```
autocrm/
├── backend/
│   └── app/
│       ├── core/           # Config, security (JWT, bcrypt)
│       ├── db/             # SQLAlchemy engine, session, init_db, seed
│       ├── models/         # 20 SQLAlchemy ORM models + enums
│       ├── schemas/        # Pydantic v2 request/response schemas
│       ├── api/
│       │   └── v1/
│       │       └── endpoints/  # 17 REST routers
│       └── main.py         # FastAPI app + CORS
└── frontend/
    └── src/
        ├── app/
        │   ├── (app)/      # Protected routes (auth guard layout)
        │   │   ├── dashboard/
        │   │   ├── leads/
        │   │   ├── customers/[id]/
        │   │   ├── inventory/
        │   │   ├── test-drives/
        │   │   ├── quotations/
        │   │   ├── service/
        │   │   ├── finance/
        │   │   ├── support/
        │   │   ├── ai/
        │   │   ├── audit-logs/
        │   │   └── settings/
        │   ├── login/
        │   └── forgot-password/
        ├── components/
        │   ├── layout/     # Sidebar, Topbar
        │   └── ui/         # Card, Badge, Gauge
        ├── lib/            # axios client (JWT refresh interceptor), utils
        ├── store/          # Zustand auth store (persisted)
        └── types/          # Shared TypeScript types
```

---

## Database Schema (20 tables)

| Table               | Description                                   |
|---------------------|-----------------------------------------------|
| branchs             | Dealership branches                           |
| users               | Staff accounts with role-based access         |
| customers           | Customer master with full contact details     |
| vehicles            | Inventory with category, status, pricing      |
| leads               | Full pipeline with AI scoring                 |
| leadactivitys       | Timestamped activity log per lead             |
| testdrives          | Scheduling, assignment, feedback, rating      |
| quotations          | On-road price breakdowns with EMI             |
| bookings            | Payment and delivery workflow                 |
| loanapplications    | Multi-bank loan tracking with EMI calc        |
| insurancepolicys    | Policy lifecycle (active → renewal → claim)   |
| servicejobs         | Job cards with status workflow                |
| spareparts          | Parts inventory with low-stock alerts         |
| purchaseorders      | Vendor POs for parts replenishment            |
| tickets             | Support tickets with SLA tracking             |
| documents           | Customer document vault with version control  |
| communicationlogs   | Every email/SMS/WhatsApp/call interaction     |
| messagetemplates    | Reusable communication templates              |
| notifications       | In-app notification feed per user             |
| auditlogs           | Immutable log of every system action          |

---

## API Endpoints (v1)

| Prefix              | Key endpoints                                              |
|---------------------|------------------------------------------------------------|
| `/auth`             | login, register, refresh, forgot-password, reset-password |
| `/customers`        | CRUD + `/{id}/360` (Customer 360 aggregated view)         |
| `/leads`            | CRUD + activities + AI scoring on every status change     |
| `/vehicles`         | CRUD + inventory-summary with low-stock alerts            |
| `/test-drives`      | Schedule, update status, record feedback                  |
| `/quotations`       | Create with full on-road price breakdown                  |
| `/bookings`         | Booking → payment → delivery workflow                     |
| `/finance/loans`    | Loan applications + approval tracking                     |
| `/finance/insurance`| Policy CRUD + status lifecycle                            |
| `/finance/emi-calculator` | Standard EMI formula endpoint                       |
| `/service/jobs`     | Job cards booked → inspection → in_progress → delivered   |
| `/service/parts`    | Spare parts inventory + low-stock report                  |
| `/tickets`          | Support tickets with SLA auto-calculation                 |
| `/dashboard`        | Live KPIs, trend charts, branch performance               |
| `/dashboard/widgets`| Today's appointments, deliveries, service alerts          |
| `/ai/chat`          | Natural-language CRM queries                              |
| `/ai/follow-up-generator` | Email / WhatsApp / call-script generation           |
| `/ai/service-reminders`  | Predict upcoming service requirements                |
| `/ai/sales-forecast`     | Next-month units & revenue prediction                |
| `/branches`         | Multi-branch management + per-branch reports              |
| `/users`            | User management with RBAC                                 |
| `/notifications`    | Per-user notification feed                                |
| `/audit-logs`       | Immutable audit trail (super_admin only)                  |

---

## Security

- JWT access tokens (30 min) + refresh tokens (7 days)
- bcrypt password hashing
- Role-based access control (6 roles)
- Automatic token refresh via axios interceptor
- Audit log on every login and key mutation
- CORS configured per environment

---

## Deployment

### Frontend → Vercel
```bash
# Set environment variable in Vercel dashboard:
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
```

### Backend → Railway / Render
```bash
# Set environment variables:
DATABASE_URL=postgresql+psycopg2://...
SECRET_KEY=<long random string>
BACKEND_CORS_ORIGINS=["https://your-frontend.vercel.app"]
```

### Database → Supabase / Neon
```
1. Create project in Supabase
2. Copy "Transaction pooler" connection string
3. Set as DATABASE_URL in backend env
4. Run: python app/db/init_db.py && python app/db/seed.py
```

---

## Design System

**Palette:** Instrument-cluster dark chrome (`#0B1120`) + ignition orange accent (`#FF5A1F`)  
**Signature element:** Gauge component on login screen and dashboard — tachometer-style arc inspired by automotive instrument panels  
**Type:** System font stacks approximating Space Grotesk (display) + Inter (body) + JetBrains Mono (data)  
**Dark sidebar:** High-contrast navigation panel inspired by modern automotive HMI screens  

---

*Built as an enterprise portfolio project. All Tata Motors branding is inspirational; this is an independent open-source project.*
