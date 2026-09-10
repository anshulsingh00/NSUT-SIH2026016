import React from 'react';
import { Landmark, ShieldCheck, Phone, Mail, HelpCircle, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { navigate } = useApp();

  return (
    <footer className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs border-t border-slate-200 dark:border-slate-800 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Portal Description */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-sm">
              <div className="w-6 h-6 rounded bg-blue-700 flex items-center justify-center text-amber-300">
                <Landmark className="w-4 h-4" />
              </div>
              <span>BhoomiSetu</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Intelligent Land Acquisition Management & GIS Monitoring Platform. Built as a prototype for transparent, efficient, and data-driven public infrastructure land acquisition under Smart India Hackathon.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>RFCTLARR Act 2013 Automated Framework</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider mb-3">Portals & Modules</h4>
            <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => navigate('/')} className="hover:text-blue-600 dark:hover:text-amber-400 transition-colors cursor-pointer">
                  Public Transparency Portal
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/officer/dashboard')} className="hover:text-blue-600 dark:hover:text-amber-400 transition-colors cursor-pointer">
                  Land Acquisition Officer (LAO) Workstation
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/landowner/dashboard')} className="hover:text-blue-600 dark:hover:text-amber-400 transition-colors cursor-pointer">
                  Landowner DBT & Document Portal
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/officer/map')} className="hover:text-blue-600 dark:hover:text-amber-400 transition-colors cursor-pointer">
                  GIS Cadastral Map Viewer
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-blue-600 dark:hover:text-amber-400 transition-colors cursor-pointer">
                  Statutory Guidelines & Mandate
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Key Integrations */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider mb-3">Gov Integrations</h4>
            <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Bhulekh / State Land Records (RoR)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>PFMS Direct Benefit Transfer (DBT)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>DigiLocker Aadhaar e-KYC Verification</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Survey of India GIS Georeferencing</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Helpdesk & Grievance */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider mb-3">Citizen Grievance Helpline</h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-slate-900 dark:text-white">1800-11-BHOOMI (Toll-Free)</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>support-bhoomi@nic.in</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>9:00 AM - 6:00 PM (Monday to Saturday)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-200 dark:border-slate-800 mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div>
            © 2026 BhoomiSetu Platform. Smart India Hackathon Prototype. Developed for Digital India & Public Infrastructure Transformation.
          </div>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <span className="text-slate-500 dark:text-slate-400">Standardized UI Compliant</span>
            <span>•</span>
            <span className="text-slate-500 dark:text-slate-400">STQC Security Audited</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
