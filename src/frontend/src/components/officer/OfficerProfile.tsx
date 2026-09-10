import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  User, 
  Shield, 
  MapPin, 
  Mail, 
  Phone, 
  Building, 
  Award,
  Bell,
  Lock,
  CheckCircle,
  Save
} from 'lucide-react';

export const OfficerProfile: React.FC = () => {
  const { currentUser, currentRole, showToast } = useApp();
  const [isSaving, setIsSaving] = useState(false);

  // Mock officer details (in a real app, these would come from the backend linked to currentUser.id)
  const [formData, setFormData] = useState({
    name: currentUser?.name || 'Officer',
    email: currentUser?.email || 'officer@bhoomisetu.gov.in',
    phone: '+91 98765 43210',
    designation: 'Land Acquisition Officer (LAO)',
    department: 'Revenue Department, Govt. of NCT of Delhi',
    jurisdiction: 'North West Delhi District',
    badgeId: 'LAO-DL-2023-894',
    status: 'Active Duty',
    emailAlerts: true,
    smsAlerts: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API delay
    setTimeout(() => {
      setIsSaving(false);
      showToast('Profile Updated', 'Your professional profile has been saved successfully.', 'success');
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Officer Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your official BhoomiSetu credentials and preferences.
          </p>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-slate-800 dark:bg-slate-950 relative">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="absolute bottom-4 right-4 flex items-center space-x-2 bg-emerald-500/90 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm shadow-sm border border-emerald-400/30">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Verified Official</span>
          </div>
        </div>
        
        {/* Avatar & Basic Info */}
        <div className="px-6 sm:px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="flex items-end space-x-5">
              <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-xl p-1 shadow-md border border-slate-200 dark:border-slate-700 shrink-0">
                <div className="w-full h-full bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500">
                  <User className="w-10 h-10" />
                </div>
              </div>
              <div className="pb-1">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {formData.name}
                </h2>
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center space-x-2 mt-1">
                  <Shield className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                  <span>{currentRole} Role</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Details Form */}
            <div className="md:col-span-2 space-y-8">
              
              {/* Professional Details */}
              <section>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 flex items-center">
                  <Award className="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400" />
                  Official Assignment
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Designation</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        name="designation"
                        value={formData.designation}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Badge ID / Employee Code</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Shield className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        name="badgeId"
                        value={formData.badgeId}
                        readOnly
                        className="w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-100 dark:bg-slate-800/50 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Department</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        readOnly
                        className="w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-100 dark:bg-slate-800/50 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Current Jurisdiction</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        name="jurisdiction"
                        value={formData.jurisdiction}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Contact Details */}
              <section>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Official Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Contact Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Settings & Security */}
            <div className="space-y-6">
              
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center">
                  <Bell className="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400" />
                  Notifications
                </h3>
                
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-slate-700 dark:text-slate-300">Email Alerts</span>
                    <input 
                      type="checkbox" 
                      name="emailAlerts"
                      checked={formData.emailAlerts}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-slate-700 dark:text-slate-300">SMS Alerts</span>
                    <input 
                      type="checkbox" 
                      name="smsAlerts"
                      checked={formData.smsAlerts}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                    />
                  </label>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400" />
                  Security
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Last login: Today at 09:41 AM from 10.0.0.45
                </p>
                <button className="w-full py-2 px-4 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
                  Change Password
                </button>
                <button className="w-full py-2 px-4 border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-md text-sm font-medium text-blue-700 dark:text-blue-400 transition-colors">
                  Setup 2FA / SSO
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerProfile;
