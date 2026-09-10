/**
 * BhoomiSetu backend API client.
 *
 * Everything that talks to the FastAPI backend goes through this file, so
 * there is exactly one place that knows the base URL, the auth header format,
 * and how errors are surfaced.
 *
 * Backend repo: backend/app  (run with: python -m uvicorn main:app --port 8000)
 */

const API_BASE = 'http://localhost:8000';
const TOKEN_KEY = 'bhoomi_access_token';

// ---------------------------------------------------------------------------
// Token storage
// ---------------------------------------------------------------------------

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable - ignore */
  }
}

// ---------------------------------------------------------------------------
// Core request helper
// ---------------------------------------------------------------------------

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (typeof body?.detail === 'string') detail = body.detail;
    } catch {
      /* response had no JSON body */
    }
    throw new ApiError(detail, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

/** True if the backend is reachable. Used to decide online vs offline mode. */
export async function isBackendUp(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/dashboard/stats`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Types returned by the backend (snake_case, matching the Python schemas)
// ---------------------------------------------------------------------------

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: 'OFFICER' | 'LANDOWNER' | 'ADMIN' | null;
  role_level: string | null;
  designation: string | null;
  phone: string | null;
  department_id: number | null;
  jurisdiction_id: number | null;
  digital_signature_verified: boolean | null;
}

export interface ApiProject {
  id: number;
  name: string;
  department_id: number | null;
  jurisdiction_id: number | null;
  project_type: string | null;
  status: string | null;
  current_stage: string | null;
  total_area_acres: number | null;
  estimated_budget_cr: number | null;
  area_notified_acres: number | null;
  area_acquired_acres: number | null;
  affected_families_count: number | null;
  displaced_families_count: number | null;
  possession_status: string | null;
  rr_status: string | null;
  compensation_assessed_cr: number | null;
  disbursed_compensation_cr: number | null;
}

export interface ApiLandParcel {
  id: number;
  project_id: number | null;
  owner_user_id: number | null;
  jurisdiction_id: number | null;
  survey_number: string | null;
  khasra_number: string | null;
  khatauni_number: string | null;
  area_acre: number | null;
  land_type: string | null;
  circle_rate_per_acre: number | null;
  market_value_total: number | null;
  solatium_amount: number | null;
  additional_asset_value: number | null;
  total_compensation: number | null;
  verification_status: string | null;
  compensation_status: string | null;
  status: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface ApiDepartment {
  id: number;
  code: string;
  name: string;
  head_name: string | null;
  nodal_officer: string | null;
  contact_email: string | null;
  allocated_budget_cr: number | null;
}

export interface ApiJurisdiction {
  id: number;
  name: string;
  type: 'NATION' | 'STATE' | 'DISTRICT' | 'VILLAGE';
  parent_id: number | null;
}

export interface DashboardStats {
  projects: {
    total: number;
    by_status: Record<string, number>;
    by_stage: Record<string, number>;
    by_possession_status: Record<string, number>;
    by_rr_status: Record<string, number>;
  };
  land: {
    total_parcels: number;
    area_total_acres: number;
    area_notified_acres: number;
    area_acquired_acres: number;
    acquisition_progress_pct: number;
    parcels_by_status: Record<string, number>;
    parcels_by_verification: Record<string, number>;
    parcels_by_compensation_status: Record<string, number>;
  };
  compensation: {
    estimated_budget_cr: number;
    assessed_cr: number;
    disbursed_cr: number;
    pending_cr: number;
    disbursement_progress_pct: number;
    parcel_level_total_rupees: number;
  };
  families: { affected: number; displaced: number };
}

export interface RiskItem {
  project_id: number;
  project_name: string;
  current_stage: string;
  days_pending: number;
  target_days: number;
  overdue_days: number;
  severity: 'CRITICAL' | 'HIGH_RISK' | 'ATTENTION' | 'UNKNOWN';
  reason: string;
  recommended_action: string;
}

export interface StateStats {
  state: string;
  projects: number;
  parcels: number;
  area_notified_acres: number;
  area_acquired_acres: number;
  compensation_assessed_cr: number;
  disbursed_compensation_cr: number;
  affected_families: number;
  displaced_families: number;
}

export interface DepartmentStats {
  code: string;
  name: string;
  projects: number;
  area_acquired_acres: number;
  disbursed_compensation_cr: number;
  affected_families: number;
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export const api = {
  /** Exchange email + password for a JWT, and remember it. */
  async login(email: string, password: string): Promise<ApiUser> {
    const { access_token } = await request<{ access_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(access_token);
    return api.me();
  },

  logout(): void {
    setToken(null);
  },

  me: () => request<ApiUser>('/auth/me'),

  listUsers: () => request<ApiUser[]>('/users/'),
  listProjects: () => request<ApiProject[]>('/projects/'),
  getProject: (id: number) => request<ApiProject>(`/projects/${id}`),
  listParcels: () => request<ApiLandParcel[]>('/land_parcel/'),
  getParcel: (id: number) => request<ApiLandParcel>(`/land_parcel/${id}`),
  listDepartments: () => request<ApiDepartment[]>('/departments/'),
  listJurisdictions: () => request<ApiJurisdiction[]>('/jurisdictions/'),

  dashboardStats: () => request<DashboardStats>('/dashboard/stats'),
  dashboardRisks: () => request<RiskItem[]>('/dashboard/risks'),
  dashboardByState: () => request<StateStats[]>('/dashboard/by-state'),
  dashboardByDepartment: () => request<DepartmentStats[]>('/dashboard/by-department'),
};

export { ApiError };
