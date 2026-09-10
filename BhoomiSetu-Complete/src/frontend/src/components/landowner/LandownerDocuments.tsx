import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileCheck2, 
  Upload, 
  CheckCircle2, 
  Clock, 
  X, 
  ShieldCheck, 
  FileText, 
  IndianRupee, 
  ArrowLeft,
  Bot
} from 'lucide-react';
import { DocumentItem } from '../../types';

export const LandownerDocuments: React.FC = () => {
  const { documents, uploadDocument, currentUser, showToast, navigate } = useApp();

  // Authentication Protection Guard
  React.useEffect(() => {
    if (!currentUser) {
      showToast('Authentication Required', 'Please sign in to access your digital revenue vault and 7/12 records.', 'warning');
      navigate('/login');
    }
  }, [currentUser, navigate, showToast]);

  if (!currentUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-md shadow-sm border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-md w-full">
          <div className="w-12 h-12 rounded bg-blue-50 text-blue-700 flex items-center justify-center mx-auto border border-blue-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Document Vault Locked</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Revenue records, Jamabandi proofs, and Aadhaar e-KYC documents are encrypted and accessible only by verified title owners.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-medium text-sm rounded transition-colors"
          >
            Sign In to Unlock Vault
          </button>
        </div>
      </div>
    );
  }

  const [dragActive, setDragActive] = useState(false);
  const [docType, setDocType] = useState<any>('Ownership Proof (7/12 & Khatauni)');
  const [docTitle, setDocTitle] = useState('Updated Jamabandi Copy 2026');

  // Filter docs for Raj Kumar (DL-10293)
  const myDocs = documents.filter(d => d.parcelId === 'DL-10293');

  const handleUploadSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    uploadDocument({
      parcelId: 'DL-10293',
      projectId: 'PRJ-001',
      ownerName: 'Raj Kumar',
      title: docTitle,
      documentType: docType,
      fileName: `${docTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      status: 'Under Review',
      fileSize: '1.8 MB',
      ocrData: {
        ownerName: 'Raj Kumar',
        surveyNumber: '10293/A',
        khasraNumber: '45/12/1',
        khatauniNumber: '108/42',
        village: 'Narela',
        district: 'North Delhi',
        state: 'Delhi',
        areaAcres: 2.40,
        circleRate: 1800000,
        confidenceScore: 97.5,
        rawExtractedText: 'Extracted 7/12 Record of Rights Jamabandi...'
      }
    });

    showToast(
      'Document Submitted',
      `${docTitle} successfully uploaded and queued for Land Acquisition Officer verification.`,
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
            className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              Land Title & Identity Documents
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Submit digital copies of your revenue records, Aadhaar e-KYC, and bank mandates.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/landowner/assistant')}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded bg-blue-700 hover:bg-blue-800 text-white font-medium text-sm transition-colors cursor-pointer"
        >
          <Bot className="w-4 h-4" />
          <span>Ask AI About Required Docs</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-base text-slate-900 dark:text-white flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Upload className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Upload New Revenue Record</span>
          </h2>

          <form onSubmit={handleUploadSimulate} className="space-y-4 text-sm">
            <div className="space-y-1.5">
              <label htmlFor="docType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Document Type <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="docType"
                value={docType}
                onChange={e => setDocType(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-shadow"
              >
                <option value="Ownership Proof (7/12 & Khatauni)">7/12 Jamabandi Record of Rights (RoR)</option>
                <option value="Identity Proof (Aadhaar/PAN)">Aadhaar Card / PAN Identity Proof</option>
                <option value="Compensation Form & Bank Mandate">Bank Passbook / Cancelled Cheque</option>
                <option value="No Objection Certificate (NOC)">NOC / Legal Heir Certificate</option>
                <option value="Survey & Demarcation Report">Survey & Demarcation Report</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="docTitle" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Document Description <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="docTitle"
                type="text"
                required
                value={docTitle}
                onChange={e => setDocTitle(e.target.value)}
                placeholder="e.g. Certified 7/12 Copy issued by Tehsildar"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-shadow"
              />
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={e => { e.preventDefault(); setDragActive(false); }}
              className={`border-2 border-dashed rounded-md p-6 text-center transition-colors cursor-pointer ${
                dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 bg-slate-50 dark:bg-slate-800/50'
              }`}
            >
              <Upload className="w-6 h-6 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
              <div className="font-medium text-slate-700 dark:text-slate-300 text-sm">
                Drag and drop PDF or scanned image
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Supports PDF, JPG, PNG up to 15MB
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-medium text-sm transition-colors cursor-pointer"
            >
              Upload Document
            </button>
          </form>
        </div>

        {/* Uploaded Documents List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-semibold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <FileCheck2 className="w-5 h-5 text-slate-400" />
              <span>My Submitted Documents ({myDocs.length})</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-5 py-3">Document Title</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Upload Date</th>
                  <th className="px-5 py-3">Size</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {myDocs.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900 dark:text-white flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{doc.title}</span>
                      </div>
                      {doc.rejectionReason && (
                        <div className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-start space-x-1">
                          <X className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{doc.rejectionReason}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs">{doc.documentType}</td>
                    <td className="px-5 py-4 text-xs whitespace-nowrap">{doc.uploadDate}</td>
                    <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{doc.fileSize}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                        doc.status === 'Verified' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' :
                        doc.status === 'Rejected' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50' : 
                        'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
