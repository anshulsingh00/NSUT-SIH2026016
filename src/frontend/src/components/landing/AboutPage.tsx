import React from 'react';
import { useApp } from '../../context/AppContext';
import { Landmark, Shield, FileText, CheckCircle2, ArrowRight, Award, Compass, Sparkles } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { navigate, loginAs } = useApp();

  return (
    <div className="bg-slate-50 dark:bg-slate-800 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-4 flex items-center space-x-2">
          <span onClick={() => navigate('/')} className="hover:underline cursor-pointer">Home</span>
          <span>/</span>
          <span className="font-semibold text-slate-900 dark:text-white">About BhoomiSetu Platform</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-[#0c2340] text-white p-8 border-b border-blue-900">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-800 text-amber-400 flex items-center justify-center">
                <Landmark className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-sans">About BhoomiSetu</h1>
                <p className="text-sm text-blue-200 mt-1">
                  Intelligent Land Acquisition Management & GIS Monitoring Platform
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
            {/* Section 1: Vision */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-800" />
                <span>Statutory Mandate & Vision</span>
              </h2>
              <p>
                <strong>BhoomiSetu</strong> was conceived as an end-to-end governance architecture for digitalizing and expediting the complex process of public land acquisition in India. Built with direct alignment to the <strong>Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement (RFCTLARR) Act, 2013</strong>, the platform ensures equitable, prompt, and dispute-free infrastructure development across national highways, freight corridors, railway expansions, and industrial growth clusters.
              </p>
            </div>

            {/* Section 2: Three Stakeholder Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-lg bg-blue-50/70 border border-blue-200">
                <h3 className="font-bold text-xs uppercase tracking-wider text-blue-900 mb-1">1. Government Officers</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Provides Land Acquisition Collectors (SLAO) and Competent Authorities with centralized project management, automated circle rate calculation, and GIS visual demarcation.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-200">
                <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-900 mb-1">2. Landowners & Citizens</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Empowers farmers and property owners with direct visibility into compensation awards, 100% solatium entitlement, and transparent Direct Benefit Transfer (DBT) disbursement status.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-purple-50/70 border border-purple-200">
                <h3 className="font-bold text-xs uppercase tracking-wider text-purple-900 mb-1">3. Ministry & Administrators</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Delivers cross-department oversight across NHAI, Railways, and PWDs, coupled with automated SLA delay detection and immutable audit trails.
                </p>
              </div>
            </div>

            {/* Section 3: Smart India Hackathon Problem Focus */}
            <div className="p-5 rounded-lg bg-slate-900 text-white space-y-3">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Award className="w-4 h-4" />
                <span>Smart India Hackathon Focus</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Traditional land acquisition in India often suffers from multi-year delays, manual revenue record discrepancies, and opaque compensation disbursements. BhoomiSetu solves these core challenges through:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-200">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>AI Document Intelligence:</strong> Automated OCR extraction from 7/12 & Khatauni revenue documents with confidence validation.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>GIS Cadastral Layering:</strong> Direct mapping of survey coordinates with project boundary right-of-way polygons.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>Predictive Delay Monitor:</strong> Early warning bottleneck detection when statutory approval stages exceed SLA thresholds.</span>
                </li>
              </ul>
            </div>

            {/* Navigation back */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => navigate('/')}
                className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white font-semibold cursor-pointer"
              >
                ← Return to Public Homepage
              </button>

              <button
                onClick={() => loginAs('OFFICER')}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <span>Launch Officer Workstation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
