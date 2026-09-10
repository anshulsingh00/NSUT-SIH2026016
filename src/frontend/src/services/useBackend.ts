/**
 * React hooks for reading live data from the BhoomiSetu backend.
 *
 * Each hook reports three things: the data, whether it is still loading, and
 * whether the backend could be reached at all. Components fall back to their
 * existing local data when `online` is false, so the app still runs with the
 * API switched off.
 */

import { useEffect, useState } from 'react';
import { api, DashboardStats, RiskItem, StateStats, DepartmentStats } from './api';

interface BackendState<T> {
  data: T | null;
  loading: boolean;
  online: boolean;
  error: string | null;
}

function useBackendResource<T>(fetcher: () => Promise<T>, deps: unknown[] = []): BackendState<T> {
  const [state, setState] = useState<BackendState<T>>({
    data: null,
    loading: true,
    online: false,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, online: true, error: null });
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setState({ data: null, loading: false, online: false, error: err.message });
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

export const useDashboardStats = () => useBackendResource<DashboardStats>(() => api.dashboardStats());
export const useRiskAlerts = () => useBackendResource<RiskItem[]>(() => api.dashboardRisks());
export const useStateStats = () => useBackendResource<StateStats[]>(() => api.dashboardByState());
export const useDepartmentStats = () => useBackendResource<DepartmentStats[]>(() => api.dashboardByDepartment());
