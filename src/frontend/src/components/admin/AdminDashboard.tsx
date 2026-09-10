import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  FolderKanban, 
  IndianRupee, 
  MapPin, 
  ShieldCheck, 
  Users, 
  AlertOctagon, 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp,
  FileSpreadsheet,
  Download,
  FileClock,
  Settings,
  LayoutDashboard
} from 'lucide-react';
import { DepartmentMaster } from './DepartmentMaster';
import { ProjectGovernance } from './ProjectGovernance';
import { SlaManagement } from './SlaManagement';
import { SystemSettings } from './SystemSettings';

type AdminTab = 'OVERVIEW' | 'DEPARTMENTS' | 'PROJECTS' | 'AUDIT' | 'SLA' | 'SETTINGS';

const AdminTabBar: React.FC<{ activeTab: AdminTab; setActiveTab: (t: AdminTab) => void }> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-2 mb-6 transition-colors">
      <button
        onClick={() => setActiveTab('OVERVIEW')}
        className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-2 ${
          activeTab === 'OVERVIEW' ? 'bg-blue-900 dark:bg-blue-800 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white dark:hover:text-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-800'
        }`}
      >
        <LayoutDashboard className={`w-4 h-4 ${activeTab === 'OVERVIEW' ? 'text-amber-400' : ''}`} />
        <span>Executive Overview</span>
      </button>

      <button
        onClick={() => setActiveTab('DEPARTMENTS')}
        className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-2 ${
          activeTab === 'DEPARTMENTS' ? 'bg-blue-900 dark:bg-blue-800 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white dark:hover:text-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-800'
        }`}
      >
        <Building2 className={`w-4 h-4 ${activeTab === 'DEPARTMENTS' ? 'text-amber-400' : 'text-blue-700'}`} />
        <span>Department Master</span>
      </button>

      <button
        onClick={() => setActiveTab('PROJECTS')}
        className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-2 ${
          activeTab === 'PROJECTS' ? 'bg-blue-900 dark:bg-blue-800 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white dark:hover:text-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-800'
        }`}
      >
        <FolderKanban className={`w-4 h-4 ${activeTab === 'PROJECTS' ? 'text-amber-400' : 'text-purple-700'}`} />
        <span>Project Governance</span>
      </button>

      <button
        onClick={() => setActiveTab('SLA')}
        className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-2 ${
          activeTab === 'SLA' ? 'bg-blue-900 dark:bg-blue-800 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white dark:hover:text-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-800'
        }`}
      >
        <AlertOctagon className={`w-4 h-4 ${activeTab === 'SLA' ? 'text-amber-400' : 'text-red-600'}`} />
        <span>SLA Management</span>
      </button>

      <button
        onClick={() => setActiveTab('SETTINGS')}
        className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-2 ${
          activeTab === 'SETTINGS' ? 'bg-blue-900 dark:bg-blue-800 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white dark:hover:text-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-800'
        }`}
      >
        <Settings className={`w-4 h-4 ${activeTab === 'SETTINGS' ? 'text-amber-400' : 'text-slate-700 dark:text-slate-300'}`} />
        <span>System Settings</span>
      </button>

      <button
        onClick={() => setActiveTab('AUDIT')}
        className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-2 ${
          activeTab === 'AUDIT' ? 'bg-blue-900 dark:bg-blue-800 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white dark:hover:text-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-800'
        }`}
      >
        <FileClock className={`w-4 h-4 ${activeTab === 'AUDIT' ? 'text-amber-400' : 'text-emerald-700'}`} />
        <span>Statutory Audit Trail</span>
      </button>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const { currentUser, projects, parcels, auditLogs, riskAlerts, departments, navigate, showToast } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('OVERVIEW');

  // Authentication Protection Guard: Admin Only
  React.useEffect(() => {
    if (!currentUser || currentUser.role !== 'ADMIN') {
      showToast('Admin Only Access', 'Please sign in with administrator credentials.', 'warning');
      navigate('/login');
    }
  }, [currentUser, navigate, showToast]);

  const handleExportNationalReport = () => {
    showToast(
      'Exporting National Audit Report',
      'Ministry Executive Summary for FY 2025-26 compiled and downloaded.',
      'success'
    );
  };

  if (!currentUser) return null;

  if (activeAdminTab === 'DEPARTMENTS') {
    return (
      <div className="space-y-6">
        <AdminTabBar activeTab={activeAdminTab} setActiveTab={setActiveAdminTab} />

        <DepartmentMaster />
      </div>
    );
  }

  if (activeAdminTab === 'PROJECTS') {
    return (
      <div className="space-y-6">
        <AdminTabBar activeTab={activeAdminTab} setActiveTab={setActiveAdminTab} />

        <ProjectGovernance />
      </div>
    );
  }

  if (activeAdminTab === 'SLA') {
    return (
      <div className="space-y-6">
        <AdminTabBar activeTab={activeAdminTab} setActiveTab={setActiveAdminTab} />
        <SlaManagement />
      </div>
    );
  }

  if (activeAdminTab === 'SETTINGS') {
    return (
      <div className="space-y-6">
        <AdminTabBar activeTab={activeAdminTab} setActiveTab={setActiveAdminTab} />
        <SystemSettings />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans">
      <AdminTabBar activeTab={activeAdminTab} setActiveTab={setActiveAdminTab} />

      {/* Executive Header */}
      <div className="bg-[#0c2340] text-white p-6 sm:p-8 rounded-2xl shadow-md border border-blue-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-blue-800 text-amber-300 text-xs font-bold uppercase mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ministry & Apex Administrative Oversight</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-sans">
            National Land Acquisition Executive Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-blue-200 mt-1">
            Real-time cross-department monitoring, capital allocation, and statutory compliance audit.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleExportNationalReport}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Ministry Audit Dossier</span>
          </button>
        </div>
      </div>

      {/* Top 4 Macro Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveAdminTab('PROJECTS')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>Total Infrastructure Projects</span>
            <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2 font-mono">{projects.length}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {projects.filter(p => p.status === 'Active' || p.status === 'In Progress').length} Active • {projects.filter(p => p.status === 'Completed').length} Completed
          </div>
        </div>

        <div 
          onClick={() => navigate('/officer/land-parcels')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-400">
            <span>Total Cadastral Parcels</span>
            <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
          </div>
          <div className="text-3xl font-black text-blue-900 dark:text-blue-400 mt-2 font-mono">{parcels.length.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
            {parcels.filter(p => p.status === 'Acquired').length} Fully Acquired
          </div>
        </div>

        <div 
          onClick={() => navigate('/officer/compensation')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-400 dark:hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
            <span>PFMS Compensation Disbursed</span>
            <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
          </div>
          <div className="text-3xl font-black text-emerald-700 dark:text-emerald-400 mt-2 font-mono">₹14,820 Cr</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">52.2% of ₹28,400 Cr Sanctioned</div>
        </div>

        <div 
          onClick={() => navigate('/officer/risk-monitor')}
          className="bg-red-50/30 dark:bg-red-900/10 p-5 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-xs hover:border-red-400 dark:hover:border-red-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-red-800 dark:text-red-400">
            <span>Active SLA Delay Bottlenecks</span>
            <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 dark:text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
          </div>
          <div className="text-3xl font-black text-red-700 dark:text-red-400 mt-2 font-mono">
            {riskAlerts.filter(r => r.status === 'ACTIVE').length}
          </div>
          <div className="text-[11px] text-red-600 dark:text-red-400 font-semibold mt-1">Requiring inter-ministerial resolution</div>
        </div>
      </div>

      {/* Department Performance Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4 transition-colors">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-blue-800 dark:text-blue-500" />
            <span>Executing Agency Performance & Budget Utilization ({departments.length} Authorities)</span>
          </h2>
          <button
            onClick={() => setActiveAdminTab('DEPARTMENTS')}
            className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>Manage Departments in Master</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-4">
          {departments.map(dept => {
            const linkedProjs = projects.filter(p => p.department.toLowerCase().includes(dept.name.toLowerCase()) || p.department.toLowerCase().includes(dept.code.toLowerCase()));
            const linkedCount = linkedProjs.length || dept.activeProjectsCount;
            const progress = dept.allocatedBudgetCr > 5000 ? 74 : dept.allocatedBudgetCr > 3000 ? 61 : 88;

            return (
              <div key={dept.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 dark:text-white">{dept.name}</span>
                    <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-bold px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-700">
                      {dept.code}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-600 dark:text-slate-400">
                    {linkedCount} Corridors • ₹{(dept.allocatedBudgetCr || 1000).toLocaleString('en-IN')} Cr Sanctioned • Nodal: {dept.nodalOfficer}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        progress >= 80 ? 'bg-emerald-600' :
                        progress >= 60 ? 'bg-blue-600' : 'bg-amber-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white w-12 text-right">{progress}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Immutable Platform Audit Trail */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <FileClock className="w-5 h-5 text-emerald-700 dark:text-emerald-500" />
              <span>Immutable Statutory Audit Trail ({auditLogs.length} Events Logged)</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Sec 12 Compliant Digital Signature Record</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Log ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-blue-900 dark:text-blue-400">{log.id}</td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{log.timestamp}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    {log.user}
                    <span className="text-[10px] text-slate-400 block font-normal">({log.role})</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-300">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                    {log.entityType}: {log.entityId}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-[340px] truncate" title={log.details}>
                    {log.details}
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
