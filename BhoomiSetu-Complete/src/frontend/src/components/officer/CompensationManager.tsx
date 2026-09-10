import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  IndianRupee, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Calculator, 
  Download, 
  ShieldCheck, 
  Building2,
  Check
} from 'lucide-react';
import { CompensationStatus } from '../../types';

export const CompensationManager: React.FC = () => {
  const { compensations, updateCompensationStatus, approveCompensation, disbursePayment, showToast } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Interactive Solatium Calculator state
  const [calcAcreage, setCalcAcreage] = useState<number>(2.5);
  const [calcCircleRate, setCalcCircleRate] = useState<number>(1800000);
  const [calcMultiplier, setCalcMultiplier] = useState<number>(1.0);
  const [calcStructureVal, setCalcStructureVal] = useState<number>(250000);

  const baseCalcValue = calcAcreage * calcCircleRate * calcMultiplier;
  const solatiumCalcValue = baseCalcValue * 1.0; // 100% under RFCTLARR
  const totalCalcAward = baseCalcValue + solatiumCalcValue + calcStructureVal;

  const totalSanctioned = compensations.reduce((acc, c) => acc + c.totalCompensation, 0);
  const totalPaid = compensations.filter(c => c.status === 'Paid').reduce((acc, c) => acc + c.totalCompensation, 0);
  const totalApproved = compensations.filter(c => c.status === 'Approved').reduce((acc, c) => acc + c.totalCompensation, 0);
  const totalPending = compensations.filter(c => c.status === 'Processing' || c.status === 'Review' || c.status === 'Calculation').reduce((acc, c) => acc + c.totalCompensation, 0);

  const handleBatchDisburse = () => {
    compensations.filter(c => c.status === 'Approved').forEach(c => {
      disbursePayment(c.id);
    });
    showToast(
      'Batch PFMS DBT Disbursed',
      'All approved awards have been successfully queued and transferred via Direct Benefit Transfer.',
      'success'
    );
  };

  const filteredCompensations = compensations.filter(c => {
    if (filterStatus === 'ALL') return true;
    return c.status === filterStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-sans">
            Statutory Compensation & DBT Disbursement Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            RFCTLARR Act 2013 automated 100% solatium computation and PFMS Direct Benefit Transfer monitoring.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleBatchDisburse}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Batch Disburse Approved Awards</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Sanctioned Value</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2 font-mono">
            ₹{(totalSanctioned / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Across 8 active acquisition corridors</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">Total Disbursed (DBT)</div>
          <div className="text-2xl font-bold text-emerald-700 mt-2 font-mono">
            ₹{(totalPaid / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Directly credited to verified bank accounts</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-800">Approved & Ready for DBT</div>
          <div className="text-2xl font-bold text-blue-900 mt-2 font-mono">
            ₹{(totalApproved / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[11px] text-blue-700 font-medium mt-1">Section 23 award signed</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-800">Pending Valuation / Audit</div>
          <div className="text-2xl font-bold text-amber-700 mt-2 font-mono">
            ₹{(totalPending / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">Under joint revenue inspection</div>
        </div>
      </div>

      {/* Interactive Solatium Calculator Widget */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-6">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
          <Calculator className="w-5 h-5 text-blue-800" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Interactive RFCTLARR Act 2013 Award & Solatium Calculator
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Acquired Area (Acres)</label>
            <input
              type="number"
              step="0.1"
              value={calcAcreage}
              onChange={e => setCalcAcreage(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Circle Rate (₹ / Acre)</label>
            <input
              type="number"
              step="50000"
              value={calcCircleRate}
              onChange={e => setCalcCircleRate(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Rural / Urban Multiplier</label>
            <select
              value={calcMultiplier}
              onChange={e => setCalcMultiplier(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono bg-white dark:bg-slate-900"
            >
              <option value="1.0">1.00x (Urban / Municipal)</option>
              <option value="1.25">1.25x (Semi-Urban)</option>
              <option value="1.50">1.50x (Rural Distance 10-20km)</option>
              <option value="2.00">2.00x (Remote Rural Under Sec 26)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Assets & Structures (₹)</label>
            <input
              type="number"
              step="25000"
              value={calcStructureVal}
              onChange={e => setCalcStructureVal(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
            />
          </div>
        </div>

        {/* Real-time Calculation Result Ribbon */}
        <div className="mt-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="text-emerald-950">
              Base Land Value: <strong>₹{(baseCalcValue).toLocaleString('en-IN')}</strong> + 100% Solatium (Sec 30): <strong>₹{(solatiumCalcValue).toLocaleString('en-IN')}</strong> + Structures: <strong>₹{(calcStructureVal).toLocaleString('en-IN')}</strong>
            </div>
            <div className="text-[11px] text-emerald-800">
              * Statutory compensation computed strictly per RFCTLARR First Schedule without administrative discretion.
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-emerald-800 block">Total Statutory Award</span>
            <span className="text-xl font-black text-emerald-950 font-mono">
              ₹{(totalCalcAward).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Compensation Awards Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Individual Compensation Award Registers ({filteredCompensations.length})
          </h3>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">Filter:</span>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Awards</option>
              <option value="Approved">Approved</option>
              <option value="Paid">Disbursed (Paid)</option>
              <option value="Processing">Processing</option>
              <option value="Review">Review</option>
              <option value="Calculation">Calculation</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Award Ref</th>
                <th className="py-3 px-4">Parcel & Project</th>
                <th className="py-3 px-4">Landowner</th>
                <th className="py-3 px-4">Base Land Value</th>
                <th className="py-3 px-4">100% Solatium</th>
                <th className="py-3 px-4">Total Award</th>
                <th className="py-3 px-4">PFMS Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCompensations.map(comp => (
                <tr key={comp.id} className="hover:bg-slate-50 dark:bg-slate-800">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-900">{comp.id}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{comp.parcelId}</span>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{comp.projectName}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">{comp.landownerName}</td>
                  <td className="py-3.5 px-4 font-mono">₹{(comp.basicLandValue).toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4 font-mono text-amber-800 font-semibold">+₹{(comp.solatiumAmount).toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">₹{(comp.totalCompensation).toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                      comp.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                      comp.status === 'Approved' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {comp.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {comp.status === 'Approved' ? (
                      <button
                        onClick={() => disbursePayment(comp.id)}
                        className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] cursor-pointer"
                      >
                        Disburse DBT
                      </button>
                    ) : comp.status !== 'Paid' ? (
                      <button
                        onClick={() => approveCompensation(comp.id)}
                        className="px-2.5 py-1 rounded bg-blue-900 hover:bg-blue-800 text-white font-bold text-[11px] cursor-pointer"
                      >
                        Approve Award
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-700 font-bold">✓ Transferred</span>
                    )}
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
