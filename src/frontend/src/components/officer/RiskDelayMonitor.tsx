import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldAlert, 
  Building2, 
  Check, 
  RefreshCw, 
  ChevronRight,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { useRiskAlerts } from '../../services/useBackend';

export const RiskDelayMonitor: React.FC = () => {
  const { riskAlerts, resolveRiskAlert, projects, navigate, showToast } = useApp();

  // Live risk assessment from the backend SLA engine
  const { data: liveRisks, online: backendOnline } = useRiskAlerts();

  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const filteredAlerts = riskAlerts.filter(a => {
    if (severityFilter === 'ALL') return true;
    return a.severity === severityFilter;
  });

  const activeAlerts = filteredAlerts
    .filter(a => a.status === 'ACTIVE')
    .sort((a, b) => {
      const order: Record<string, number> = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
      return (order[a.severity] || 99) - (order[b.severity] || 99);
    });
  const resolvedAlerts = filteredAlerts.filter(a => a.status === 'RESOLVED');

  const handleResolve = (id: string, actionName: string) => {
    resolveRiskAlert(id);
    showToast(
      'Risk Bottleneck Resolved',
      `Mitigation applied: ${actionName}`,
      'success'
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-300 text-xs font-bold uppercase mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-red-700 dark:text-red-400" />
            <span>Automated SLA Delay Diagnostic Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-sans">
            Statutory Delay & Project Risk Monitor
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time bottleneck detection tracking milestone elapsed times against statutory RFCTLARR Act SLA standards.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 font-semibold"
          >
            <option value="ALL">All Severity Levels</option>
            <option value="CRITICAL">Critical SLA Breaches</option>
            <option value="HIGH">High Severity</option>
            <option value="MEDIUM">Medium Severity</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-5 rounded-xl border border-red-200 dark:border-red-900/50 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-red-800 dark:text-red-400">Critical Delays</span>
            <AlertOctagon className="w-4 h-4 text-red-700 dark:text-red-500" />
          </div>
          <div className="text-3xl font-bold text-red-900 dark:text-red-300 mt-2 font-sans">
            {riskAlerts.filter(r => r.severity === 'CRITICAL' && r.status === 'ACTIVE').length}
          </div>
          <div className="text-[11px] text-red-700 dark:text-red-400 mt-1">Requires immediate Competent Authority intervention</div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-xl border border-amber-200 dark:border-amber-900/50 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">High Risk Corridors</span>
            <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-amber-900 dark:text-amber-300 mt-2 font-sans">
            {riskAlerts.filter(r => r.severity === 'HIGH' && r.status === 'ACTIVE').length}
          </div>
          <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">Nearing statutory limitation deadlines</div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">Resolved Bottlenecks</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-300 mt-2 font-sans">
            {riskAlerts.filter(r => r.status === 'RESOLVED').length}
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">Mitigation actions logged into audit trail</div>
        </div>
      </div>

      {/* Live risk engine output - computed by the backend from real stage dates */}
      {backendOnline && liveRisks && liveRisks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Live SLA Engine &mdash; computed from stage dates ({liveRisks.length})
            </h2>
          </div>

          {liveRisks.map(risk => (
            <div
              key={risk.project_id}
              className={`bg-white dark:bg-slate-900 rounded-xl border shadow-xs p-4 ${
                risk.severity === 'CRITICAL' ? 'border-red-300 ring-1 ring-red-200' :
                risk.severity === 'HIGH_RISK' ? 'border-amber-300' :
                'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      risk.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                      risk.severity === 'HIGH_RISK' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {risk.severity.replace('_', ' ')}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">
                      {risk.project_name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5">{risk.reason}</p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                    <strong>Recommended:</strong> {risk.recommended_action}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                    +{risk.overdue_days}d
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wide">
                    {risk.days_pending}d / {risk.target_days}d target
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Delay Alerts List */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Active Statutory Delay Notifications ({activeAlerts.length})
        </h2>

        {activeAlerts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs italic">
            No active delay alerts matching the selected filter criteria. All milestones are within SLA limits.
          </div>
        ) : (
          activeAlerts.map(alert => (
            <div
              key={alert.id}
              className={`bg-white dark:bg-slate-900 rounded-xl border shadow-xs overflow-hidden transition-all ${
                alert.severity === 'CRITICAL' ? 'border-red-300 ring-1 ring-red-200' :
                alert.severity === 'HIGH' ? 'border-amber-300' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      alert.severity === 'CRITICAL' ? 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-300 border border-red-300 dark:border-red-800/50' :
                      alert.severity === 'HIGH' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800/50' :
                      'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 border border-blue-300 dark:border-blue-800/50'
                    }`}>
                      {alert.severity} DELAY RISK
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {alert.projectName} ({alert.projectId})
                    </span>
                  </div>

                  <div className="text-xs text-slate-800 dark:text-slate-200 font-semibold">
                    Bottleneck Stage: <span className="text-blue-900 dark:text-blue-400 underline">{alert.currentStage}</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <strong>Root Cause:</strong> {alert.reason}
                  </p>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-mono">
                    <span className="text-blue-900 dark:text-blue-400 font-bold block mb-0.5">Recommended Statutory Remediation:</span>
                    {alert.recommendedAction}
                  </div>
                </div>

                {/* Metric & Action buttons */}
                <div className="flex flex-col items-end justify-between shrink-0 space-y-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Elapsed Time vs SLA</span>
                    <div className="text-xl font-bold text-red-700 dark:text-red-400 font-mono">
                      {alert.daysPending} Days <span className="text-xs text-slate-400 font-normal">/ SLA: {alert.expectedDays} Days</span>
                    </div>
                    <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">
                      +{alert.daysPending - alert.expectedDays} Days Overdue
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate('/officer/projects/:id', { id: alert.projectId })}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer"
                    >
                      Inspect Project
                    </button>
                    <button
                      onClick={() => handleResolve(alert.id, alert.recommendedAction)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center space-x-1 cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Execute Mitigation</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resolved Log */}
      {resolvedAlerts.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Resolved Risk Log ({resolvedAlerts.length})
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {resolvedAlerts.map(res => (
              <div key={res.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{res.projectName}</span>
                    <span className="text-slate-500 dark:text-slate-400 ml-2">— {res.currentStage}</span>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded font-semibold">
                  Resolved
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
