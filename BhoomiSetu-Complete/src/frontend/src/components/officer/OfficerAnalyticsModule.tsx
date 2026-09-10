import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Filter, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  FileText, 
  Building2, 
  IndianRupee, 
  PieChart, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  ChevronDown, 
  Printer, 
  FileSpreadsheet, 
  ShieldCheck, 
  MapPin, 
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  HelpCircle,
  FolderKanban
} from 'lucide-react';

export const OfficerAnalyticsModule: React.FC = () => {
  const { 
    currentUser, 
    projects, 
    parcels, 
    documents, 
    compensations, 
    riskAlerts, 
    departments, 
    showToast, 
    navigate 
  } = useApp();

  // Authentication Protection Guard
  React.useEffect(() => {
    if (!currentUser || (currentUser.role !== 'OFFICER' && currentUser.role !== 'ADMIN')) {
      showToast('Restricted Access', 'Officer or Administrator credentials required to view statutory analytics.', 'warning');
      navigate('/login');
    }
  }, [currentUser, navigate, showToast]);

  // Filter States
  const [dateRange, setDateRange] = useState<'7D' | '30D' | '90D' | 'FY25' | 'ALL'>('30D');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChartTab, setActiveChartTab] = useState<'VOLUME' | 'APPROVAL_RATE' | 'DISBURSEMENTS'>('VOLUME');

  // Unified Application Records Synthesized from System Data
  const allApplications = useMemo(() => {
    const apps = [];

    // 1. Title verification filings from documents
    documents.forEach((doc, idx) => {
      const parentParcel = parcels.find(p => p.id === doc.parcelId);
      const parentProj = projects.find(p => p.id === doc.projectId);
      apps.push({
        id: `APP-DOC-${doc.id.replace(/[^0-9]/g, '') || (100 + idx)}`,
        type: 'Title & RoR Verification',
        category: 'Document Vetting',
        ownerName: doc.ownerName || parentParcel?.ownerName || 'Citizen Applicant',
        khasraNumber: parentParcel?.khasraNumber || '45/12',
        village: parentParcel?.village || 'Narela',
        district: parentParcel?.district || 'North Delhi',
        projectId: doc.projectId || 'PRJ-001',
        projectName: parentProj?.name || 'Delhi–Meerut Regional Expressway',
        department: parentProj?.department || 'National Highways Authority of India (NHAI)',
        submissionDate: doc.uploadDate || '12-Jan-2025',
        status: doc.status === 'Verified' ? 'Approved' : doc.status === 'Rejected' ? 'Rejected' : 'Pending',
        valuationAmount: parentParcel?.totalCompensation || 4500000,
        processingDays: doc.status === 'Verified' ? 9 : doc.status === 'Rejected' ? 14 : 6,
        slaTargetDays: 15,
        remarks: doc.rejectionReason || '7/12 Jamabandi and joint survey cross-validated.'
      });
    });

    // 2. Parcel acquisition & boundary applications
    parcels.forEach((p, idx) => {
      const parentProj = projects.find(pr => pr.id === p.projectId);
      apps.push({
        id: `APP-PCL-${p.id.replace(/[^0-9]/g, '') || (200 + idx)}`,
        type: 'Cadastral Demarcation & Award',
        category: p.landType,
        ownerName: p.ownerName,
        khasraNumber: p.khasraNumber,
        village: p.village,
        district: p.district,
        projectId: p.projectId,
        projectName: p.projectName || parentProj?.name || 'Infrastructure Project',
        department: parentProj?.department || 'Ministry of Railways / DMRC',
        submissionDate: p.lastUpdated || '18-Feb-2025',
        status: p.status === 'Acquired' || p.verificationStatus === 'Verified' ? 'Approved' : p.status === 'Disputed' ? 'Rejected' : 'Pending',
        valuationAmount: p.totalCompensation,
        processingDays: p.status === 'Acquired' ? 18 : p.status === 'Disputed' ? 26 : 12,
        slaTargetDays: 20,
        remarks: p.disputeReason || 'Joint measurement survey completed & boundary delineated.'
      });
    });

    // 3. Compensation & Solatium Payment Mandates
    compensations.forEach((c, idx) => {
      const parentProj = projects.find(pr => pr.id === c.projectId);
      apps.push({
        id: `APP-DBT-${c.id.replace(/[^0-9]/g, '') || (300 + idx)}`,
        type: 'PFMS Direct Benefit Mandate',
        category: 'Statutory Solatium',
        ownerName: c.landownerName,
        khasraNumber: '45/12',
        village: c.village,
        district: c.district,
        projectId: c.projectId,
        projectName: c.projectName || parentProj?.name || 'Freight Corridor Extension',
        department: parentProj?.department || 'Public Works Department (PWD)',
        submissionDate: c.approvedDate || '02-Mar-2025',
        status: c.status === 'Paid' || c.status === 'Approved' ? 'Approved' : c.status === 'Review' ? 'Pending' : 'Pending',
        valuationAmount: c.totalCompensation,
        processingDays: c.status === 'Paid' ? 8 : 4,
        slaTargetDays: 10,
        remarks: `Section 23 Award DBT to ${c.bankName} (****${c.bankAccountMasked.slice(-4)}).`
      });
    });

    return apps;
  }, [documents, parcels, compensations, projects]);

  // Filtered Applications based on user selections
  const filteredApplications = useMemo(() => {
    return allApplications.filter(app => {
      // Department Filter
      if (selectedDept !== 'ALL') {
        const matchesDept = app.department.toLowerCase().includes(selectedDept.toLowerCase());
        if (!matchesDept) return false;
      }

      // Status Filter
      if (selectedStatus !== 'ALL') {
        if (app.status.toLowerCase() !== selectedStatus.toLowerCase()) return false;
      }

      // Category / Type Filter
      if (selectedCategory !== 'ALL') {
        if (!app.category.toLowerCase().includes(selectedCategory.toLowerCase()) && 
            !app.type.toLowerCase().includes(selectedCategory.toLowerCase())) {
          return false;
        }
      }

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSearch = 
          app.id.toLowerCase().includes(q) ||
          app.ownerName.toLowerCase().includes(q) ||
          app.khasraNumber.toLowerCase().includes(q) ||
          app.projectName.toLowerCase().includes(q) ||
          app.village.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [allApplications, selectedDept, selectedStatus, selectedCategory, searchQuery]);

  // Key Aggregated Metrics
  const totalAppsCount = filteredApplications.length;
  const approvedCount = filteredApplications.filter(a => a.status === 'Approved').length;
  const pendingCount = filteredApplications.filter(a => a.status === 'Pending').length;
  const rejectedCount = filteredApplications.filter(a => a.status === 'Rejected').length;
  const approvalRatePct = totalAppsCount > 0 ? Math.round((approvedCount / totalAppsCount) * 100) : 0;
  
  const totalValuation = filteredApplications.reduce((acc, curr) => acc + (curr.valuationAmount || 0), 0);
  const totalValuationCr = (totalValuation / 10000000).toFixed(2);
  
  const avgTurnaroundDays = filteredApplications.length > 0
    ? (filteredApplications.reduce((acc, c) => acc + c.processingDays, 0) / filteredApplications.length).toFixed(1)
    : '0.0';

  // Department-wise breakdown
  const departmentDistribution = useMemo(() => {
    const map: Record<string, { count: number; approved: number; pending: number; valuation: number }> = {};
    
    allApplications.forEach(app => {
      let key = 'NHAI (Highways)';
      if (app.department.includes('Railways') || app.department.includes('DMRC')) key = 'Railways & Metro';
      else if (app.department.includes('PWD') || app.department.includes('Urban')) key = 'PWD Urban Dev';
      else if (app.department.includes('Industrial') || app.department.includes('MIDC')) key = 'Industrial Hubs';
      else if (app.department.includes('Water') || app.department.includes('Irrigation')) key = 'Irrigation & Water';

      if (!map[key]) {
        map[key] = { count: 0, approved: 0, pending: 0, valuation: 0 };
      }
      map[key].count += 1;
      if (app.status === 'Approved') map[key].approved += 1;
      if (app.status === 'Pending') map[key].pending += 1;
      map[key].valuation += app.valuationAmount || 0;
    });

    return Object.entries(map).map(([name, data]) => ({
      name,
      ...data,
      pct: Math.round((data.count / (allApplications.length || 1)) * 100)
    }));
  }, [allApplications]);

  // Monthly Processing Trend Dataset (Mocked with statutory growth distribution)
  const timelineTrendData = [
    { month: 'Oct 2024', total: 42, approved: 34, pending: 6, rejected: 2, amountCr: 18.4 },
    { month: 'Nov 2024', total: 58, approved: 46, pending: 9, rejected: 3, amountCr: 24.8 },
    { month: 'Dec 2024', total: 72, approved: 58, pending: 11, rejected: 3, amountCr: 31.2 },
    { month: 'Jan 2025', total: 89, approved: 71, pending: 14, rejected: 4, amountCr: 39.6 },
    { month: 'Feb 2025', total: 114, approved: 92, pending: 18, rejected: 4, amountCr: 52.1 },
    { month: 'Mar 2025', total: 138, approved: 115, pending: 17, rejected: 6, amountCr: 68.5 }
  ];

  const handleExportCSV = () => {
    const headers = 'Application ID,Type,Owner Name,Khasra,Village,Department,Status,Valuation INR,Processing Days\n';
    const rows = filteredApplications.map(a => 
      `"${a.id}","${a.type}","${a.ownerName}","${a.khasraNumber}","${a.village}","${a.department}","${a.status}",${a.valuationAmount},${a.processingDays}`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bhoomisetu_officer_analytics_${Date.now()}.csv`;
    a.click();
    showToast('Export Successful', `Exported ${filteredApplications.length} statutory records as CSV.`, 'success');
  };

  const handlePrintReport = () => {
    window.print();
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Header & Export Action Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800">
              Executive Analytics & Oversight
            </span>
            <span className="text-slate-300 dark:text-slate-600 dark:text-slate-400">•</span>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">RFCTLARR 2013 Performance Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-3 flex items-center space-x-2.5">
            <BarChart3 className="w-7 h-7 text-blue-800 dark:text-blue-500" />
            <span>Land Acquisition Analytics Hub</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time monitoring of citizen applications, statutory review milestones, SLA velocity, and direct PFMS disbursements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm border border-slate-300 dark:border-slate-700 shadow-sm transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm border border-slate-300 dark:border-slate-700 shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-700 dark:text-slate-400" />
            <span>Print Report</span>
          </button>

          <button
            onClick={() => {
              showToast('Data Refreshed', 'Synced live records from PFMS Treasury and Jamabandi registries.', 'info');
            }}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sync Live Metrics</span>
          </button>
        </div>
      </div>

      {/* Interactive Global Filter Control Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2 text-sm font-semibold text-slate-800 dark:text-white">
            <SlidersHorizontal className="w-4 h-4 text-blue-700" />
            <span>Multi-Dimensional Analytic Filters</span>
          </div>

          {/* Date Range Selector Pill Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-sm font-medium">
            {(['7D', '30D', '90D', 'FY25', 'ALL'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setDateRange(r)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
                  dateRange === r
                    ? 'bg-white dark:bg-slate-700 text-blue-900 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {r === '7D' ? 'Last 7 Days' : r === '30D' ? 'Last 30 Days' : r === '90D' ? 'Last Quarter' : r === 'FY25' ? 'FY 2024-25' : 'All Time'}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdown Filters & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Department / Implementing Body */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">
              Department / Authority
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              <option value="NHAI">NHAI</option>
              <option value="Railways">Ministry of Railways / DMRC</option>
              <option value="PWD">Public Works Department (PWD)</option>
              <option value="Industrial">MIDC / Industrial Corridors</option>
              <option value="Water">Irrigation & Water Resources</option>
            </select>
          </div>

          {/* Application Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">
              Application Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending Review</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Category / Land Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">
              Category / Land Use
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="Agricultural">Agricultural Land</option>
              <option value="Commercial">Commercial / Mixed</option>
              <option value="Residential">Residential</option>
              <option value="Title">Title Proofs</option>
              <option value="Solatium">Solatium Claims</option>
            </select>
          </div>

          {/* Quick Search */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Owner, Khasra, Project..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Active Filter Indicators */}
        {(selectedDept !== 'ALL' || selectedStatus !== 'ALL' || selectedCategory !== 'ALL' || searchQuery || dateRange !== 'ALL') && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-sm font-medium text-slate-500">Active filters:</span>
            {selectedDept !== 'ALL' && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                <span>Dept: {selectedDept}</span>
                <button onClick={() => setSelectedDept('ALL')} className="hover:text-slate-900 ml-1">×</button>
              </span>
            )}
            {selectedStatus !== 'ALL' && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                <span>Status: {selectedStatus}</span>
                <button onClick={() => setSelectedStatus('ALL')} className="hover:text-slate-900 ml-1">×</button>
              </span>
            )}
            {selectedCategory !== 'ALL' && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                <span>Category: {selectedCategory}</span>
                <button onClick={() => setSelectedCategory('ALL')} className="hover:text-slate-900 ml-1">×</button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                <span>Search: "{searchQuery}"</span>
                <button onClick={() => setSearchQuery('')} className="hover:text-slate-900 ml-1">×</button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedDept('ALL');
                setSelectedStatus('ALL');
                setSelectedCategory('ALL');
                setSearchQuery('');
                setDateRange('30D');
              }}
              className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline cursor-pointer ml-2"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Row 1: Executive KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Applications */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Applications
            </span>
          </div>
          <div className="mt-1 flex items-baseline space-x-3">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{totalAppsCount}</span>
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              +14.2% MoM
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Across 24 monitored projects
          </p>
        </div>

        {/* Approved Applications */}
        <div className="bg-emerald-50/50 dark:bg-emerald-900/20 p-5 rounded-xl border border-emerald-100 dark:border-emerald-800/50 shadow-sm transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-emerald-800 dark:text-emerald-400">
              Approved
            </span>
          </div>
          <div className="mt-1 flex items-baseline space-x-3">
            <span className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{approvedCount}</span>
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-500">
              {approvalRatePct}% Rate
            </span>
          </div>
          <p className="text-sm text-emerald-700 dark:text-emerald-500 mt-2">
            Cleared for payment
          </p>
        </div>

        {/* Pending In-Review Applications */}
        <div className="bg-amber-50/50 dark:bg-amber-900/20 p-5 rounded-xl border border-amber-100 dark:border-amber-800/50 shadow-sm transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-amber-800 dark:text-amber-400">
              Pending Review
            </span>
          </div>
          <div className="mt-1 flex items-baseline space-x-3">
            <span className="text-3xl font-bold text-amber-900 dark:text-amber-100">{pendingCount}</span>
            <span className="text-sm font-medium text-amber-700 dark:text-amber-500">
              Avg {avgTurnaroundDays} days
            </span>
          </div>
          <p className="text-sm text-amber-700 dark:text-amber-500 mt-2">
            Within SLA limits
          </p>
        </div>

        {/* Rejected / Disputed Applications */}
        <div className="bg-red-50/50 dark:bg-red-900/20 p-5 rounded-xl border border-red-100 dark:border-red-800/50 shadow-sm transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-800 dark:text-red-400">
              Rejected
            </span>
          </div>
          <div className="mt-1 flex items-baseline space-x-3">
            <span className="text-3xl font-bold text-red-900 dark:text-red-100">{rejectedCount}</span>
            <span className="text-sm font-medium text-red-700 dark:text-red-500">
              {totalAppsCount > 0 ? Math.round((rejectedCount / totalAppsCount) * 100) : 0}% of volume
            </span>
          </div>
          <p className="text-sm text-red-700 dark:text-red-500 mt-2">
            Referred for hearing
          </p>
        </div>
      </div>

      {/* Row 2: Interactive Charts & Timeline Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart (2 Cols): Applications Processed Over Time */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-700 dark:text-blue-500" />
                  <span>Processing Trends</span>
                </h3>
              </div>

              {/* Chart Series Toggle */}
              <div className="flex rounded-md bg-slate-100 dark:bg-slate-800 p-1 text-sm">
                <button
                  onClick={() => setActiveChartTab('VOLUME')}
                  className={`px-3 py-1.5 rounded-md font-medium text-sm transition-all cursor-pointer ${
                    activeChartTab === 'VOLUME' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Volume
                </button>
                <button
                  onClick={() => setActiveChartTab('APPROVAL_RATE')}
                  className={`px-3 py-1.5 rounded-md font-medium text-sm transition-all cursor-pointer ${
                    activeChartTab === 'APPROVAL_RATE' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Approval Rate
                </button>
                <button
                  onClick={() => setActiveChartTab('DISBURSEMENTS')}
                  className={`px-3 py-1.5 rounded-md font-medium text-sm transition-all cursor-pointer ${
                    activeChartTab === 'DISBURSEMENTS' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Disbursed Amount
                </button>
              </div>
            </div>

            {/* Interactive SVG Bar & Trend Chart */}
            <div className="mt-6 space-y-4">
              <div className="h-64 flex items-end justify-between gap-2 pt-6 pb-2 px-4 bg-slate-50/70 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-800">
                {timelineTrendData.map((item, idx) => {
                  const maxVal = 150;
                  const totalHeightPct = Math.round((item.total / maxVal) * 100);
                  const approvedHeightPct = Math.round((item.approved / maxVal) * 100);
                  const pendingHeightPct = Math.round((item.pending / maxVal) * 100);
                  const rejectedHeightPct = Math.round((item.rejected / maxVal) * 100);

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                      {/* Tooltip on Hover */}
                      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-slate-700 text-white text-[10px] py-1.5 px-2.5 rounded-lg shadow-xl pointer-events-none z-20 whitespace-nowrap">
                        <div className="font-bold text-amber-300">{item.month}</div>
                        <div>Total: {item.total} • Approved: {item.approved}</div>
                        <div>Disbursed: ₹{item.amountCr} Cr</div>
                      </div>

                      {/* Stacked Bars */}
                      <div className="w-full max-w-[42px] flex flex-col justify-end h-full">
                        {activeChartTab === 'VOLUME' && (
                          <div className="w-full flex flex-col rounded-t-lg overflow-hidden shadow-xs transition-all group-hover:brightness-105" style={{ height: `${totalHeightPct}%` }}>
                            <div className="bg-red-500/90 w-full" style={{ height: `${(item.rejected / item.total) * 100}%` }} title={`Rejected: ${item.rejected}`} />
                            <div className="bg-amber-400 w-full" style={{ height: `${(item.pending / item.total) * 100}%` }} title={`Pending: ${item.pending}`} />
                            <div className="bg-blue-700 dark:bg-blue-600 w-full flex-1" title={`Approved: ${item.approved}`} />
                          </div>
                        )}

                        {activeChartTab === 'APPROVAL_RATE' && (
                          <div 
                            className="w-full bg-emerald-600 rounded-t-lg shadow-xs transition-all group-hover:bg-emerald-500" 
                            style={{ height: `${Math.round((item.approved / item.total) * 100)}%` }}
                          />
                        )}

                        {activeChartTab === 'DISBURSEMENTS' && (
                          <div 
                            className="w-full bg-purple-700 rounded-t-lg shadow-xs transition-all group-hover:bg-purple-600" 
                            style={{ height: `${Math.round((item.amountCr / 80) * 100)}%` }}
                          />
                        )}
                      </div>

                      {/* Month Label */}
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 truncate max-w-[60px]">
                        {item.month.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Chart Legend */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400 pt-4">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded bg-blue-700 dark:bg-blue-600"></span>
                  <span>Approved</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded bg-amber-400"></span>
                  <span>Reviewing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded bg-red-500"></span>
                  <span>Rejected</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Card (1 Col): Department & Category Distribution */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                <PieChart className="w-5 h-5 text-emerald-700 dark:text-emerald-500" />
                <span>Department Distribution</span>
              </h3>
            </div>

            {/* Department Breakdown List with Progress Bars */}
            <div className="mt-5 space-y-4">
              {departmentDistribution.map((dept, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{dept.name}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {dept.count} filings
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                    <div 
                      className={`h-full ${
                        i === 0 ? 'bg-blue-600' :
                        i === 1 ? 'bg-emerald-600' :
                        i === 2 ? 'bg-amber-500' :
                        i === 3 ? 'bg-purple-600' : 'bg-teal-600'
                      }`}
                      style={{ width: `${dept.pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Approved: {dept.approved} • Pending: {dept.pending}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">₹{(dept.valuation / 10000000).toFixed(1)} Cr</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick SLA Benchmark Note */}
          <div className="mt-6 p-3.5 bg-blue-50/80 dark:bg-blue-900/20 rounded-xl border border-blue-200/80 dark:border-blue-800/50 flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-blue-900 dark:text-blue-100 leading-snug">
              <strong>Automated Statutory Compliance:</strong> 100% Solatium multiplier computed under Section 30(1) with zero TDS under Section 96.
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Statutory Acquisition Pipeline Funnel */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-blue-800 dark:text-blue-500" />
              <span>Pipeline Funnel Analysis</span>
            </h3>
          </div>
          <span className="text-sm font-medium text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-md border border-emerald-100 dark:border-emerald-800/50">
            Pipeline Efficiency: 82.4%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          {[
            { step: '01', label: 'Land Identification', sub: 'Cadastral Sync', count: 184, pct: '100%', color: 'blue' },
            { step: '02', label: 'JMS Joint Survey', sub: 'Boundary Pegging', count: 162, pct: '88%', color: 'indigo' },
            { step: '03', label: '7/12 Title Vetting', sub: 'AI OCR Audit', count: 140, pct: '76%', color: 'purple' },
            { step: '04', label: 'Section 23 Award', sub: '100% Solatium Calc', count: 118, pct: '64%', color: 'amber' },
            { step: '05', label: 'PFMS DBT Disbursal', sub: 'Treasury Wire', count: 99, pct: '54%', color: 'emerald' }
          ].map((stage, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Stage {stage.step}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                  stage.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' :
                  stage.color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                }`}>
                  {stage.pct}
                </span>
              </div>
              <div className="font-semibold text-sm text-slate-900 dark:text-white">{stage.label}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{stage.sub}</div>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-baseline justify-between">
                <span className="text-xl font-bold text-slate-900 dark:text-white">{stage.count}</span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Filings</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 4: Drill-Down Applications Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        {/* Table Header Controls */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h3 className="font-semibold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-700 dark:text-blue-500" />
              <span>Processed Applications Ledger ({filteredApplications.length})</span>
            </h3>
          </div>

          <div className="text-sm text-slate-500 dark:text-slate-400">
            Showing <strong>{filteredApplications.length}</strong> of {allApplications.length} total entries
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
              <tr>
                <th className="py-3 px-5">Application ID</th>
                <th className="py-3 px-5">Claimant & Khasra</th>
                <th className="py-3 px-5">Type & Category</th>
                <th className="py-3 px-5">Project & Dept</th>
                <th className="py-3 px-5">Valuation</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 italic">
                    No applications match the active filter criteria. Try resetting your search or filters.
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-5 font-mono font-medium text-slate-900 dark:text-white">
                      {app.id}
                      <span className="block text-xs text-slate-500 dark:text-slate-400">{app.submissionDate}</span>
                    </td>

                    <td className="py-3 px-5">
                      <div className="font-medium text-slate-900 dark:text-white">{app.ownerName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Khasra: <strong className="font-medium text-slate-700 dark:text-slate-300">{app.khasraNumber}</strong> • {app.village}, {app.district}
                      </div>
                    </td>

                    <td className="py-3 px-5">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{app.type}</div>
                      <span className="inline-block mt-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {app.category}
                      </span>
                    </td>

                    <td className="py-3 px-5 max-w-[200px]">
                      <div className="font-medium text-slate-800 dark:text-slate-200 truncate">{app.projectName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{app.department}</div>
                    </td>

                    <td className="py-3 px-5 font-medium text-slate-900 dark:text-white">
                      ₹{(app.valuationAmount).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-5">
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                        app.status === 'Approved' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50' :
                        app.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50' :
                        'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50'
                      }`}>
                        {app.status === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {app.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                        {app.status === 'Rejected' && <AlertOctagon className="w-3.5 h-3.5" />}
                        <span>{app.status}</span>
                      </span>
                    </td>

                    <td className="py-3 px-5 text-right">
                      <button
                        onClick={() => {
                          showToast('Dossier Inspection', `Viewing statutory records for ${app.ownerName} (${app.id}).`, 'info');
                          navigate('/officer/land-parcels');
                        }}
                        className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium cursor-pointer"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
