# BhoomiSetu — Backend Integration Handoff

Everything needed to run the backend and see the frontend using live data.
Backend by Advik. The frontend base is the team lead's latest code; only the
files listed at the bottom were touched.

---

## 1. Run the backend (first time, ~3 minutes)

Requires Python 3.10 or newer.

```bash
cd backend
pip install -r requirements.txt

cd app
copy ..\.env.example .env        # Windows   (Mac/Linux: cp ../.env.example .env)

python create_tables.py          # creates the database + 16 tables
python seed.py                   # loads ~560 rows of demo data
python -m uvicorn main:app --reload --port 8000
```

Leave that terminal running. Check it worked: open **http://localhost:8000/docs**
— an interactive API page listing every endpoint.

> If `uvicorn` is "not recognised", use `python -m uvicorn ...` as shown — that
> avoids a Windows PATH issue.

## 2. Run the frontend as normal

```bash
npm install
npm run dev
```

Runs on **http://localhost:8081**. The backend already allows that origin
through CORS — no config needed.

## 3. Confirm the two are talking

1. Open the app → Login. The form is pre-filled with
   `sk.rathore@delhi.gov.in` / `bhoomi123`.
2. Sign in → Officer Dashboard.
3. Look under the header for a **green dot: "Live data — BhoomiSetu API"**.

Green means the figures came from the database. Grey means the backend isn't
running — **the app still works**, it just falls back to local demo data.

Also open **Officer → Risk Monitor**: the "Live SLA Engine" panel is computed
on request, so overdue day counts increase on their own over time.

## 4. Demo logins

All seeded accounts share the password **`bhoomi123`**.

| Email | Level | Sees as |
|---|---|---|
| `dg.landrecords@nic.in` | L0 | ADMIN |
| `collector.northdelhi@nic.in` | L2 | ADMIN |
| `sk.rathore@delhi.gov.in` | L4 | OFFICER |
| `patwari.narela@delhi.gov.in` | L5 | OFFICER |
| `rajkumar.narela@example.com` | L9 | LANDOWNER |

Eleven accounts exist, one per role level L0–L10.

---

## The database: 16 tables, ~560 rows

| Table | Rows | Holds |
|---|---|---|
| `jurisdiction` | 28 | Nation → state → district → village tree |
| `departments` | 5 | Implementing agencies (NHAI, PWD, DFCCIL…) |
| `user` | 11 | Accounts, one per role level L0–L10 |
| `project` | 6 | Acquisition projects + governance rules |
| `project_stage` | 60 | The 10 statutory stages per project |
| `land_parcel` | 48 | Individual parcels with computed compensation |
| `document` | 149 | Uploads with OCR data and verification state |
| `document_verification` | 125 | Every review round, append-only |
| `compensation_record` | 48 | Awards, approvals and DBT disbursement |
| `statutory_notification` | 20 | Sec 4/6/11/19/23 gazette notifications |
| `risk_alert` | 6 | Recorded delay flags, active and resolved |
| `notification` | 6 | In-app alerts |
| `audit_log` | 40 | Who did what, when |
| `sla_rules` | 4 | Per-department response/resolution targets |
| `system_settings` | 1 | Session timeout, 2FA, maintenance mode |
| `landowner_kyc` | 1 | Encrypted Aadhaar/bank, isolated table |

## Endpoints

| Endpoint | Returns |
|---|---|
| `POST /auth/login` · `GET /auth/me` | JWT token; the signed-in user with role |
| `GET/POST /departments/` · `/jurisdictions/` · `/users/` | Master data |
| `GET/POST /projects/` · `GET /projects/{id}` | Acquisition projects |
| `GET/POST /land_parcel/` · `GET /land_parcel/{id}` | Land parcels |
| `GET/POST /documents/` · `GET /documents/{id}` | Documents, filterable by parcel/project/status |
| `POST /documents/{id}/verify` | Record a verification decision |
| `GET /documents/{id}/history` | Every review round for one document |
| `GET/POST /compensation/` | Award records |
| `POST /compensation/{id}/approve` · `/disburse` | Approval and DBT release |
| `GET/POST /notifications/` · `POST /{id}/read` · `/read-all` | In-app alerts |
| `GET /admin/audit-logs` | Audit trail, filterable by entity |
| `GET/PATCH /admin/settings` | System settings |
| `GET /admin/projects/{id}/stages` | A project's 10-stage timeline |
| `GET/POST /admin/statutory-notifications` | Gazette notifications |
| `GET /dashboard/stats` · `/by-state` · `/by-department` · `/risks` | National aggregates and live delay detection |

### Who can do what

Authentication is required for every write, and for every endpoint that
returns records. Only plain reference lists stay open.

| Action | Requires |
|---|---|
| Create/update projects, parcels, documents, compensation, gazette notifications | Signed in as OFFICER or ADMIN |
| Create departments, jurisdictions, **user accounts** | Signed in as ADMIN |
| Read the audit trail, read/change system settings | Signed in as ADMIN |
| Read stage timelines, list users | OFFICER or ADMIN |
| Read projects, parcels, documents, compensation, dashboards | Any signed-in user (results scoped — see below) |
| List departments and jurisdictions | Open (reference data only) |

