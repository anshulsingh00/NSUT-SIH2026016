import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, User, FileText, MapPin, Loader2, Info } from 'lucide-react';

interface FormData {
  fullName: string;
  dob: string;
  contactNumber: string;
  email: string;
  govId: string;
  address: string;
  propertyId: string;
  khasraNumber: string;
  landArea: string;
  location: string;
}

export default function CitizenKYCProfile() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    dob: '',
    contactNumber: '',
    email: '',
    govId: '',
    address: '',
    propertyId: '',
    khasraNumber: '',
    landArea: '',
    location: '',
  });

  const [files, setFiles] = useState<{ idProof: File | null; landDeed: File | null }>({
    idProof: null,
    landDeed: null,
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kycStatus, setKycStatus] = useState<'Pending KYC' | 'Verified' | 'Rejected'>('Pending KYC');

  const idProofInputRef = useRef<HTMLInputElement>(null);
  const landDeedInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Partial<FormData> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.dob) newErrors.dob = 'Date of Birth is required';
    
    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.contactNumber) {
      newErrors.contactNumber = 'Contact Number is required';
    } else if (!phoneRegex.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Invalid phone number format (10 digits)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.govId.trim()) newErrors.govId = 'Government ID is required';
    if (!formData.address.trim()) newErrors.address = 'Residential Address is required';
    
    if (!formData.propertyId.trim()) newErrors.propertyId = 'Property ID is required';
    if (!formData.khasraNumber.trim()) newErrors.khasraNumber = 'Khasra/Khatauni Number is required';
    if (!formData.landArea.trim()) newErrors.landArea = 'Total Land Area is required';
    if (!formData.location.trim()) newErrors.location = 'Property Location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        alert('KYC Details Submitted Successfully!');
        // In a real app, status might change after submission or review
        // setKycStatus('Under Review');
      }, 1500);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>, type: 'idProof' | 'landDeed') => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFiles((prev) => ({ ...prev, [type]: droppedFile }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'idProof' | 'landDeed') => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFiles((prev) => ({ ...prev, [type]: selectedFile }));
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-8 flex flex-col sm:flex-row items-center sm:justify-between gap-6">
        <div className="flex items-center gap-6 flex-col sm:flex-row text-center sm:text-left">
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-md relative overflow-hidden shrink-0">
             <User size={40} className="text-slate-400 dark:text-slate-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              {formData.fullName || 'Citizen Name'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Landowner Profile</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center sm:items-end">
          <div className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium ${
            kycStatus === 'Verified' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50' :
            kycStatus === 'Rejected' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50' :
            'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50'
          }`}>
            {kycStatus === 'Verified' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {kycStatus}
          </div>
          {kycStatus === 'Pending KYC' && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
              <Info size={12} /> Complete profile to verify
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
              <User size={20} />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Personal Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Legal Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white dark:border-slate-700 focus:ring-2 focus:outline-none transition-shadow ${errors.fullName ? 'border-red-300 focus:ring-red-200' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'}`}
                placeholder="As per Government ID"
              />
              {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date of Birth <span className="text-red-500">*</span></label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white dark:border-slate-700 focus:ring-2 focus:outline-none transition-shadow ${errors.dob ? 'border-red-300 focus:ring-red-200' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'}`}
              />
              {errors.dob && <p className="text-xs text-red-500 mt-1">{errors.dob}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Contact Number <span className="text-red-500">*</span></label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white dark:border-slate-700 focus:ring-2 focus:outline-none transition-shadow ${errors.contactNumber ? 'border-red-300 focus:ring-red-200' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'}`}
                placeholder="10-digit mobile number"
              />
              {errors.contactNumber && <p className="text-xs text-red-500 mt-1">{errors.contactNumber}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address <span className="text-red-500">*</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white dark:border-slate-700 focus:ring-2 focus:outline-none transition-shadow ${errors.email ? 'border-red-300 focus:ring-red-200' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'}`}
                placeholder="your.email@example.com"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Government ID Number (Aadhaar/PAN) <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="govId"
                value={formData.govId}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white dark:border-slate-700 focus:ring-2 focus:outline-none transition-shadow ${errors.govId ? 'border-red-300 focus:ring-red-200' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'}`}
                placeholder="Enter ID Number"
              />
              {errors.govId && <p className="text-xs text-red-500 mt-1">{errors.govId}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Residential Address <span className="text-red-500">*</span></label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white dark:border-slate-700 focus:ring-2 focus:outline-none transition-shadow resize-none ${errors.address ? 'border-red-300 focus:ring-red-200' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'}`}
                placeholder="Street, City, State, ZIP"
              />
              {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
            </div>
          </div>
        </section>

        {/* Land Ownership Details */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
              <MapPin size={20} />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Land Ownership Details</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Property ID / Survey Number <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="propertyId"
                value={formData.propertyId}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white dark:border-slate-700 focus:ring-2 focus:outline-none transition-shadow ${errors.propertyId ? 'border-red-300 focus:ring-red-200' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-100'}`}
                placeholder="e.g. S-12345"
              />
              {errors.propertyId && <p className="text-xs text-red-500 mt-1">{errors.propertyId}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Khasra / Khatauni Number <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="khasraNumber"
                value={formData.khasraNumber}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white dark:border-slate-700 focus:ring-2 focus:outline-none transition-shadow ${errors.khasraNumber ? 'border-red-300 focus:ring-red-200' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-100'}`}
                placeholder="Land record details"
              />
              {errors.khasraNumber && <p className="text-xs text-red-500 mt-1">{errors.khasraNumber}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Land Area <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="landArea"
                value={formData.landArea}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white dark:border-slate-700 focus:ring-2 focus:outline-none transition-shadow ${errors.landArea ? 'border-red-300 focus:ring-red-200' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-100'}`}
                placeholder="in Hectares or Acres"
              />
              {errors.landArea && <p className="text-xs text-red-500 mt-1">{errors.landArea}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Property Location <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white dark:border-slate-700 focus:ring-2 focus:outline-none transition-shadow ${errors.location ? 'border-red-300 focus:ring-red-200' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-100'}`}
                placeholder="Village/Tehsil/District"
              />
              {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
            </div>
          </div>
        </section>

        {/* Document Upload */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <FileText size={20} />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Document Upload</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ID Proof Upload */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Government ID Proof <span className="text-red-500">*</span></label>
              <div 
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
                  files.idProof ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleFileDrop(e, 'idProof')}
                onClick={() => idProofInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  className="hidden" 
                  ref={idProofInputRef} 
                  onChange={(e) => handleFileSelect(e, 'idProof')}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <UploadCloud className={`mb-3 ${files.idProof ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500'}`} size={32} />
                {files.idProof ? (
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{files.idProof.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{(files.idProof.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Drag & drop your file here or <span className="text-blue-600 dark:text-blue-400 font-medium">browse</span></p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Supports PDF, JPG, PNG up to 5MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Land Deed Upload */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Land Deed / Registry Document <span className="text-red-500">*</span></label>
              <div 
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
                  files.landDeed ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleFileDrop(e, 'landDeed')}
                onClick={() => landDeedInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  className="hidden" 
                  ref={landDeedInputRef} 
                  onChange={(e) => handleFileSelect(e, 'landDeed')}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <UploadCloud className={`mb-3 ${files.landDeed ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500'}`} size={32} />
                {files.landDeed ? (
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{files.landDeed.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{(files.landDeed.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Drag & drop your file here or <span className="text-blue-600 dark:text-blue-400 font-medium">browse</span></p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Supports PDF, JPG, PNG up to 10MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Submit Action */}
        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-medium text-white transition-all
              ${isSubmitting 
                ? 'bg-indigo-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md active:scale-95'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Submitting KYC...
              </>
            ) : (
              'Submit KYC Details'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
