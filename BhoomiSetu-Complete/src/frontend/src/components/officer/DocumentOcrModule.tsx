import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileCheck2, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Sparkles, 
  Search, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  X, 
  Building2,
  RefreshCw,
  Eye
} from 'lucide-react';
import { DocumentItem } from '../../types';

export const DocumentOcrModule: React.FC = () => {
  const { documents, parcels, verifyDocument, updateParcelStatus, showToast } = useApp();

  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || 'DOC-001');
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    doc.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.parcelId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedDoc = documents.find(d => d.id === selectedDocId) || documents[0];
  const associatedParcel = parcels.find(p => p.id === selectedDoc?.parcelId);

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      showToast(
        'AI OCR Extraction Complete',
        'Extracted Khasra No, Khatauni No, Owner Name, and Acreage with 98.4% confidence.',
        'success'
      );
    }, 1200);
  };

  const handleVerify = () => {
    if (!selectedDoc) return;
    verifyDocument(selectedDoc.id, 'Verified', 'Verified against State Revenue Bhulekh Server (RoR)');
    if (associatedParcel) {
      updateParcelStatus(associatedParcel.id, 'Verified', 'Verified');
    }
  };

  const handleReject = () => {
    if (!selectedDoc) return;
    verifyDocument(selectedDoc.id, 'Rejected', 'Title discrepancy detected in father name spelling');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-sans">
            Document Verification
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review and verify uploaded Jamabandi, Khatauni records, and Sale deeds.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSimulateScan}
            disabled={isScanning}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-medium text-sm shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Running OCR...' : 'Run OCR Extraction'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Document Selector (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              Document Verification Queue ({filteredDocs.length})
            </h3>

            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, ID, or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white transition-colors"
              />
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredDocs.map(doc => {
                const isSelected = doc.id === selectedDocId;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`p-4 rounded-lg border text-sm cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between font-medium">
                      <span className="text-slate-900 dark:text-slate-200 truncate mr-2">{doc.title}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-md shrink-0 ${
                        doc.status === 'Verified' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                        doc.status === 'Rejected' ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
                      <span>Parcel: <strong className="font-medium text-slate-700 dark:text-slate-300">{doc.parcelId}</strong></span>
                      <span>{doc.fileSize}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Middle & Right: OCR Inspector Canvas (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedDoc && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              {/* Header */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Document ID: {selectedDoc.id}</span>
                  <h3 className="font-semibold text-base text-slate-900 dark:text-white">{selectedDoc.title}</h3>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleVerify}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm flex items-center space-x-2 cursor-pointer shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve & Verify</span>
                  </button>
                  <button
                    onClick={handleReject}
                    className="px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 font-medium text-sm flex items-center space-x-2 cursor-pointer shadow-sm"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              {/* Split View: Visual Preview on Left, Structured OCR on Right */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
                {/* Visual Simulated Document */}
                <div className="p-6 bg-slate-100/50 dark:bg-slate-800/20 flex flex-col justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4 flex items-center space-x-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                      <FileText className="w-4 h-4 text-blue-700 dark:text-blue-500" />
                      <span>Uploaded Scanned Preview</span>
                    </div>

                    {/* Simulated Indian Revenue Certificate */}
                    <div className="bg-amber-50/50 dark:bg-amber-900/5 p-6 rounded-lg border border-amber-200 dark:border-amber-900/30 shadow-sm font-serif text-sm text-slate-800 dark:text-slate-300 space-y-4 relative overflow-hidden">
                      <div className="text-center border-b border-amber-300 dark:border-amber-900/50 pb-3">
                        <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          GOVERNMENT OF NCT OF DELHI / REVENUE DEPARTMENT
                        </div>
                        <div className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">
                          FORM 7/12 — RECORD OF RIGHTS (JAMABANDI)
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tehsil: Alipur | Sub-Division: Narela</div>
                      </div>

                      <div className="space-y-2 font-sans text-sm">
                        <div><strong className="text-slate-700 dark:text-slate-400">Khasra No:</strong> {selectedDoc.ocrData?.khasraNumber || '45/12/1'}</div>
                        <div><strong className="text-slate-700 dark:text-slate-400">Khatauni Ref:</strong> {selectedDoc.ocrData?.khatauniNumber || '108/42'}</div>
                        <div><strong className="text-slate-700 dark:text-slate-400">Recorded Owner:</strong> {selectedDoc.ocrData?.ownerName || selectedDoc.ownerName}</div>
                        <div><strong className="text-slate-700 dark:text-slate-400">District:</strong> {selectedDoc.ocrData?.district || 'North Delhi'}</div>
                        <div><strong className="text-slate-700 dark:text-slate-400">Area:</strong> {selectedDoc.ocrData?.areaAcres || '2.40'} Acres</div>
                        <div><strong className="text-slate-700 dark:text-slate-400">Survey Ref:</strong> {selectedDoc.ocrData?.surveyNumber || '10293/A'}</div>
                      </div>

                      {/* Stamp */}
                      <div className="pt-4 flex justify-between items-end text-xs font-sans text-slate-600 dark:text-slate-400">
                        <div className="text-emerald-700 dark:text-emerald-500 font-semibold border border-emerald-600 dark:border-emerald-500 px-2 py-1 rounded">
                          OFFICIALLY CERTIFIED
                        </div>
                        <div className="text-center">
                          <div>Sd/- Tehsildar</div>
                          <div>Date: 12-Jan-2024</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                    <span>SHA-256 Checksum: c78a9f...e021 (Digitally signed)</span>
                  </div>
                </div>

                {/* Right: AI OCR Confidence & Mappings */}
                <div className="p-6 space-y-5 text-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      Extracted Metadata
                    </span>
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/50">
                      {selectedDoc.ocrData?.confidenceScore || 97.5}% OCR Confidence
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col space-y-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Khasra Number</span>
                      <span className="font-medium text-slate-900 dark:text-white text-base">{selectedDoc.ocrData?.khasraNumber || '45/12/1'}</span>
                      <span className="text-xs text-emerald-600 dark:text-emerald-500 flex items-center space-x-1 mt-1">
                        <Check className="w-3 h-3" />
                        <span>Matched against Cadastre</span>
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col space-y-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Khatauni Number</span>
                      <span className="font-medium text-slate-900 dark:text-white text-base">{selectedDoc.ocrData?.khatauniNumber || '108/42'}</span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col space-y-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verified Landowner Title</span>
                      <span className="font-medium text-slate-900 dark:text-white text-base">{selectedDoc.ocrData?.ownerName || selectedDoc.ownerName}</span>
                      <span className="text-xs text-emerald-600 dark:text-emerald-500 flex items-center space-x-1 mt-1">
                        <Check className="w-3 h-3" />
                        <span>Matches DigiLocker Aadhaar ID</span>
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col space-y-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Acreage & Classification</span>
                      <span className="font-medium text-slate-900 dark:text-white text-base">{selectedDoc.ocrData?.areaAcres || '2.40'} Acres</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                    <strong>Validation Summary:</strong> Zero title collisions found in Jamabandi records. All encumbrances clear. Ready for Section 23 Award approval.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
