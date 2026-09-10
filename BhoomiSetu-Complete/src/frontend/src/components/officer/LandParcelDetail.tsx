import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  FileText, 
  IndianRupee, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileCheck2, 
  Download, 
  Building2,
  AlertTriangle,
  ExternalLink,
  Map as MapIcon
} from 'lucide-react';
import { VerificationStatus, CompensationStatus } from '../../types';

export const LandParcelDetail: React.FC = () => {
  const { 
    routeParams, 
    parcels, 
    documents, 
    compensations,
    updateParcelStatus, 
    verifyDocument, 
    updateCompensationStatus, 
    navigate, 
    showToast 
  } = useApp();

  const parcelId = routeParams.id || 'DL-10293';
  const parcel = parcels.find(p => p.id === parcelId) || parcels[0];
  const parcelDocs = documents.filter(d => d.parcelId === parcel.id);
  const comp = compensations.find(c => c.parcelId === parcel.id);

  const handleVerifyDoc = (docId: string, status: VerificationStatus) => {
    verifyDocument(docId, status, 'Verified by Competent Land Acquisition Officer under Sec 11');
  };

  const handleApproveAward = () => {
    updateParcelStatus(parcel.id, 'Verified', 'Verified', 'Approved');
    showToast(
      'Compensation Award Approved',
      `Award for ₹${(parcel.totalCompensation / 100000).toFixed(2)} Lakh approved under Section 23 of RFCTLARR Act.`,
      'success'
    );
  };

  const handleDisburseDBT = () => {
    updateParcelStatus(parcel.id, 'Acquired', 'Verified', 'Paid');
    showToast(
      'PFMS DBT Disbursed',
      `Payment of ₹${(parcel.totalCompensation / 100000).toFixed(2)} Lakh successfully routed to ${comp?.bankName || 'State Bank of India'} Account ${comp?.bankAccountMasked || '****4821'}.`,
      'success'
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/officer/land-parcels')}
            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-blue-900 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800/50">
                {parcel.id}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                parcel.status === 'Acquired' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' :
                parcel.status === 'Disputed' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400'
              }`}>
                {parcel.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-sans mt-1">
              Survey Parcel {parcel.khasraNumber} — {parcel.ownerName}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Project: <strong className="text-blue-900">{parcel.projectName} ({parcel.projectId})</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/officer/map')}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-300 dark:border-slate-700 cursor-pointer"
          >
            <MapIcon className="w-4 h-4 text-blue-700" />
            <span>Locate on GIS Map</span>
          </button>

          {parcel.compensationStatus !== 'Paid' && (
            <button
              onClick={handleApproveAward}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Section 23 Award</span>
            </button>
          )}

          {parcel.compensationStatus === 'Approved' && (
            <button
              onClick={handleDisburseDBT}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              <IndianRupee className="w-4 h-4" />
              <span>Disburse PFMS DBT</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Details + Compensation Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1 & 2: Land & Owner Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Owner & Cadastral Profile */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-6">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-100 flex items-center space-x-2">
              <User className="w-4 h-4 text-blue-800" />
              <span>Cadastral & Landowner Profile</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Primary Landowner</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 block">{parcel.ownerName}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Father / Guardian</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{parcel.fatherName}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Contact Mobile</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block font-mono">{parcel.ownerContact}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Village & Gram Panchayat</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{parcel.village}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">District & State</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{parcel.district}, {parcel.state}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">State</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{parcel.state}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Khasra Number</span>
                <span className="font-mono font-bold text-blue-900 mt-0.5 block">{parcel.khasraNumber}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Khatauni Number</span>
                <span className="font-mono font-bold text-blue-900 mt-0.5 block">{parcel.khatauniNumber}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Total Acquired Area</span>
                <span className="font-mono font-bold text-emerald-800 text-sm mt-0.5 block">{parcel.areaAcres} Acres</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Land Classification</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{parcel.landType}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">GIS Centroid Coordinates</span>
                <span className="font-mono text-slate-600 dark:text-slate-400 mt-0.5 block">{parcel.latitude?.toFixed(4) || '28.8524'}, {parcel.longitude?.toFixed(4) || '77.0932'}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Title Verification</span>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mt-0.5 ${
                  parcel.verificationStatus === 'Verified' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400'
                }`}>
                  {parcel.verificationStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Submitted Documents & Verification Engine */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                <FileCheck2 className="w-4 h-4 text-blue-800" />
                <span>Statutory Revenue Documents & OCR Vetting</span>
              </h2>

              <button
                onClick={() => navigate('/officer/documents/ocr')}
                className="text-xs font-bold text-blue-900 hover:underline cursor-pointer"
              >
                Launch AI OCR Studio →
              </button>
            </div>

            <div className="space-y-3">
              {parcelDocs.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-3 text-center">
                  No documents uploaded for this parcel yet.
                </div>
              ) : (
                parcelDocs.map(doc => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                          <span>{doc.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">[{doc.documentType}]</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Uploaded: {doc.uploadDate} • Size: {doc.fileSize}
                        </div>
                        {doc.ocrData && (
                          <div className="text-[10px] text-emerald-800 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-900/30 px-2 py-0.5 rounded mt-1.5 font-mono inline-block">
                            ✓ OCR Parsed: Khasra {doc.ocrData.khasraNumber} • Confidence {doc.ocrData.confidenceScore}%
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        doc.status === 'Verified' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' :
                        doc.status === 'Rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400'
                      }`}>
                        {doc.status}
                      </span>

                      {doc.status !== 'Verified' && (
                        <button
                          onClick={() => handleVerifyDoc(doc.id, 'Verified')}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors cursor-pointer"
                        >
                          Verify
                        </button>
                      )}

                      {doc.status !== 'Rejected' && (
                        <button
                          onClick={() => handleVerifyDoc(doc.id, 'Rejected')}
                          className="px-2.5 py-1 rounded bg-slate-200 hover:bg-red-100 hover:text-red-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Col 3: Statutory Compensation Breakdown (RFCTLARR 2013) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-6">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-100 flex items-center space-x-2">
              <IndianRupee className="w-4 h-4 text-emerald-700" />
              <span>RFCTLARR 2013 Award Matrix</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Notified Circle Rate (per Acre):</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">₹{(parcel.circleRatePerAcre).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Base Land Value ({parcel.areaAcres} Acres):</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">₹{(parcel.marketValueTotal).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Multiplier Factor (Rural/Urban):</span>
                <span className="font-mono font-semibold text-blue-900 dark:text-blue-400">1.00x</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 bg-amber-50/70 dark:bg-amber-900/20 p-2 rounded">
                <div>
                  <span className="font-bold text-amber-900 dark:text-amber-500 block">100% Statutory Solatium:</span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-600">Mandated under Sec 30(1)</span>
                </div>
                <span className="font-mono font-bold text-amber-900 dark:text-amber-500 self-center">
                  + ₹{(parcel.solatiumAmount).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Structural & Tree Valuation:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">₹{(parcel.additionalAssetValue).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between py-2 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                <span className="font-bold text-emerald-950 dark:text-emerald-100 text-sm">Total Award Amount:</span>
                <span className="font-mono font-black text-emerald-950 dark:text-emerald-100 text-base">
                  ₹{(parcel.totalCompensation).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Bank Disbursement Status */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                PFMS Direct Benefit Transfer
              </h3>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1.5">
                <div><span className="text-slate-400">Bank:</span> <strong className="text-slate-800 dark:text-slate-200">{comp?.bankName || 'State Bank of India'}</strong></div>
                <div><span className="text-slate-400">Account:</span> <strong className="text-slate-800 dark:text-slate-200 font-mono">{comp?.bankAccountMasked || '****4821'}</strong></div>
                <div><span className="text-slate-400">IFSC:</span> <strong className="text-slate-800 dark:text-slate-200 font-mono">{comp?.ifscCode || 'SBIN0001234'}</strong></div>
                <div>
                  <span className="text-slate-400">Disbursement Status:</span>{' '}
                  <strong className={`font-bold ${parcel.compensationStatus === 'Paid' ? 'text-emerald-700 dark:text-emerald-400' : 'text-blue-700 dark:text-blue-400'}`}>
                    {parcel.compensationStatus}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
