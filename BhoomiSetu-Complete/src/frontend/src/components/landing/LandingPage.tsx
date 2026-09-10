import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Landmark, 
  ArrowRight, 
  MapPin, 
  FileCheck2, 
  IndianRupee, 
  AlertOctagon, 
  Layers, 
  ShieldCheck, 
  Users, 
  BarChart3, 
  CheckCircle2, 
  Building2,
  FileText,
  Search,
  Lock,
  Compass,
  Cpu
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigate, loginAs, projects, parcels } = useApp();

  const workflowSteps = [
    { num: '01', title: 'Project Creation', desc: 'Gazette notification, scope demarcation & department allocation' },
    { num: '02', title: 'Land Identification', desc: 'Cadastral mapping, Khasra/Khatauni sync & parcel delineation' },
    { num: '03', title: 'Survey & Verification', desc: 'Joint measurement survey (JMS) & AI-assisted document vetting' },
    { num: '04', title: 'Valuation & Compensation', desc: 'Circle rate indexation, 100% RFCTLARR solatium & PFMS DBT' },
    { num: '05', title: 'Final Acquisition', desc: 'Possession certificate, revenue mutation & project civil handover' },
  ];

  const featureCards = [
    {
      icon: Layers,
      title: 'End-to-End Project Tracking',
      desc: 'Digitize complete land acquisition lifecycle across 10 statutory milestones with real-time progress indicators.'
    },
    {
      icon: MapPin,
      title: 'GIS-Based Land Monitoring',
      desc: 'Interactive cadastral GIS map with satellite overlays, polygon demarcation, and color-coded status visualizers.'
    },
    {
      icon: FileCheck2,
      title: 'Document Intelligence & OCR',
      desc: 'Automated 7/12 & Khatauni revenue record parsing with confidence scoring and instant field cross-verification.'
    },
    {
      icon: IndianRupee,
      title: 'Compensation & DBT Tracking',
      desc: 'Transparent valuation calculations under RFCTLARR Act 2013 with direct bank transfer integration and audit logs.'
    },
    {
      icon: AlertOctagon,
      title: 'Intelligent Delay Detection',
      desc: 'Rule-based bottleneck diagnostic engine alerting officers on SLA threshold breaches before legal disputes occur.'
    },
    {
      icon: Users,
      title: 'Transparent Landowner Portal',
      desc: 'Dedicated citizen workspace allowing affected families to track award status, view payments, and download award letters.'
    }
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-800 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#0c2340] text-white pt-14 pb-20 border-b border-blue-900">
        <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-25"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-900/80 border border-blue-700/60 text-blue-100 text-sm font-medium mb-6">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Secure Government Portal</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight font-sans leading-tight">
              Bhoomi<span className="text-amber-400">Setu</span>
            </h1>
            
            <p className="mt-3 text-xl sm:text-2xl text-blue-200 font-medium tracking-wide">
              "Connecting Land, People & Progress."
            </p>

            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
              A unified digital platform for transparent, efficient, and data-driven land acquisition management — connecting government authorities, executing agencies, and citizens in one centralized ecosystem.
            </p>

            {/* CTA Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/officer/dashboard')}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-lg transition-all hover:translate-y-[-1px] cursor-pointer"
              >
                <span>Explore Platform</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg bg-blue-900/90 hover:bg-blue-800 text-white font-semibold text-sm border border-blue-700 transition-all cursor-pointer"
              >
                <span>Portal Login</span>
              </button>

              <button
                onClick={() => navigate('/officer/map')}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4 text-amber-400" />
                <span>GIS Cadastral Map</span>
              </button>
            </div>

            {/* Quick 1-Click Persona Access */}
            <div className="mt-10 pt-8 border-t border-blue-900/80">
              <span className="text-sm font-medium text-slate-300 block mb-4">
                Select Your Access Role:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => loginAs('OFFICER')}
                  className="text-left p-4 rounded-lg bg-blue-900/50 hover:bg-blue-900 border border-blue-700/60 transition-colors cursor-pointer group"
                >
                  <div className="text-sm font-semibold text-white group-hover:text-blue-200 flex items-center justify-between">
                    <span>Officer Portal</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-200" />
                  </div>
                  <div className="text-xs text-slate-300 mt-1">S.K. Rathore (SLAO Delhi)</div>
                </button>

                <button
                  onClick={() => loginAs('LANDOWNER')}
                  className="text-left p-4 rounded-lg bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-800/60 transition-colors cursor-pointer group"
                >
                  <div className="text-sm font-semibold text-white group-hover:text-emerald-300 flex items-center justify-between">
                    <span>Landowner Portal</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-300" />
                  </div>
                  <div className="text-xs text-slate-300 mt-1">Raj Kumar (Narela, 2.4 Acres)</div>
                </button>

                <button
                  onClick={() => loginAs('ADMIN')}
                  className="text-left p-4 rounded-lg bg-purple-950/40 hover:bg-purple-950/70 border border-purple-800/60 transition-colors cursor-pointer group"
                >
                  <div className="text-sm font-semibold text-white group-hover:text-purple-300 flex items-center justify-between">
                    <span>Admin Oversight</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-300" />
                  </div>
                  <div className="text-xs text-slate-300 mt-1">Dr. Rajesh Meena, IAS (DG)</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time National Infrastructure Metrics Bar */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            <div className="pt-2 sm:pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-sans">24</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Monitored Projects</div>
            </div>
            <div className="pt-4 sm:pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-blue-900 font-sans">8,420</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Total Land Parcels</div>
            </div>
            <div className="pt-4 sm:pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-700 font-sans">5,720</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Acquired Parcels (68%)</div>
            </div>
            <div className="pt-4 sm:pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-amber-700 font-sans">₹14,820 Cr</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Disbursed Compensation</div>
            </div>
          </div>
        </div>
      </section>

      {/* End-to-End Workflow Timeline Stepper */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-blue-800 uppercase tracking-widest">
            Statutory Workflow Engine
          </h2>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
            Standardized 5-Phase Land Acquisition Pipeline
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Structured according to the Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement (RFCTLARR) Act, 2013.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {workflowSteps.map((step, idx) => (
            <div 
              key={step.num}
              className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-xs relative hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="text-2xl font-black text-blue-900/20 group-hover:text-blue-600/30 transition-colors">
                {step.num}
              </div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-white mt-2 group-hover:text-blue-900 transition-colors">
                {step.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                {step.desc}
              </p>
              {idx < workflowSteps.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Problem Statement & Innovation Section */}
      <section className="bg-slate-100 dark:bg-slate-800/80 py-16 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-medium text-amber-800 bg-amber-100 px-3 py-1.5 rounded">
                Objective
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-6 leading-snug">
                Eliminating Bottlenecks in Public Infrastructure Land Acquisition
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
                Land acquisition involves multiple disjointed stakeholders: revenue inspectors, special acquisition collectors, highway planners, legal courts, and affected rural landowners. Traditional paper-heavy workflows suffer from:
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-start space-x-3 text-sm text-slate-700 dark:text-slate-300">
                  <div className="w-5 h-5 rounded bg-red-100 text-red-700 flex items-center justify-center shrink-0 mt-0.5">✕</div>
                  <span><strong>Silod Document Vetting:</strong> Title verification taking months due to physical mutation and manual 7/12 cross-checking.</span>
                </div>
                <div className="flex items-start space-x-3 text-sm text-slate-700 dark:text-slate-300">
                  <div className="w-5 h-5 rounded bg-red-100 text-red-700 flex items-center justify-center shrink-0 mt-0.5">✕</div>
                  <span><strong>Lack of Citizen Visibility:</strong> Landowners unaware of their award calculations, leading to avoidable court litigations.</span>
                </div>
                <div className="flex items-start space-x-3 text-sm text-slate-700 dark:text-slate-300">
                  <div className="w-5 h-5 rounded bg-red-100 text-red-700 flex items-center justify-center shrink-0 mt-0.5">✕</div>
                  <span><strong>Undetected Project Drift:</strong> Delays in statutory approvals remaining invisible until overall project budgets escalate.</span>
                </div>
              </div>

              <div className="mt-8 p-5 rounded-lg bg-blue-900 text-white text-sm leading-relaxed shadow-sm">
                <strong>The BhoomiSetu Solution:</strong> Unifies GIS boundary overlays, AI-driven OCR document verification, automated 100% solatium computation, proactive delay risk alerts, and direct landowner access onto a single auditable platform.
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">Live SLA Risk & Delay Engine</span>
                </div>
                <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">High Risk Detected</span>
              </div>

              <div className="mt-6 space-y-4">
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-center justify-between text-sm font-semibold text-red-900">
                    <span>Delhi–Meerut Connectivity Corridor</span>
                    <span>Stage: Compensation Approval</span>
                  </div>
                  <div className="text-xs text-red-700 mt-2">
                    Pending for <strong>24 days</strong> (Target SLA: 10 days) • +14 Days Overdue
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded mt-3 border border-red-100 font-mono shadow-sm">
                    <strong>Recommended Action:</strong> Convene urgent coordination meeting with SDM Alipur for batch clearance of 14 verified titles.
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center justify-between text-sm font-semibold text-emerald-900">
                    <span>Eastern Freight Corridor Extension</span>
                    <span>Stage: Valuation Completed</span>
                  </div>
                  <div className="text-xs text-emerald-700 mt-2">
                    On Track • 4 days elapsed of 30 days window.
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/officer/risk-monitor')}
                className="w-full mt-4 py-2 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
              >
                Inspect All Project Delay Alerts →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-blue-800 uppercase tracking-widest">
            Key Modules
          </h2>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
            Comprehensive Platform Features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map(feature => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800/90 shadow-xs hover:shadow-md transition-all hover:border-blue-300"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-base text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
