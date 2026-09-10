import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DepartmentInfo, DepartmentStatus } from '../../types';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Power, 
  PowerOff, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  IndianRupee, 
  FolderKanban, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Filter, 
  UserCheck, 
  FileSpreadsheet,
  Download,
  HelpCircle,
  TrendingUp,
  Layers
} from 'lucide-react';

export const DepartmentMaster: React.FC = () => {
  const { 
    currentUser, 
    departments, 
    projects, 
    users, 
    addDepartment, 
    updateDepartment, 
    deleteDepartment, 
    toggleDepartmentStatus, 
    showToast, 
    navigate 
  } = useApp();

  // Authentication check: Admin only
  React.useEffect(() => {
    if (!currentUser || currentUser.role !== 'ADMIN') {
      showToast('Restricted Access', 'Administrator credentials required to manage Department Master.', 'warning');
      navigate('/login');
    }
  }, [currentUser, navigate, showToast]);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [sortBy, setSortBy] = useState<'NAME' | 'PROJECTS' | 'BUDGET'>('NAME');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  
  // Confirm Delete Dialog state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formHeadName, setFormHeadName] = useState('');
  const [formHeadDesignation, setFormHeadDesignation] = useState('');
  const [formNodalOfficer, setFormNodalOfficer] = useState('');
  const [formContactEmail, setFormContactEmail] = useState('');
  const [formContactPhone, setFormContactPhone] = useState('');
  const [formBudgetCr, setFormBudgetCr] = useState<number>(1000);
  const [formOfficeAddress, setFormOfficeAddress] = useState('');
  const [formStatus, setFormStatus] = useState<DepartmentStatus>('ACTIVE');

  // Filtered & Sorted Departments
  const filteredDepartments = useMemo(() => {
    return departments.filter(dept => {
      // Status filter
      if (statusFilter !== 'ALL') {
        const currentStatus = dept.status || 'ACTIVE';
        if (currentStatus !== statusFilter) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          dept.name.toLowerCase().includes(q) ||
          dept.code.toLowerCase().includes(q) ||
          dept.headName.toLowerCase().includes(q) ||
          dept.nodalOfficer.toLowerCase().includes(q) ||
          dept.contactEmail.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'NAME') return a.name.localeCompare(b.name);
      if (sortBy === 'PROJECTS') return (b.activeProjectsCount || 0) - (a.activeProjectsCount || 0);
      if (sortBy === 'BUDGET') return (b.allocatedBudgetCr || 0) - (a.allocatedBudgetCr || 0);
      return 0;
    });
  }, [departments, statusFilter, searchQuery, sortBy]);

  // Summary Metrics
  const totalDepartments = departments.length;
  const activeDepartments = departments.filter(d => (d.status || 'ACTIVE') === 'ACTIVE').length;
  const inactiveDepartments = totalDepartments - activeDepartments;
  const totalAllocatedBudgetCr = departments.reduce((acc, curr) => acc + (curr.allocatedBudgetCr || 0), 0);

  const handleOpenAddModal = () => {
    setEditingDeptId(null);
    setFormName('');
    setFormCode('');
    setFormDescription('');
    setFormHeadName('');
    setFormHeadDesignation('');
    setFormNodalOfficer('');
    setFormContactEmail('');
    setFormContactPhone('');
    setFormBudgetCr(2500);
    setFormOfficeAddress('New Delhi NCR Central Secretariat');
    setFormStatus('ACTIVE');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dept: DepartmentInfo) => {
    setEditingDeptId(dept.id);
    setFormName(dept.name);
    setFormCode(dept.code);
    setFormDescription(dept.description || '');
    setFormHeadName(dept.headName);
    setFormHeadDesignation(dept.headDesignation || 'Head of Department / Director');
    setFormNodalOfficer(dept.nodalOfficer);
    setFormContactEmail(dept.contactEmail);
    setFormContactPhone(dept.contactPhone || '+91 11 2309 2000');
    setFormBudgetCr(dept.allocatedBudgetCr || 1000);
    setFormOfficeAddress(dept.officeAddress || 'Central Secretariat, New Delhi');
    setFormStatus(dept.status || 'ACTIVE');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim() || !formCode.trim()) {
      showToast('Validation Error', 'Department Name and Department Code are mandatory fields.', 'warning');
      return;
    }

    if (editingDeptId) {
      // Update
      updateDepartment(editingDeptId, {
        name: formName.trim(),
        code: formCode.trim().toUpperCase(),
        description: formDescription.trim(),
        headName: formHeadName.trim(),
        headDesignation: formHeadDesignation.trim(),
        nodalOfficer: formNodalOfficer.trim(),
        contactEmail: formContactEmail.trim(),
        contactPhone: formContactPhone.trim(),
        allocatedBudgetCr: Number(formBudgetCr) || 0,
        officeAddress: formOfficeAddress.trim(),
        status: formStatus
      });
      setIsModalOpen(false);
    } else {
      // Add
      const createdId = addDepartment({
        name: formName.trim(),
        code: formCode.trim().toUpperCase(),
        description: formDescription.trim() || 'Central / State Executing Authority for Infrastructure Development.',
        headName: formHeadName.trim() || 'Competent Authority',
        headDesignation: formHeadDesignation.trim() || 'Director (Land Acquisition)',
        nodalOfficer: formNodalOfficer.trim() || 'Special Land Acquisition Officer (SLAO)',
        contactEmail: formContactEmail.trim() || `land.${formCode.toLowerCase()}@nic.in`,
        contactPhone: formContactPhone.trim() || '+91 11 2309 4000',
        activeProjectsCount: 0,
        totalAcquiredAcres: 0,
        allocatedBudgetCr: Number(formBudgetCr) || 1000,
        officeAddress: formOfficeAddress.trim() || 'Central Secretariat, New Delhi',
        status: formStatus
      });
      if (createdId) {
        setIsModalOpen(false);
      }
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmId) return;
    deleteDepartment(deleteConfirmId);
    setDeleteConfirmId(null);
  };

  const handleExportCSV = () => {
    const headers = 'Department ID,Code,Name,Status,Head of Dept,Nodal Officer,Active Corridors,Acquired Acres,Allocated Budget Cr,Email\n';
    const rows = filteredDepartments.map(d => 
      `"${d.id}","${d.code}","${d.name}","${d.status || 'ACTIVE'}","${d.headName}","${d.nodalOfficer}",${d.activeProjectsCount},${d.totalAcquiredAcres},${d.allocatedBudgetCr},"${d.contactEmail}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bhoomisetu_department_master_${Date.now()}.csv`;
    a.click();
    showToast('Export Successful', `Exported ${filteredDepartments.length} department records to CSV.`, 'success');
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Header */}
      <div className="bg-[#0c2340] text-white p-6 sm:p-8 rounded-2xl shadow-md border border-blue-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-blue-800 text-amber-300 text-xs font-bold uppercase mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Apex Administration & Master Data</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-sans flex items-center space-x-3">
            <Building2 className="w-7 h-7 text-amber-400" />
            <span>Department Master Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-blue-200 mt-1">
            Centralized registry of implementing authorities, executing ministries, nodal SLAO officers, and statutory capital allocations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-blue-900/80 hover:bg-blue-800 text-white border border-blue-700 font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Registry</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Department</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Registered Authorities
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2 font-mono">{totalDepartments}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">National & State Level Wings</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-900/10 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-500">
            Active Executing Bodies
          </div>
          <div className="text-3xl font-black text-emerald-950 dark:text-emerald-100 mt-2 font-mono">{activeDepartments}</div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-600 font-semibold mt-1">Authorized for Section 4-11 acquisition</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-blue-200/80 dark:border-blue-800/80 bg-blue-50/20 dark:bg-blue-900/10 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-500">
            Total Capital Allocation
          </div>
          <div className="text-3xl font-black text-blue-950 dark:text-blue-100 mt-2 font-mono">₹{totalAllocatedBudgetCr.toLocaleString('en-IN')} Cr</div>
          <div className="text-[11px] text-blue-700 dark:text-blue-600 mt-1">PFMS Direct Treasury Linked</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-500">
            Inactive / Decommissioned
          </div>
          <div className="text-3xl font-black text-slate-700 dark:text-slate-300 mt-2 font-mono">{inactiveDepartments}</div>
          <div className="text-[11px] text-slate-400 mt-1">Zero pending acquisition mandates</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Department Name, Code, Head, or Nodal Officer..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white dark:bg-slate-900 dark:focus:bg-slate-900 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-white dark:bg-slate-700 text-blue-900 dark:text-blue-300 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white dark:hover:text-slate-200'
                  }`}
                >
                  {st === 'ALL' ? 'All Status' : st === 'ACTIVE' ? 'Active Only' : 'Inactive'}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-hidden"
            >
              <option value="NAME">Sort by Name (A-Z)</option>
              <option value="PROJECTS">Sort by Active Corridors</option>
              <option value="BUDGET">Sort by Budget Allocation</option>
            </select>
          </div>
        </div>
      </div>

      {/* Department Master Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <Building2 className="w-4.5 h-4.5 text-blue-800 dark:text-blue-400" />
              <span>Registered Implementing Authorities ({filteredDepartments.length})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete administrative directory with nodal officer linkage and land acquisition sanction caps.
            </p>
          </div>

          <div className="text-xs text-slate-400">
            Showing <strong>{filteredDepartments.length}</strong> of {departments.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3.5 px-4">Code & Badge</th>
                <th className="py-3.5 px-4">Department & Mandate</th>
                <th className="py-3.5 px-4">Head of Department</th>
                <th className="py-3.5 px-4">Nodal SLAO & Contact</th>
                <th className="py-3.5 px-4">Corridors</th>
                <th className="py-3.5 px-4">Budget Sanction</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDepartments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 italic">
                    No departments match your filter criteria. Click "Add New Department" to register a new authority.
                  </td>
                </tr>
              ) : (
                filteredDepartments.map((dept) => {
                  const isActive = (dept.status || 'ACTIVE') === 'ACTIVE';
                  const linkedCount = projects.filter(p => p.department.toLowerCase().includes(dept.name.toLowerCase()) || p.department.toLowerCase().includes(dept.code.toLowerCase())).length;

                  return (
                    <tr key={dept.id} className="hover:bg-slate-50 dark:bg-slate-800/70 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold">
                        <span className="inline-block px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-300 text-xs border border-blue-200 dark:border-blue-800 font-mono">
                          {dept.code}
                        </span>
                      </td>

                      <td className="py-4 px-4 max-w-[260px]">
                        <div className="font-bold text-slate-900 dark:text-white text-xs">{dept.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {dept.description || 'Statutory Land Acquisition & Rehabilitation Authority.'}
                        </div>
                        {dept.officeAddress && (
                          <div className="text-[10px] text-slate-400 flex items-center space-x-1 mt-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{dept.officeAddress}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-200">{dept.headName}</div>
                        <div className="text-[10px] text-slate-400">{dept.headDesignation || 'Regional Director'}</div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-200 flex items-center space-x-1">
                          <UserCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-500" />
                          <span>{dept.nodalOfficer}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center space-x-1 mt-0.5">
                          <Mail className="w-2.5 h-2.5 text-slate-400" />
                          <span>{dept.contactEmail}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-900 dark:text-slate-200 font-mono">{linkedCount || dept.activeProjectsCount}</span>
                        <span className="text-[10px] text-slate-400 block">Corridors</span>
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-slate-900 dark:text-slate-200">
                        ₹{(dept.allocatedBudgetCr || 0).toLocaleString('en-IN')} Cr
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          isActive 
                            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400 dark:bg-slate-50 dark:bg-slate-8000'}`}></span>
                          <span>{isActive ? 'Active' : 'Inactive'}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Toggle Status Button */}
                          <button
                            type="button"
                            title={isActive ? 'Deactivate Department' : 'Activate Department'}
                            onClick={() => toggleDepartmentStatus(dept.id)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isActive 
                                ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/40' 
                                : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-500 border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                            }`}
                          >
                            {isActive ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            title="Edit Department Master"
                            onClick={() => handleOpenEditModal(dept)}
                            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            title="Delete Department"
                            onClick={() => setDeleteConfirmId(dept.id)}
                            className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors cursor-pointer"
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

      {/* Add / Edit Department Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="bg-[#0c2340] dark:bg-slate-950 text-white p-5 flex items-center justify-between border-b border-slate-800/50">
              <div className="flex items-center space-x-2.5">
                <Building2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">
                  {editingDeptId ? 'Edit Department Master Record' : 'Register New Implementing Authority'}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Department Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. National Highways Authority of India (NHAI)"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white dark:bg-slate-900 dark:focus:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Department Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="e.g. NHAI-HQ"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white dark:bg-slate-900 dark:focus:bg-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Statutory Mandate & Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe scope, jurisdiction, and project categories..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white dark:bg-slate-900 dark:focus:bg-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Head of Department Name
                  </label>
                  <input
                    type="text"
                    value={formHeadName}
                    onChange={(e) => setFormHeadName(e.target.value)}
                    placeholder="e.g. Shri Arvind Swarup"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white dark:bg-slate-900 dark:focus:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Head Designation
                  </label>
                  <input
                    type="text"
                    value={formHeadDesignation}
                    onChange={(e) => setFormHeadDesignation(e.target.value)}
                    placeholder="e.g. Chief Engineer / Regional Officer"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white dark:bg-slate-900 dark:focus:bg-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Nodal SLAO Officer
                  </label>
                  <input
                    type="text"
                    value={formNodalOfficer}
                    onChange={(e) => setFormNodalOfficer(e.target.value)}
                    placeholder="e.g. S.K. Rathore, SLAO"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white dark:bg-slate-900 dark:focus:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Allocated Budget (₹ Crores)
                  </label>
                  <input
                    type="number"
                    value={formBudgetCr}
                    onChange={(e) => setFormBudgetCr(Number(e.target.value))}
                    placeholder="e.g. 5000"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white dark:bg-slate-900 dark:focus:bg-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Official Contact Email
                  </label>
                  <input
                    type="email"
                    value={formContactEmail}
                    onChange={(e) => setFormContactEmail(e.target.value)}
                    placeholder="e.g. land.desk@nhai.org"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white dark:bg-slate-900 dark:focus:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Department Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as DepartmentStatus)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white dark:bg-slate-900 dark:focus:bg-slate-900 cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE (Authorized for Land Acquisition)</option>
                    <option value="INACTIVE">INACTIVE (Decommissioned / Read-Only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Headquarters Office Address
                </label>
                <input
                  type="text"
                  value={formOfficeAddress}
                  onChange={(e) => setFormOfficeAddress(e.target.value)}
                  placeholder="e.g. G-5 & 6, Sector-10, Dwarka, New Delhi - 110075"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white dark:bg-slate-900 dark:focus:bg-slate-900"
                />
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-900 dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 text-white font-bold shadow-md transition-colors cursor-pointer"
                >
                  {editingDeptId ? 'Save Department Changes' : 'Register Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-red-200 dark:border-red-900/50 p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Confirm Department Deletion
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete this department? This action will permanently remove it from the master directory and statutory reports.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
