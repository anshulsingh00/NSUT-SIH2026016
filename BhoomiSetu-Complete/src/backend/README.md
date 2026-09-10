# BhoomiSetu — Backend API

REST API for the BhoomiSetu land acquisition platform (SIH26016).
FastAPI + SQLAlchemy + SQLite (Postgres-ready).

## Run it

```bash
pip install -r requirements.txt
cd app
cp ../.env.example .env        # then edit if needed
python create_tables.py        # creates the database + tables
python seed.py                 # loads the demo dataset
python -m uvicorn main:app --reload --port 8000
```

Open **http://localhost:8000/docs** for the interactive API documentation
(auto-generated — every endpoint can be tried from the browser).

## Logging in

All seeded users share the password `bhoomi123`. One account exists per role
level L0–L10, for example:

| Email | Role |
|---|---|
| `dg.landrecords@nic.in` | L0 — National admin |
| `collector.northdelhi@nic.in` | L2 — District Collector |
| `sk.rathore@delhi.gov.in` | L4 — Land Acquisition Officer |
| `rajkumar.narela@example.com` | L9 — Landowner |

`POST /auth/login` returns a JWT. In `/docs`, click **Authorize** and paste the
token (without the word `Bearer`) to call protected endpoints.

## What each file does

| File | Purpose |
|---|---|
| `app/database.py` | DB connection, session factory, `Base` class |
| `app/models.py` | The sixteen database tables, as SQLAlchemy classes |
| `app/schema.py` | What the API accepts and returns; enforces allowed values |
| `app/security.py` | Password hashing (bcrypt) + JWT create/verify. Token expiry comes from `system_settings`, not a constant. |
| `app/calculations.py` | RFCTLARR compensation formula — single source of truth |
| `app/risk_engine.py` | Rule-based delay detection against per-stage targets |
| `app/scoping.py` | Jurisdiction row filtering — who may see which records |
| `app/create_tables.py` | One-off: builds the tables from `models.py` |
| `app/seed.py` | One-off: loads the demo dataset (safe to re-run) |
| `app/main.py` | Assembles the app from all routers |
| `app/routers/` | One file per resource — the actual HTTP endpoints |

## Endpoints

| Group | Routes |
|---|---|
| `/auth` | `POST /login`, `GET /me` |
| `/departments` | `GET`, `POST` |
| `/jurisdictions` | `GET`, `POST` |
| `/users` | `GET`, `POST` |
| `/projects` | `GET`, `POST`, `GET /{id}` |
| `/land_parcel` | `GET`, `POST`, `GET /{id}` |
| `/documents` | `GET`, `POST`, `GET /{id}`, `POST /{id}/verify`, `GET /{id}/history` |
| `/compensation` | `GET`, `POST`, `GET /{id}`, `POST /{id}/approve`, `POST /{id}/disburse` |
| `/notifications` | `GET`, `POST`, `POST /{id}/read`, `POST /read-all` |
| `/admin` | `GET /audit-logs`, `GET|PATCH /settings`, `GET /projects/{id}/stages`, `GET|POST /statutory-notifications` |
| `/dashboard` | `GET /stats`, `GET /by-state`, `GET /by-department`, `GET /risks` |

## Access control

Every write requires a signed-in user; sensitive reads require a role.
`require_roles(...)` in `app/routers/auth.py` builds a dependency per endpoint:

- **ADMIN only** — audit trail, system settings, creating users, departments
  and jurisdictions.
- **OFFICER or ADMIN** — creating projects, parcels, documents, compensation
  records and gazette notifications; reading stage timelines and the user list.
- **Open** — reference lists only (departments, jurisdictions).

On top of that, every record-bearing endpoint is filtered by the caller's
position in the jurisdiction tree (`app/scoping.py`), so a village officer and
a national administrator run identical queries and get different rows.

Account creation is deliberately administrator-only: `role_level` decides what a
user can reach, so anonymous signup would be straightforward privilege
escalation.

## Design notes

**Compensation is computed, never submitted.** Clients send `area_acre`,
`circle_rate_per_acre` and `additional_asset_value`; the server derives
market value, 100% statutory solatium (Sec 30(1) RFCTLARR 2013) and the total.
`calculations.py` is used by both the API and the seed script so the numbers
can never disagree.

**Delay severity is relative to each stage.** A 60-day survey and a 10-day
award approval cannot share one threshold, so `risk_engine.py` compares days
elapsed against that stage's own target and classifies how far *overdue* it is.
Stage targets mirror the frontend's `CreateProjectWizard.tsx`.

**Workflow rules are enforced server-side.** A compensation record cannot be
disbursed unless it is already `Approved`; document verification appends a
history row rather than overwriting, so an earlier rejection survives a later
approval. Neither rule is trusted to the interface.

**Status values are validated at the boundary.** `schema.py` declares the
allowed values as `Literal` types copied from the frontend's
`src/types/index.ts`, so an invalid status is rejected with a 422 before it can
reach the database and break the UI's colour coding. If the frontend changes
those unions, update `schema.py` to match.

**Passwords are never stored or returned.** `UserCreate` accepts a plaintext
`password`; only its bcrypt hash is persisted. `UserOut` deliberately does not
inherit from `UserCreate`, so neither the password nor its hash can leak into
an API response.

## Not done yet

- **Partial frontend integration.** Login, the Officer Dashboard and the Risk
  Monitor read live data. Every other screen still uses `AppContext` +
  `localStorage`.
- **Alembic migrations** — schema changes currently need a DB rebuild.
- **Real dataset import** — see the Data Workbook spec.
- **KYC encryption is a placeholder.** `landowner_kyc` stores marker strings,
  not real ciphertext. Production needs pgcrypto or an application-level key.
