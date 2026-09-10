import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  IndianRupee, 
  CheckCircle2, 
  Building2, 
  Download, 
  ShieldCheck, 
  Clock, 
  ArrowLeft,
  ExternalLink,
  Bot
} from 'lucide-react';

export const LandownerPaymentStatus: React.FC = () => {
  const { parcels, compensations, currentUser, navigate, showToast } = useApp();

  // Authentication Protection Guard
  React.useEffect(() => {
    if (!currentUser) {
      showToast('Authentication Required', 'Please sign in to view your compensation award and DBT payment ledger.', 'warning');
      navigate('/login');
    }
  }, [currentUser, navigate, showToast]);

  if (!currentUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-md w-full">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
            <IndianRupee className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-sans">Payment Ledger Confidential</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Bank accounts, PFMS direct transfer transaction IDs, and statutory solatium breakdowns are strictly restricted to authenticated landowners.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            Sign In to View Compensation
          </button>
        </div>
      </div>
    );
  }

  const myParcel = parcels.find(p => p.id === 'DL-10293') || parcels[0];
  const myComp = compensations.find(c => c.parcelId === myParcel.id) || compensations[0];

  const handleDownloadReceipt = () => {
    showToast(
      'Downloading PFMS Receipt',
      'Direct Benefit Transfer acknowledgment receipt generated for your tax and banking records.',
      'success'
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/landowner/dashboard')}
            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-sans">
              Compensation Award & DBT Payment Ledger
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Statutory compensation under Right to Fair Compensation and Transparency Act 2013.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/landowner/assistant')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Bot className="w-4 h-4 text-amber-300" />
            <span>Ask BhoomiMitra AI</span>
          </button>

          <button
            onClick={handleDownloadReceipt}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Payment Voucher</span>
          </button>
        </div>
      </div>

      {/* Main Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Highlight */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <IndianRupee className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
            <span>Award Calculation Summary</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Base Land Value:</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">₹{(myParcel.marketValueTotal).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">100% Solatium (Sec 30):</span>
              <span className="font-mono font-bold text-amber-800 dark:text-amber-500">+ ₹{(myParcel.solatiumAmount).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Assets / Structures:</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">₹{(myParcel.additionalAssetValue).toLocaleString('en-IN')}</span>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800/50 mt-3">
              <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-400 block">Total Final Entitlement</span>
              <span className="text-2xl font-black text-emerald-950 dark:text-emerald-100 font-mono">
                ₹{(myParcel.totalCompensation).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* PFMS Bank Account Status */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Building2 className="w-4 h-4 text-blue-800 dark:text-blue-500" />
            <span>PFMS Direct Benefit Transfer (DBT) Bank Record</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Bank Name</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{myComp?.bankName || 'State Bank of India'}</span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Account Number</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{myComp?.bankAccountMasked || '****4821'}</span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">IFSC Code</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{myComp?.ifscCode || 'SBIN0001234'}</span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">DBT Transfer Status</span>
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mt-0.5 ${
                myComp?.status === 'Paid' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-400'
              }`}>
                {myComp?.status === 'Paid' ? '✓ Funds Disbursed via PFMS' : 'Approved — In Disbursement Queue'}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50/70 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg text-xs text-blue-950 dark:text-blue-100 space-y-1">
            <div className="font-bold flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-800 dark:text-blue-400" />
              <span>Public Financial Management System (PFMS) Mandate</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Funds are transferred directly from the Ministry Consolidated Fund without intermediaries, ensuring zero leakage and immediate SMS notification upon bank clearance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
