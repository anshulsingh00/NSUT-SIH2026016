import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Project, ProjectStatus, GovernanceRules, ProjectStage } from '../../types';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  SlidersHorizontal, 
  Layers, 
  Building2, 
  UserCheck, 
  Calendar, 
  TrendingUp, 
  FileText, 
  X, 
  Eye, 
  ChevronRight, 
  History, 
  CheckCircle, 
  AlertOctagon, 
  FileSpreadsheet, 
  Download,
  IndianRupee,
  MapPin,
  Sparkles
} from 'lucide-react';

export const ProjectGovernance: React.FC = () => {
  const { 
    currentUser, 
    projects, 
    departments, 
    users, 
    addProject, 
    updateProject, 
    deleteProject, 
    addProjectActivityLog, 
    showToast, 
    navigate 
  } = useApp();

  // Authentication check: Admin only
  React.useEffect(() => {
    if (!currentUser || currentUser.role !== 'ADMIN') {
      showToast('Restricted Access', 'Administrator credentials required to access Project Governance.', 'warning');
      navigate('/login');
    }
  }, [currentUser, navigate, showToast]);

  // UI Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedOfficer, setSelectedOfficer] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'LIST' | 'GOVERNANCE_RULES'>('LIST');

  // Governance Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Activity Log Drawer state
  const [isActivityLogOpen, setIsActivityLogOpen] = useState(false);
  const [activeProjectLogs, setActiveProjectLogs] = useState<Project | null>(null);

  // New Project Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form states for Governance Edit
  const [formName, setFormName] = useState('');
  const [formDept, setFormDept] = useState('');
  const [formStatus, setFormStatus] = useState<ProjectStatus>('Active');
  const [formAssignedOfficer, setFormAssignedOfficer] = useState('');
  const [formResponsibleTeam, setFormResponsibleTeam] = useState('');
  const [formObjectives, setFormObjectives] = useState('');
  const [formScope, setFormScope] = useState('');
  const [formProgress, setFormProgress] = useState(0);
  const [formBudgetCr, setFormBudgetCr] = useState(0);
  const [formExpectedCompletion, setFormExpectedCompletion] = useState('');
  const [formApprovalLevel, setFormApprovalLevel] = useState<'DISTRICT_COLLECTOR' | 'STATE_SECRETARY' | 'CABINET_COMMITTEE'>('DISTRICT_COLLECTOR');
  const [formAuditStrictness, setFormAuditStrictness] = useState<'STANDARD' | 'ELEVATED' | 'HIGH_VIGILANCE'>('STANDARD');
  const [formEscalationDays, setFormEscalationDays] = useState(15);
  const [formAutoEscalation, setFormAutoEscalation] = useState(true);

  // Officers List
  const officerUsers = users.filter(u => u.role === 'OFFICER');

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      // Dept filter
      if (selectedDept !== 'ALL') {
        if (!p.department.toLowerCase().includes(selectedDept.toLowerCase())) return false;
      }

      // Status filter
      if (selectedStatus !== 'ALL') {
        if (p.status.toLowerCase() !== selectedStatus.toLowerCase()) return false;
      }

      // Officer filter
      if (selectedOfficer !== 'ALL') {
        const assigned = p.assignedOfficer || '';
        if (!assigned.toLowerCase().includes(selectedOfficer.toLowerCase())) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          p.id.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q) ||
          (p.assignedOfficer && p.assignedOfficer.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [projects, selectedDept, selectedStatus, selectedOfficer, searchQuery]);

  // Metric summaries
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'Active' || p.status === 'In Progress').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const delayedProjects = projects.filter(p => p.status === 'Delayed' || p.delayRisk === 'CRITICAL' || p.delayRisk === 'HIGH').length;
  const onHoldProjects = projects.filter(p => p.status === 'On Hold' || p.status === 'Draft').length;

  const handleOpenGovernanceModal = (proj: Project) => {
    setSelectedProject(proj);
    setFormName(proj.name);
    setFormDept(proj.department);
    setFormStatus(proj.status);
    setFormAssignedOfficer(proj.assignedOfficer || 'P.K. Malhotra, GM (Tech)');
    setFormResponsibleTeam(proj.responsibleTeam || 'North Delhi NCR Acquisition Cell');
    setFormObjectives(proj.objectives || `Expand multimodal arterial corridor, eliminate traffic bottlenecks, and facilitate RFCTLARR 2013 compliant rehabilitation.`);
    setFormScope(proj.scope || `${proj.totalAreaAcres} Acres land acquisition across ${proj.villages?.join(', ') || 'rural hinterland'}.`);
    setFormProgress(proj.progressPercentage);
    setFormBudgetCr(proj.estimatedBudgetCr);
    setFormExpectedCompletion(proj.expectedCompletionDate);
    setFormApprovalLevel(proj.governanceRules?.approvalLevelRequired || 'DISTRICT_COLLECTOR');
    setFormAuditStrictness(proj.governanceRules?.auditStrictness || 'ELEVATED');
    setFormEscalationDays(proj.governanceRules?.escalationThresholdDays || 15);
    setFormAutoEscalation(proj.governanceRules?.autoDisputeEscalation ?? true);
    setIsEditModalOpen(true);
  };

  const handleSaveGovernance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    const governanceRules: GovernanceRules = {
      approvalLevelRequired: formApprovalLevel,
      solatiumPolicy: '100% Solatium (Sec 30) + 12% Per Annum Additional Compensation (Sec 30(3))',
      escalationThresholdDays: Number(formEscalationDays) || 15,
      auditStrictness: formAuditStrictness,
      autoDisputeEscalation: formAutoEscalation
    };

    updateProject(selectedProject.id, {
      name: formName.trim(),
      department: formDept.trim(),
      status: formStatus,
      assignedOfficer: formAssignedOfficer.trim(),
      responsibleTeam: formResponsibleTeam.trim(),
      objectives: formObjectives.trim(),
      scope: formScope.trim(),
      progressPercentage: Number(formProgress),
      estimatedBudgetCr: Number(formBudgetCr),
      expectedCompletionDate: formExpectedCompletion,
      governanceRules
    });

    addProjectActivityLog(
      selectedProject.id,
      'Governance Protocol Updated',
      `Admin updated governance parameters: Approval [${formApprovalLevel}], Strictness [${formAuditStrictness}], Status [${formStatus}].`
    );

    showToast('Governance Saved', `Updated project governance rules for ${selectedProject.name}.`, 'success');
    setIsEditModalOpen(false);
  };

  const handleOpenActivityLogs = (proj: Project) => {
    setActiveProjectLogs(proj);
    setIsActivityLogOpen(true);
  };

  const handleExportCSV = () => {
    const headers = 'Project ID,Name,Department,Status,Progress %,Budget Cr,Disbursed Cr,Assigned Officer,Target Completion,Approval Level\n';
    const rows = filteredProjects.map(p => 
      `"${p.id}","${p.name}","${p.department}","${p.status}",${p.progressPercentage},${p.estimatedBudgetCr},${p.disbursedCompensationCr},"${p.assignedOfficer || 'SLAO'}",${p.expectedCompletionDate},"${p.governanceRules?.approvalLevelRequired || 'COLLECTOR'}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bhoomisetu_project_governance_${Date.now()}.csv`;
    a.click();
    showToast('Export Successful', `Exported ${filteredProjects.length} project governance records to CSV.`, 'success');
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Banner */}
      <div className="bg-[#0c2340] text-white p-6 sm:p-8 rounded-2xl shadow-md border border-blue-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-blue-800 text-amber-300 text-xs font-bold uppercase mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Apex Statutory Oversight</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-sans flex items-center space-x-3">
            <FolderKanban className="w-7 h-7 text-amber-400" />
            <span>National Project Governance & Milestone Controls</span>
          </h1>
          <p className="text-xs sm:text-sm text-blue-200 mt-1">
            Standardized lifecycle management, inter-departmental assignments, statutory governance rules, and audit logging.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-blue-900/80 hover:bg-blue-800 text-white border border-blue-700 font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Governance Dossier</span>
          </button>

          <button
            onClick={() => navigate('/officer/projects/create')}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Instantiate New Project</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Monitored Corridors
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2 font-mono">{totalProjects}</div>
          <div className="text-[11px] text-slate-400 mt-1">Nationwide Infrastructure Portfolios</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Active / In Progress
          </div>
          <div className="text-3xl font-black text-emerald-950 mt-2 font-mono">{activeProjects}</div>
          <div className="text-[11px] text-emerald-700 mt-1">Joint surveys & Section 23 awards</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-blue-200/80 bg-blue-50/20 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-800">
            Completed & Disbursed
          </div>
          <div className="text-3xl font-black text-blue-950 mt-2 font-mono">{completedProjects}</div>
          <div className="text-[11px] text-blue-700 mt-1">100% PFMS settlements verified</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-red-200/80 bg-red-50/20 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-red-800">
            Delayed / SLA Breaches
          </div>
          <div className="text-3xl font-black text-red-950 mt-2 font-mono">{delayedProjects}</div>
          <div className="text-[11px] text-red-700 mt-1">Requiring Collector intervention</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-900">
            On Hold / Draft
          </div>
          <div className="text-3xl font-black text-amber-950 mt-2 font-mono">{onHoldProjects}</div>
          <div className="text-[11px] text-amber-700 mt-1">Pending Gazette Sec 4 sanction</div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Keyword Search */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1">
              Search Corridors
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ID, Title, District, Officer..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1">
              Executing Authority
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-800 dark:text-slate-200 font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="ALL">All Departments (National Scope)</option>
              {departments.map(d => (
                <option key={d.id} value={d.code}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1">
              Project Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-800 dark:text-slate-200 font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="ALL">All Project Statuses</option>
              <option value="Active">Active</option>
              <option value="In Progress">In Progress</option>
              <option value="Planning">Planning</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
              <option value="Delayed">Delayed</option>
            </select>
          </div>

          {/* Assigned Officer Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1">
              Responsible SLAO
            </label>
            <select
              value={selectedOfficer}
              onChange={(e) => setSelectedOfficer(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-800 dark:text-slate-200 font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="ALL">All Assigned Officers</option>
              {officerUsers.map(u => (
                <option key={u.id} value={u.name}>{u.name} ({u.designation || 'SLAO'})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset Filter Button */}
        {(selectedDept !== 'ALL' || selectedStatus !== 'ALL' || selectedOfficer !== 'ALL' || searchQuery) && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Filtering {filteredProjects.length} of {projects.length} corridors</span>
            <button
              onClick={() => {
                setSelectedDept('ALL');
                setSelectedStatus('ALL');
                setSelectedOfficer('ALL');
                setSearchQuery('');
              }}
              className="text-[11px] text-red-600 hover:text-red-700 font-bold underline cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Project Governance Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <FolderKanban className="w-4.5 h-4.5 text-blue-800" />
              <span>Project Governance Ledger ({filteredProjects.length})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct statutory configuration, milestone progress tracking, and escalation oversight.
            </p>
          </div>

          <div className="text-xs text-slate-400">
            Showing <strong>{filteredProjects.length}</strong> entries
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3.5 px-4">Project ID</th>
                <th className="py-3.5 px-4">Corridor & Mandate</th>
                <th className="py-3.5 px-4">Department & Officer</th>
                <th className="py-3.5 px-4">Acquisition Progress</th>
                <th className="py-3.5 px-4">Capital Outlay</th>
                <th className="py-3.5 px-4">Governance Level</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 italic">
                    No infrastructure corridors match your active filters.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((proj) => {
                  const statusColors = 
                    proj.status === 'Completed' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                    proj.status === 'In Progress' || proj.status === 'Active' ? 'bg-blue-100 text-blue-900 border-blue-300' :
                    proj.status === 'Delayed' ? 'bg-red-100 text-red-900 border-red-300' :
                    proj.status === 'On Hold' ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600';

                  return (
                    <tr key={proj.id} className="hover:bg-slate-50 dark:bg-slate-800/70 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold">
                        <span className="text-blue-950 font-bold">{proj.id}</span>
                        <span className="block text-[10px] font-normal text-slate-400 mt-0.5">{proj.projectType}</span>
                      </td>

                      <td className="py-4 px-4 max-w-[240px]">
                        <div className="font-bold text-slate-900 dark:text-white text-xs">{proj.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {proj.objectives || proj.description}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center space-x-1 mt-1 font-medium">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{proj.district}, {proj.state} ({proj.villages?.length || 4} Villages)</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 max-w-[200px]">
                        <div className="font-semibold text-slate-900 dark:text-white truncate">{proj.department}</div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center space-x-1 mt-0.5">
                          <UserCheck className="w-3 h-3 text-blue-600 shrink-0" />
                          <span className="truncate">{proj.assignedOfficer || 'Special Land Acquisition Officer'}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 min-w-[140px]">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                          <span>{proj.progressPercentage}%</span>
                          <span className="text-slate-400 font-normal">{proj.acquiredAreaAcres}/{proj.totalAreaAcres} Ac</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div 
                            className={`h-full ${
                              proj.progressPercentage >= 80 ? 'bg-emerald-600' :
                              proj.progressPercentage >= 50 ? 'bg-blue-600' : 'bg-amber-500'
                            }`}
                            style={{ width: `${proj.progressPercentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block truncate">
                          Stage: {proj.currentStage}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-mono">
                        <div className="font-bold text-slate-900 dark:text-white">₹{proj.estimatedBudgetCr} Cr</div>
                        <div className="text-[10px] text-emerald-700 font-semibold">
                          ₹{proj.disbursedCompensationCr} Cr Paid
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-block px-2 py-0.5 rounded bg-purple-50 text-purple-900 border border-purple-200 text-[10px] font-bold font-mono">
                          {proj.governanceRules?.approvalLevelRequired || 'DISTRICT_COLLECTOR'}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Audit: {proj.governanceRules?.auditStrictness || 'ELEVATED'}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColors}`}>
                          <span>{proj.status}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Activity History Button */}
                          <button
                            type="button"
                            title="View Governance History"
                            onClick={() => handleOpenActivityLogs(proj)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          {/* Manage Governance Button */}
                          <button
                            type="button"
                            title="Manage Project Governance"
                            onClick={() => handleOpenGovernanceModal(proj)}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer font-bold text-[11px] inline-flex items-center space-x-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Govern</span>
                          </button>

                          {/* Delete Project */}
                          <button
                            type="button"
                            title="Delete Project Record"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete project ${proj.name}?`)) {
                                deleteProject(proj.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Governance Rules & Parameter Edit Modal */}
      {isEditModalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-8">
            <div className="bg-[#0c2340] text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">
                  Project Governance & Statutory Controls: {selectedProject.name}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGovernance} className="p-6 space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Project Corridor Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Implementing Department
                  </label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status & Officer Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Project Lifecycle Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ProjectStatus)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
                  >
                    <option value="Active">Active (In Execution)</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Planning">Planning</option>
                    <option value="On Hold">On Hold (Pending Resolution)</option>
                    <option value="Completed">Completed & Handed Over</option>
                    <option value="Draft">Draft (Gazette Pending)</option>
                    <option value="Archived">Archived</option>
                    <option value="Delayed">Delayed (SLA Escalated)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Assigned Nodal SLAO Officer
                  </label>
                  <input
                    type="text"
                    value={formAssignedOfficer}
                    onChange={(e) => setFormAssignedOfficer(e.target.value)}
                    placeholder="e.g. S.K. Rathore, SLAO"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    value={formExpectedCompletion}
                    onChange={(e) => setFormExpectedCompletion(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Objectives & Scope */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Strategic Project Objectives
                  </label>
                  <textarea
                    rows={2}
                    value={formObjectives}
                    onChange={(e) => setFormObjectives(e.target.value)}
                    placeholder="Objectives, arterial connectivity goals..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Acquisition Scope & Cadastral Coverage
                  </label>
                  <textarea
                    rows={2}
                    value={formScope}
                    onChange={(e) => setFormScope(e.target.value)}
                    placeholder="Total villages, hectarage, and survey demarcations..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Governance & Statutory Controls Section */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-3">
                <div className="font-bold text-blue-950 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span>Statutory Compliance & Governance Policy Rules</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-blue-900 uppercase tracking-wider mb-1">
                      Required Approval Authority
                    </label>
                    <select
                      value={formApprovalLevel}
                      onChange={(e) => setFormApprovalLevel(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-blue-300 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-hidden cursor-pointer"
                    >
                      <option value="DISTRICT_COLLECTOR">District Collector / DM</option>
                      <option value="STATE_SECRETARY">Principal Secretary (Revenue)</option>
                      <option value="CABINET_COMMITTEE">Cabinet Committee on Infrastructure</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-blue-900 uppercase tracking-wider mb-1">
                      Statutory Audit Strictness
                    </label>
                    <select
                      value={formAuditStrictness}
                      onChange={(e) => setFormAuditStrictness(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-blue-300 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-hidden cursor-pointer"
                    >
                      <option value="STANDARD">Standard RFCTLARR 2013</option>
                      <option value="ELEVATED">Elevated Vigilance & Biometrics</option>
                      <option value="HIGH_VIGILANCE">High Vigilance (Apex CAG Tracking)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-blue-900 uppercase tracking-wider mb-1">
                      Escalation Threshold (Days)
                    </label>
                    <input
                      type="number"
                      value={formEscalationDays}
                      onChange={(e) => setFormEscalationDays(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-blue-300 rounded-xl font-mono text-slate-900 dark:text-white focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold shadow-md cursor-pointer"
                >
                  Save Governance Policies
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity / Audit History Drawer */}
      {isActivityLogOpen && activeProjectLogs && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-end p-0">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg h-full shadow-2xl border-l border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div className="bg-[#0c2340] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center space-x-2">
                  <History className="w-5 h-5 text-amber-400" />
                  <span>Project Governance Activity Trail</span>
                </h3>
                <p className="text-xs text-blue-200 mt-0.5 font-mono">{activeProjectLogs.id} • {activeProjectLogs.name}</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsActivityLogOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                <strong>Statutory Traceability:</strong> Every parameter change, officer assignment, and milestone transition is cryptographically logged for CAG and High Court audit.
              </div>

              {(!activeProjectLogs.activityHistory || activeProjectLogs.activityHistory.length === 0) ? (
                <div className="space-y-3">
                  {/* Default mock activity logs */}
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span>Project Initialized & Sanctioned</span>
                      <span className="text-[10px] text-slate-400 font-mono">14-Jan-2025</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Gazette Section 4 Preliminary Notification published. Assigned to NHAI Nodal Unit.</div>
                    <div className="text-[10px] text-blue-700 font-semibold">User: Cabinet Secretary (Admin)</div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span>Valuation Model Approved</span>
                      <span className="text-[10px] text-slate-400 font-mono">22-Feb-2025</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">100% Solatium multiplier verified under Section 30(1) RFCTLARR Act.</div>
                    <div className="text-[10px] text-blue-700 font-semibold">User: P.K. Malhotra (SLAO)</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeProjectLogs.activityHistory.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-1 hover:border-blue-300 transition-all">
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                        <span>{item.action}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{item.timestamp}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400">{item.details}</div>
                      <div className="text-[10px] text-blue-800 font-bold">{item.user}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setIsActivityLogOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 transition-colors cursor-pointer"
              >
                Close Activity Trail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
