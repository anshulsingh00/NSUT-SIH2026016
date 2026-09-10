import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Save, ShieldAlert, Bell, Globe, Layout, Lock } from 'lucide-react';
import { SystemSettings as SystemSettingsType } from '../../types';

export const SystemSettings: React.FC = () => {
  const { settings, updateSettings } = useApp();
  
  const [formData, setFormData] = useState<SystemSettingsType>(settings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.maintenanceMode && !window.confirm('WARNING: Enabling maintenance mode will block all non-admin access. Are you sure you want to proceed?')) {
      return;
    }
    
    setIsSaving(true);
    // Simulate network delay
    setTimeout(() => {
      updateSettings(formData);
      setIsSaving(false);
    }, 600);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden font-sans">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Settings className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            <span>System Configuration</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage global application settings and security policies.</p>
        </div>
      </div>
      
      <form onSubmit={handleSave} className="p-6 space-y-8">
        
        {/* General Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Layout className="w-4 h-4 text-blue-600" />
            <span>General Application Settings</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="appName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Application Name <span className="text-red-500 ml-1">*</span>
              </label>
              <input 
                id="appName"
                required
                type="text"
                value={formData.appName}
                onChange={e => setFormData({...formData, appName: e.target.value})}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-shadow"
              />
            </div>
            <div>
              <label htmlFor="organizationName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Organization Name <span className="text-red-500 ml-1">*</span>
              </label>
              <input 
                id="organizationName"
                required
                type="text"
                value={formData.organizationName}
                onChange={e => setFormData({...formData, organizationName: e.target.value})}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-shadow"
              />
            </div>
            <div>
              <label htmlFor="supportEmail" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Support Email <span className="text-red-500 ml-1">*</span>
              </label>
              <input 
                id="supportEmail"
                required
                type="email"
                value={formData.supportEmail}
                onChange={e => setFormData({...formData, supportEmail: e.target.value})}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-shadow"
              />
            </div>
            <div>
              <label htmlFor="defaultLanguage" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Default Language <span className="text-red-500 ml-1">*</span>
              </label>
              <select 
                id="defaultLanguage"
                value={formData.defaultLanguage}
                onChange={e => setFormData({...formData, defaultLanguage: e.target.value as 'EN' | 'HI'})}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-shadow"
              >
                <option value="EN">English</option>
                <option value="HI">Hindi (हिन्दी)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Security & Access Control</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="sessionTimeoutMinutes" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Session Timeout (Minutes) <span className="text-red-500 ml-1">*</span>
              </label>
              <input 
                id="sessionTimeoutMinutes"
                required
                type="number"
                min={5}
                max={1440}
                value={formData.sessionTimeoutMinutes}
                onChange={e => setFormData({...formData, sessionTimeoutMinutes: parseInt(e.target.value)})}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 transition-shadow"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Automatically log users out after inactivity.</p>
            </div>
            <div className="flex flex-col space-y-4 justify-center mt-6">
              <label className="flex items-start space-x-3 cursor-pointer p-3 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <input 
                  type="checkbox"
                  checked={formData.twoFactorAuthRequired}
                  onChange={e => setFormData({...formData, twoFactorAuthRequired: e.target.checked})}
                  className="w-4 h-4 mt-0.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <div>
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200">Enforce Two-Factor Authentication</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Require 2FA for all administrative officers.</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Advanced / Global */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>Global Preferences</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="flex items-start space-x-3 cursor-pointer p-3 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <input 
                type="checkbox"
                checked={formData.notificationsEnabled}
                onChange={e => setFormData({...formData, notificationsEnabled: e.target.checked})}
                className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                  <Bell className="w-4 h-4" />
                  <span>System Notifications</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enable email and portal alerts for important events.</div>
              </div>
            </label>

            <label className={`flex items-start space-x-3 cursor-pointer p-3 rounded-md border transition-colors ${formData.maintenanceMode ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              <input 
                type="checkbox"
                checked={formData.maintenanceMode}
                onChange={e => setFormData({...formData, maintenanceMode: e.target.checked})}
                className="w-4 h-4 mt-0.5 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
              />
              <div>
                <div className={`text-sm font-medium flex items-center space-x-1.5 ${formData.maintenanceMode ? 'text-rose-800' : 'text-slate-800 dark:text-slate-200'}`}>
                  <Lock className="w-4 h-4" />
                  <span>Maintenance Mode</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Suspend all non-admin access for system upgrades.</div>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button 
            type="submit"
            disabled={isSaving}
            className={`px-6 py-2.5 rounded-md shadow-sm font-medium text-sm flex items-center space-x-2 transition-all ${
              isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800 cursor-pointer'
            } text-white`}
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Saving Configurations...' : 'Save Configuration'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
