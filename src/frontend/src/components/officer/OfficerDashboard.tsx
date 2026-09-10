import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FolderKanban,
  MapPin,
  FileCheck2,
  IndianRupee,
  AlertOctagon,
  TrendingUp,
  Plus,
  ArrowRight,
  Map as MapIcon,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  FileSearch,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  BarChart3,
  Layers
} from 'lucide-react';
import { OfficerAnalyticsModule } from './OfficerAnalyticsModule';
import { useDashboardStats, useRiskAlerts } from '../../services/useBackend';

export const OfficerDashboard: React.FC = () => {
  const {
    currentUser,
    projects,
    parcels,
    documents,
    compensations,
    riskAlerts,
    navigate
  } = useApp();

  const [activeView, setActiveView] = useState<'OVERVIEW' | 'ANALYTICS'>('OVERVIEW');

  // Live figures from the backend. While loading, or if the API is not running,
  // these fall back to the local demo values so the page still works.
  const { data: stats, online } = useDashboardStats();
  const { data: backendRisks } = useRiskAlerts();

  const totalProjects = stats?.projects.total ?? 24;
  const activeProjects = stats
    ? (stats.projects.by_status['In Progress'] ?? 0) + (stats.projects.by_status['Active'] ?? 0)
    : 16;
  const totalAcquiredAcres = stats ? Math.round(stats.land.area_acquired_acres) : 5720;
  const totalCompensationCr = stats
    ? `₹${stats.compensation.disbursed_cr.toLocaleString('en-IN')} Cr`
    : '₹142.5 Cr';
  const criticalDelayCount = backendRisks
    ? backendRisks.filter(r => r.severity === 'CRITICAL').length
    : (riskAlerts.filter(r => r.status === 'ACTIVE' && r.severity === 'CRITICAL').length || 3);

  const priorityProject = projects[0] || {
    id: 'PRJ-001',
    name: 'Delhi–Meerut Regional Connectivity Expressway',
    department: 'National Highways Authority of India (NHAI)',
    progressPercentage: 78,
    status: 'In Progress',
    currentStage: 'Valuation & Solatium Calculation'
  };

  const recentParcels = parcels.slice(0, 4);

  if (activeView === 'ANALYTICS') {
    return (
      <div className="space-y-6">
        {/* Top View Selector Bar */}
        <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-2">
          <button
            onClick={() => setActiveView('OVERVIEW')}
            className="flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center justify-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-50 dark:bg-slate-800"
          >
            <FolderKanban className="w-4 h-4" />
            <span>Executive Dashboard</span>
          </button>

          <button
            onClick={() => setActiveView('ANALYTICS')}
            className="flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center justify-center space-x-2 bg-blue-900 text-white shadow-sm"
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>Analytics Reports</span>
          </button>
        </div>

        <OfficerAnalyticsModule />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top View Selector Bar */}
      <div className="bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-2">
        <button
          onClick={() => setActiveView('OVERVIEW')}
          className="flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center justify-center space-x-2 bg-blue-900 text-white shadow-sm"
        >
          <FolderKanban className="w-4 h-4 text-amber-400" />
          <span>Executive Dashboard</span>
        </button>

        <button
          onClick={() => setActiveView('ANALYTICS')}
          className="flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center justify-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-50 dark:bg-slate-800"
        >
          <BarChart3 className="w-4 h-4 text-blue-700" />
          <span>Analytics Reports</span>
        </button>
      </div>

      {/* Officer Welcome & Quick Actions Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800">
              {currentUser?.designation || 'Special Land Acquisition Officer (SLAO)'}
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">Jurisdiction: {currentUser?.district || 'North Delhi NCR'}, {currentUser?.state || 'Delhi'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-3">
            Project Dashboard & Control
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time RFCTLARR Act 2013 statutory milestone monitoring, parcel verification & PFMS disbursements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/officer/projects/create')}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </button>

          <button
            onClick={() => navigate('/officer/documents/ocr')}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 font-medium text-sm transition-colors cursor-pointer"
          >
            <FileSearch className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>AI Document OCR</span>
          </button>

          <button
            onClick={() => navigate('/officer/map')}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 font-medium text-sm transition-colors cursor-pointer"
          >
            <MapIcon className="w-4 h-4 text-blue-600 dark:text-blue-500" />
            <span>GIS Map</span>
          </button>
        </div>
      </div>

      {/* Data source indicator - shows whether figures are live from the API */}
      <div className="flex items-center space-x-2 text-xs">
        <span className={`inline-block w-2 h-2 rounded-full ${online ? 'bg-emerald-500' : 'bg-slate-400'}`} />
        <span className={online ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}>
          {online
            ? 'Live data — BhoomiSetu API (localhost:8000)'
            : 'Offline demo data — backend API not reachable'}
        </span>
      </div>

      {/* Row 1: Top 4 Professional Polish Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/officer/projects')}
          className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer"
        >
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
            Total Active Projects
          </p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
            {activeProjects} <span className="text-sm font-normal text-slate-400 ml-2">of {totalProjects} total</span>
          </h3>
        </div>

        <div
          onClick={() => navigate('/officer/land-parcels')}
          className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-400 dark:hover:border-emerald-500 transition-all cursor-pointer"
        >
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
            Land Acquired (Acres)
          </p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
            {totalAcquiredAcres.toLocaleString('en-IN')} <span className="text-sm font-normal text-emerald-600 dark:text-emerald-400 ml-2">{stats ? `${stats.land.acquisition_progress_pct}% of notified` : '68% of Target'}</span>
          </h3>
        </div>

        <div
          onClick={() => navigate('/officer/compensation')}
          className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer"
        >
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
            Compensation Paid
          </p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
            {totalCompensationCr}
          </h3>
        </div>

        <div
          onClick={() => navigate('/officer/risk-monitor')}
          className="bg-red-50 dark:bg-red-900/10 p-5 rounded-xl border border-red-200 dark:border-red-800/50 shadow-sm hover:border-red-300 dark:hover:border-red-500 transition-all cursor-pointer"
        >
          <p className="text-sm font-medium text-red-800 dark:text-red-400 mb-2">
            Critical Delays
          </p>
          <h3 className="text-3xl font-bold text-red-700 dark:text-red-400">
            0{criticalDelayCount} <span className="text-sm font-normal text-red-600 dark:text-red-400 ml-2">Action Required</span>
          </h3>
        </div>
      </div>

      {/* Row 2: 2/3 Main Corridor Progress + 1/3 Side Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1 & 2: Active Corridor Stepper + Recent Land Parcels */}
        <div className="lg:col-span-2 space-y-6">
          {/* Priority Project Milestone Stepper Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  {priorityProject.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Project ID: {priorityProject.id} | {priorityProject.department}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 rounded-md text-xs font-medium">
                  In Progress
                </span>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-2">
                  {priorityProject.progressPercentage}% <span className="text-xs font-medium text-slate-500 dark:text-slate-400 align-middle ml-1">Overall Progress</span>
                </p>
              </div>
            </div>

            {/* Horizontal 5-Step Progress Track */}
            <div className="pt-2 pb-2">
              <div className="flex items-center justify-between relative px-2">
                {/* Step 1 */}
                <div className="flex flex-col items-center space-y-2 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                    ✓
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Identification</span>
                </div>

                {/* Line 1-2 */}
                <div className="flex-1 h-1 bg-emerald-600 -mt-6 mx-2"></div>

                {/* Step 2 */}
                <div className="flex flex-col items-center space-y-2 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                    ✓
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Survey</span>
                </div>

                {/* Line 2-3 */}
                <div className="flex-1 h-1 bg-emerald-600 -mt-6 mx-2"></div>

                {/* Step 3 */}
                <div className="flex flex-col items-center space-y-2 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                    ✓
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Verification</span>
                </div>

                {/* Line 3-4 */}
                <div className="flex-1 h-1 bg-blue-600 -mt-6 mx-2"></div>

                {/* Step 4: Active */}
                <div className="flex flex-col items-center space-y-2 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-sm ring-4 ring-blue-100 dark:ring-blue-900/50">
                    4
                  </div>
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Valuation</span>
                </div>

                {/* Line 4-5 */}
                <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 -mt-6 mx-2"></div>

                {/* Step 5 */}
                <div className="flex flex-col items-center space-y-2 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center text-sm font-bold border border-slate-200 dark:border-slate-800">
                    5
                  </div>
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Payment</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Current Statutory Action: <strong className="text-blue-700 dark:text-blue-400">{priorityProject.currentStage}</strong>
              </span>
              <button
                onClick={() => navigate('/officer/projects/:id', { id: priorityProject.id })}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>View Corridor Dossier</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Recent Land Parcels Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Recent Land Parcels</h3>
              <button
                onClick={() => navigate('/officer/land-parcels')}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-sm">
                  <tr>
                    <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Parcel ID</th>
                    <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Owner Name</th>
                    <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Area</th>
                    <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Documents</th>
                    <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {recentParcels.map(p => (
                    <tr
                      key={p.id}
                      onClick={() => navigate('/officer/land-parcels/:id', { id: p.id })}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3 font-mono text-blue-700 dark:text-blue-400">{p.id}</td>
                      <td className="px-5 py-3">
                        <span className="font-medium text-slate-800 dark:text-slate-200 block">{p.ownerName}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Kh: {p.khasraNumber}</span>
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{p.areaAcres} Acres</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${p.status === 'Acquired' || p.status === 'Compensation Pending'
                            ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30'
                            : 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30'
                          }`}>
                          {p.status === 'Acquired' || p.status === 'Compensation Pending' ? 'Verified' : 'Pending OCR'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${p.status === 'Acquired' ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' :
                            p.status === 'Disputed' ? 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30' :
                              p.status === 'Compensation Pending' ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
                          }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Col 3: Side Widgets (GIS Map Preview + Risk Alert) */}
        <div className="space-y-6">
          {/* GIS Parcel Map Mini Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">GIS Parcel Map</h3>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Live Reference</span>
            </div>

            <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg border-2 border-slate-200 dark:border-slate-800 relative overflow-hidden flex items-center justify-center">
              {/* Cadastral Grid background */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}
              ></div>

              {/* Vector Polygon mock shapes */}
              <div className="absolute top-1/4 left-1/4 w-16 h-12 bg-green-500/50 border border-green-600 rounded flex items-center justify-center text-[8px] font-bold text-green-900 shadow-xs">
                ACQ
              </div>
              <div className="absolute top-1/2 left-1/2 w-14 h-10 bg-amber-500/50 border border-amber-600 rounded flex items-center justify-center text-[8px] font-bold text-amber-900 shadow-xs">
                PEND
              </div>
              <div className="absolute top-1/3 left-1/2 w-14 h-8 bg-blue-500/50 border border-blue-600 rounded flex items-center justify-center text-[8px] font-bold text-blue-900 shadow-xs">
                VERF
              </div>

              {/* Floating Legend */}
              <div className="absolute bottom-3 right-3 bg-white dark:bg-slate-900/95 p-2 rounded text-[8px] font-bold uppercase shadow-sm border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed">
                Legend: <br />
                <span className="text-green-600">■</span> Acquired <br />
                <span className="text-amber-600">■</span> Progress <br />
                <span className="text-red-600">■</span> Disputed
              </div>
            </div>

            <button
              onClick={() => navigate('/officer/map')}
              className="w-full mt-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Full Map View
            </button>
          </div>

          {/* Intelligent Risk Alert Box */}
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-xl p-4 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="bg-red-500 p-1.5 rounded text-white shrink-0 shadow-xs">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-red-900 dark:text-red-400">SLA Risk Alert</h4>
                <p className="text-sm text-red-800/90 dark:text-red-300/90 mt-1 leading-relaxed">
                  <strong>PRJ-004 Industrial Corridor</strong> is currently at <span className="font-semibold underline">CRITICAL</span> risk level. Delay in Valuation stage is exceeding 14 days statutory SLA baseline.
                </p>
                <button
                  onClick={() => navigate('/officer/risk-monitor')}
                  className="mt-3 text-sm font-medium text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 cursor-pointer flex items-center space-x-1"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: All Priority Strategic Acquisition Corridors */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-base">
              Strategic Acquisition Corridors ({projects.length})
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Live statutory progress, allocated budgets and parcel breakdown</p>
          </div>

          <button
            onClick={() => navigate('/officer/projects')}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center space-x-1 cursor-pointer"
          >
            <span>View All Projects</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white dark:bg-slate-900 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-5">Project Name</th>
                <th className="py-3 px-5">Department</th>
                <th className="py-3 px-5">Location</th>
                <th className="py-3 px-5">Acquired / Total</th>
                <th className="py-3 px-5">Progress</th>
                <th className="py-3 px-5">Stage</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {projects.map(proj => (
                <tr key={proj.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                  <td className="py-4 px-5">
                    <div
                      onClick={() => navigate('/officer/projects/:id', { id: proj.id })}
                      className="font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer flex flex-col"
                    >
                      <span>{proj.name}</span>
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">{proj.id}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-slate-600 dark:text-slate-300">{proj.department}</td>
                  <td className="py-4 px-5 text-slate-600 dark:text-slate-400">{proj.district}</td>
                  <td className="py-4 px-5 text-slate-700 dark:text-slate-300">
                    {proj.acquiredAreaAcres} / {proj.totalAreaAcres} Acres
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${proj.progressPercentage >= 80 ? 'bg-emerald-500' :
                              proj.progressPercentage >= 50 ? 'bg-blue-500' : 'bg-amber-400'
                            }`}
                          style={{ width: `${proj.progressPercentage}%` }}
                        ></div>
                      </div>
                      <span className="font-medium text-slate-700 dark:text-slate-300 text-xs">{proj.progressPercentage}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {proj.currentStage}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-md ${proj.status === 'Completed' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                        proj.status === 'Near Completion' ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400' :
                          proj.status === 'Delayed' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                            'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      }`}>
                      {proj.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => navigate('/officer/projects/:id', { id: proj.id })}
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