Enforced by a `require_roles(...)` dependency in `app/routers/auth.py`, so the
rule sits next to the endpoint rather than being scattered through the code.

**Session length is administrator-configurable.** `system_settings.session_timeout_minutes`
is read at login and becomes the JWT's expiry — change it to 15 and the next
token issued expires in 15 minutes, with no code change.

### What each user can see

Role decides what you may *do*; jurisdiction decides *which rows* you may do it
to. Both are enforced server-side, in `app/scoping.py`.

| Signed in as | Projects | Parcels / documents / compensation |
|---|---|---|
| L0 national, L10 auditor | all | all |
| L1 state | their state and below | their state and below |
| L2 district | their district, plus state/national projects covering it | their district only |
| L5 village | their village, plus everything above covering it | their village only |
| L9 citizen | the projects their own parcels belong to | their own parcels only |

Measured on the seeded data:

| | projects | parcels | documents | compensation | risks |
|---|---|---|---|---|---|
| L0 national | 6 | 48 | 149 | 48 | 4 |
| L1 Delhi NCT | 2 | 15 | 49 | 15 | 1 |
| L2 North Delhi | 2 | 9 | 28 | 9 | 1 |
| L5 Narela | 2 | 2 | 6 | 2 | 1 |
| L9 landowner | 1 | 1 | 2 | 1 | 0 |

**Projects widen upward, parcels narrow downward** — deliberately. A parcel sits
in exactly one village, so subtree matching is right. A project is recorded at
whatever level it was created at, often a whole state, and a corridor covering
Delhi NCT genuinely does affect North Delhi — so its Collector must see it.

Out-of-scope records return **404, not 403**. Confirming that a record exists
but is off-limits would itself leak information about other jurisdictions.
Query filters cannot be used to escape scope: `?parcel_id=` for a parcel you
cannot see returns an empty list, not a permission error.

### Rules the API enforces

- **Compensation is computed, not accepted.** Send `area_acre`,
  `circle_rate_per_acre` and `additional_asset_value`; the server returns market
  value, 100% solatium (Sec 30(1) RFCTLARR) and the total. Any total you try to
  send is ignored.
- **Disbursement requires approval.** `POST /compensation/{id}/disburse` returns
  400 unless the record is already `Approved` — the ordering is enforced on the
  server, not trusted to the interface.
- **Document reviews are append-only.** Verifying writes both the new status and
  a history row, so an earlier rejection survives a later approval.
- **Status fields are validated.** `status`, `land_type`, `current_stage` etc.
  accept only the exact values from `src/types/index.ts`; anything else gets a
  422 listing the valid options. If those unions change in the frontend,
  `app/schema.py` needs the same change.

---

## Frontend files touched (6 total)

**New — drop-in, no dependencies on anything else:**

| File | Purpose |
|---|---|
| `src/services/api.ts` | All backend calls. One place holding the base URL, token handling and endpoint list. |
| `src/services/useBackend.ts` | React hooks returning `{ data, loading, online }`. |

**Edited — each is additive; existing behaviour is the fallback path:**

| File | Change |
|---|---|
| `src/components/auth/LoginPage.tsx` | `handleSubmit` calls `api.login()`. On failure it falls back to the original `loginAs()` demo login and shows a toast. |
| `src/components/officer/OfficerDashboard.tsx` | The four hardcoded constants (`totalProjects = 24` etc.) read from `/dashboard/stats`, with the original values as fallback. Adds the live/offline indicator. |
| `src/components/officer/RiskDelayMonitor.tsx` | Adds a "Live SLA Engine" panel above the existing alerts list. The existing list is untouched. |
| `src/components/layout/Sidebar.tsx` | **Bug fix, unrelated to the backend.** `item.isNew` was read but no nav item declared it, so `npm run build` failed with TS2339. Added a `NavItem` interface and annotated the three arrays. No behaviour change. |

To undo the integration: delete the two `services/` files and revert the first
three — the app returns to pure localStorage. Keep the `Sidebar.tsx` fix.

`npx tsc --noEmit` passes clean.

---

## Not done yet

- Only Login, the Officer Dashboard and the Risk Monitor read live data.
  Every other screen still uses `AppContext` + localStorage.
- No database migrations (Alembic). Schema changes need `create_tables.py`
  re-run against a fresh database.
- **Role-based access is enforced; jurisdiction-based scoping is not.** An
  officer in North Delhi is correctly blocked from admin endpoints, but can
  still read parcels in Haryana. The JWT already carries `jurisdiction_id`, so
  the remaining work is filtering each query by it. `App.tsx`'s route guards
  are client-side convenience only — the server is the real boundary.
- KYC values are placeholder-encrypted. A real deployment needs pgcrypto or an
  application-level key.
- Data is synthetic. Place names are real public administrative data; every
  person, amount and land record is invented.
