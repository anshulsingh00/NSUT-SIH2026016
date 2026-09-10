import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  User, 
  MapPin, 
  IndianRupee, 
  FileCheck2, 
  CheckCircle2, 
  Clock, 
  Download, 
  Upload, 
  HelpCircle, 
  ShieldCheck, 
  Building2, 
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Bot,
  Sparkles
} from 'lucide-react';

export const LandownerDashboard: React.FC = () => {
  const { parcels, documents, currentUser, showToast, navigate } = useApp();

  // Authentication Protection Guard
  React.useEffect(() => {
    if (!currentUser) {
      showToast('Authentication Required', 'Please sign in to access your landowner dashboard and land records.', 'warning');
      navigate('/login');
    }
  }, [currentUser, navigate, showToast]);

  if (!currentUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-md w-full">
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-sans">Protected Landowner Workspace</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            All personal dossiers, Khasra records, and 100% solatium compensation details are confidential and accessible only after citizen authentication.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            Sign In to Landowner Portal
          </button>
        </div>
      </div>
    );
  }

  // Find parcel for current landowner (e.g. DL-10293 for Raj Kumar)
  const myParcel = parcels.find(p => p.id === 'DL-10293') || parcels[0];
  const myDocs = documents.filter(d => d.parcelId === myParcel.id);

  const [isGrievanceOpen, setIsGrievanceOpen] = useState(false);
  const [grievanceText, setGrievanceText] = useState('');

  const handleDownloadAward = () => {
    showToast(
      'Downloading Award Certificate',
      `Official Section 23 RFCTLARR Award Certificate for Khasra ${myParcel.khasraNumber} generated.`,
      'success'
    );
  };

  const handleGrievanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGrievanceOpen(false);
    setGrievanceText('');
    showToast(
      'Grievance Registered',
      'Your request (GRV-2026-9812) has been forwarded to the Special Land Acquisition Officer (SLAO) North Delhi.',
      'success'
    );
  };

  const workflowSteps = [
    { title: 'Joint Survey Completed', status: 'COMPLETED', date: '14-Jan-2024' },
    { title: '7/12 Jamabandi Verified', status: 'COMPLETED', date: '28-Feb-2024' },
    { title: 'Circle Rate Valuation', status: 'COMPLETED', date: '15-Mar-2024' },
    { title: 'Section 23 Award Approved', status: 'IN_PROGRESS', date: 'In Final SLAO Review' },
    { title: 'PFMS Bank DBT Transfer', status: 'PENDING', date: 'Pending SLAO Signature' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Landowner Hero Greeting Card */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-6 sm:p-8 rounded-xl shadow-md border border-emerald-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-emerald-800 text-amber-300 text-xs font-bold uppercase mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>DigiLocker e-KYC Verified Citizen</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-sans">
              Welcome, {myParcel.ownerName}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200 mt-1">
              Son of {myParcel.fatherName} • Khasra No: <strong className="text-white font-mono">{myParcel.khasraNumber}</strong>, Village: <strong className="text-white">{myParcel.village}, {myParcel.district}</strong>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleDownloadAward}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Award Letter</span>
            </button>

            <button
              onClick={() => setIsGrievanceOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs border border-emerald-600 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Register Grievance / Query</span>
            </button>
          </div>
        </div>
      </div>

      {/* BhoomiMitra AI Assistant Quick Query Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 rounded-xl border border-blue-800 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-md">
            <Bot className="w-6 h-6 text-slate-900 dark:text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white flex items-center space-x-1.5">
                <span>BhoomiMitra AI Land Assistant</span>
                <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  भूमिमित्र 24x7
                </span>
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Have questions about your ₹88.90 Lakh compensation, 100% Solatium, or DBT bank timeline?
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/landowner/assistant')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Open AI Assistant Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Property & Compensation Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1: Property Dossier */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
            <span>My Acquired Land Holding</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Parcel ID:</span>
              <span className="font-mono font-bold text-blue-900 dark:text-blue-400">{myParcel.id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Khasra Number:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{myParcel.khasraNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Khatauni Number:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{myParcel.khatauniNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Acquired Area:</span>
              <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400 text-sm">{myParcel.areaAcres} Acres</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Land Type:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{myParcel.landType}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Project Name:</span>
              <span className="font-semibold text-blue-900 dark:text-blue-400 text-right">{myParcel.projectName}</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/landowner/documents')}
              className="w-full py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-950 dark:text-emerald-300 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-500" />
              <span>Upload Additional Land Documents</span>
            </button>
          </div>
        </div>

        {/* Col 2 & 3: Transparent Compensation Entitlement Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <IndianRupee className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
              <span>Statutory Fair Compensation Entitlement (RFCTLARR Act)</span>
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-400">
              100% Solatium Guaranteed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Notified Circle Rate:</span>
                <span className="font-mono font-semibold dark:text-slate-200">₹{(myParcel.circleRatePerAcre).toLocaleString('en-IN')} / Acre</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Base Land Value ({myParcel.areaAcres} Acres):</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">₹{(myParcel.marketValueTotal).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 bg-amber-50/70 dark:bg-amber-900/20 p-2 rounded">
                <div>
                  <span className="font-bold text-amber-900 dark:text-amber-500 block">100% Statutory Solatium:</span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-600">Under Section 30(1)</span>
                </div>
                <span className="font-mono font-bold text-amber-900 dark:text-amber-500 self-center">
                  + ₹{(myParcel.solatiumAmount).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Structures & Trees:</span>
                <span className="font-mono font-semibold dark:text-slate-200">₹{(myParcel.additionalAssetValue).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Total Highlight Box */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-5 border border-emerald-200 dark:border-emerald-800/50 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-500 block">
                  Total Award Entitlement
                </span>
                <div className="text-3xl font-black text-emerald-950 dark:text-emerald-100 font-mono mt-1">
                  ₹{(myParcel.totalCompensation).toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-600 mt-1 block">
                  Rupees Eighty-Eight Lakh Ninety Thousand Only
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-200 dark:border-emerald-800/50 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Direct Bank Transfer Account</span>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  State Bank of India (A/C: ****4821)
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-500 dark:text-slate-400 font-mono">IFSC: SBIN0001234</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Acquisition Stage Stepper */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-6">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-6 pb-2 border-b border-slate-100 dark:border-slate-800">
          Land Acquisition & Compensation Disbursement Timeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {workflowSteps.map((step, idx) => (
            <div
              key={step.title}
              className={`p-4 rounded-xl border text-xs ${
                step.status === 'COMPLETED' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50' :
                step.status === 'IN_PROGRESS' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800/50 ring-1 ring-blue-300 dark:ring-blue-800' :
                'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  step.status === 'COMPLETED' ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-900 dark:text-white' :
                  step.status === 'IN_PROGRESS' ? 'bg-blue-600 dark:bg-blue-500 text-white dark:text-slate-900 dark:text-white' :
                  'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  {step.status === 'COMPLETED' ? '✓' : idx + 1}
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-200">{step.title}</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">{step.date}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Grievance Modal */}
      {isGrievanceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
                <span>Register Landowner Grievance / Query</span>
              </h3>
              <button onClick={() => setIsGrievanceOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300">
                ✕
              </button>
            </div>

            <form onSubmit={handleGrievanceSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Grievance Category</label>
                <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-white">
                  <option>Circle Rate / Valuation Clarification</option>
                  <option>Bank Account / IFSC Update</option>
                  <option>Family Co-Sharer Revenue Apportionment</option>
                  <option>Rehabilitation & Resettlement Entitlement</option>
                  <option>Physical Mutation Status Query</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Explain Details of Request / Issue</label>
                <textarea
                  rows={4}
                  required
                  value={grievanceText}
                  onChange={e => setGrievanceText(e.target.value)}
                  placeholder="Provide details regarding your survey number or compensation..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGrievanceOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold"
                >
                  Submit Grievance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
