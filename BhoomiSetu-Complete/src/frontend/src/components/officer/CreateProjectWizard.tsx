import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FolderKanban, 
  MapPin, 
  IndianRupee, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  Building2, 
  Layers, 
  FileText 
} from 'lucide-react';
import { ProjectStatus, ProjectStage, StageTimelineItem } from '../../types';

export const CreateProjectWizard: React.FC = () => {
  const { addProject, navigate } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [name, setName] = useState('Delhi–Panipat High Speed Logistics Link');
  const [department, setDepartment] = useState('National Highways Authority of India (NHAI)');
  const [projectType, setProjectType] = useState('Access-Controlled Expressway');
  const [state, setState] = useState('Delhi NCT & Haryana');
  const [district, setDistrict] = useState('North Delhi / Sonipat');
  const [villagesInput, setVillagesInput] = useState('Singhu, Kundli, Rai, Murthal');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [expectedCompletionDate, setExpectedCompletionDate] = useState('2028-06-30');
  const [description, setDescription] = useState('Greenfield eight-lane multimodal freight and logistics corridor linking outer Delhi freight depots to Haryana economic industrial zone.');

  const [totalAreaAcres, setTotalAreaAcres] = useState(850.5);
  const [parcelsCount, setParcelsCount] = useState(720);
  const [estimatedBudgetCr, setEstimatedBudgetCr] = useState(2400);

  const defaultStages: StageTimelineItem[] = [
    { stage: 'Project Created', label: 'Feasibility & Gazette Notification Sec 4(1)', status: 'COMPLETED', completedDate: new Date().toISOString().split('T')[0], targetDays: 30, actualDays: 1 },
    { stage: 'Land Identified', label: 'Revenue Cadastral Demarcation Sec 6', status: 'IN_PROGRESS', targetDays: 45 },
    { stage: 'Survey Completed', label: 'Joint Measurement Survey (JMS)', status: 'PENDING', targetDays: 60 },
    { stage: 'Documents Submitted', label: 'Landowner Claims & Title Deeds', status: 'PENDING', targetDays: 45 },
    { stage: 'Ownership Verified', label: '7/12 & Khatauni Revenue Verification', status: 'PENDING', targetDays: 30 },
    { stage: 'Valuation Completed', label: 'Circle Rate & Solatium Calculation', status: 'PENDING', targetDays: 30 },
    { stage: 'Compensation Approval', label: 'Competent Authority Award Sec 23', status: 'PENDING', targetDays: 10 },
    { stage: 'Payment Processing', label: 'Direct Benefit Transfer (PFMS / DBT)', status: 'PENDING', targetDays: 15 },
    { stage: 'Final Acquisition', label: 'Possession Certificate & Mutation', status: 'PENDING', targetDays: 20 },
    { stage: 'Project Completion', label: 'Civil Construction Handover', status: 'PENDING', targetDays: 15 }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const villages = villagesInput.split(',').map(v => v.trim()).filter(Boolean);

    const newId = addProject({
      name,
      department,
      projectType,
      state,
      district,
      villages,
      totalAreaAcres: Number(totalAreaAcres),
      parcelsCount: Number(parcelsCount),
      estimatedBudgetCr: Number(estimatedBudgetCr),
      startDate,
      expectedCompletionDate,
      progressPercentage: 10,
      status: 'In Progress',
      currentStage: 'Land Identified',
      delayRisk: 'LOW',
      description,
      coordinates: { lat: 28.9012, lng: 77.1124 },
      stages: defaultStages
    });

    navigate('/officer/projects/:id', { id: newId });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/officer/projects')}
          className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-sans">
            Create Land Acquisition Project
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Initialize new public infrastructure project, define land requirement, and establish statutory milestones.
          </p>
        </div>
      </div>

      {/* Stepper Progress */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="grid grid-cols-3 text-center text-xs font-bold">
          <div className={`pb-2 border-b-2 ${step >= 1 ? 'border-blue-900 text-blue-900' : 'border-slate-200 dark:border-slate-800 text-slate-400'}`}>
            1. Project Information
          </div>
          <div className={`pb-2 border-b-2 ${step >= 2 ? 'border-blue-900 text-blue-900' : 'border-slate-200 dark:border-slate-800 text-slate-400'}`}>
            2. Land Requirement
          </div>
          <div className={`pb-2 border-b-2 ${step === 3 ? 'border-blue-900 text-blue-900' : 'border-slate-200 dark:border-slate-800 text-slate-400'}`}>
            3. Review & Create
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Project Info */}
          {step === 1 && (
            <div className="space-y-8">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Step 1: General Project Information
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please provide the basic details and location for the new project.</p>
              </div>

              {/* Group: Basic Details */}
              <div className="space-y-5">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">Basic Details</h4>
                
                <div>
                  <label htmlFor="projectName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Project Title / Corridor Name <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    id="projectName"
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter the official project title"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-shadow"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Executing Department / Authority <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      id="department"
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-shadow"
                    >
                      <option value="National Highways Authority of India (NHAI)">National Highways Authority of India (NHAI)</option>
                      <option value="Public Works Department (PWD) Delhi NCR">Public Works Department (PWD) Delhi NCR</option>
                      <option value="Dedicated Freight Corridor Corp (Railways)">Dedicated Freight Corridor Corp (Railways)</option>
                      <option value="Delhi Metro Rail Corporation (DMRC)">Delhi Metro Rail Corporation (DMRC)</option>
                      <option value="Haryana State Industrial Development Corp (HSIIDC)">Haryana State Industrial Development Corp (HSIIDC)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="projectType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Project Classification / Type <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      id="projectType"
                      type="text"
                      required
                      value={projectType}
                      onChange={e => setProjectType(e.target.value)}
                      placeholder="e.g. Access-Controlled Expressway"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-shadow"
                    />
                  </div>
                </div>
              </div>

              {/* Group: Location Details */}
              <div className="space-y-5">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">Location Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      State / Union Territory <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      id="state"
                      type="text"
                      required
                      value={state}
                      onChange={e => setState(e.target.value)}
                      placeholder="e.g. Delhi NCT & Haryana"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-shadow"
                    />
                  </div>

                  <div>
                    <label htmlFor="district" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      District(s) <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      id="district"
                      type="text"
                      required
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      placeholder="e.g. North Delhi / Sonipat"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-shadow"
                    />
                  </div>
                </div>
              </div>

              {/* Group: Timeline & Scope */}
              <div className="space-y-5">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">Timeline & Scope</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Gazette Notification Start Date <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      id="startDate"
                      type="date"
                      required
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-shadow"
                    />
                  </div>

                  <div>
                    <label htmlFor="expectedCompletionDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Target Completion Date <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      id="expectedCompletionDate"
                      type="date"
                      required
                      value={expectedCompletionDate}
                      onChange={e => setExpectedCompletionDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-shadow"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Project Description & Alignment Scope
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Provide a brief overview of the project's goals and scope"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-shadow"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-medium text-sm flex items-center space-x-2 transition-colors cursor-pointer"
                >
                  <span>Proceed to Land Requirement</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Land Requirement */}
          {step === 2 && (
            <div className="space-y-8">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Step 2: Land Requirement & Affected Jurisdictions
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Specify the geographical impact and estimated acquisition budget.</p>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label htmlFor="totalAreaAcres" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Total Required Area (Acres) <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      id="totalAreaAcres"
                      type="number"
                      step="0.1"
                      required
                      value={totalAreaAcres}
                      onChange={e => setTotalAreaAcres(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-shadow"
                    />
                  </div>

                  <div>
                    <label htmlFor="parcelsCount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Estimated Number of Parcels <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      id="parcelsCount"
                      type="number"
                      required
                      value={parcelsCount}
                      onChange={e => setParcelsCount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-shadow"
                    />
                  </div>

                  <div>
                    <label htmlFor="estimatedBudgetCr" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Estimated Budget (₹ Cr) <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      id="estimatedBudgetCr"
                      type="number"
                      required
                      value={estimatedBudgetCr}
                      onChange={e => setEstimatedBudgetCr(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-shadow"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="villagesInput" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Affected Revenue Villages (Comma-separated) <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    id="villagesInput"
                    type="text"
                    required
                    value={villagesInput}
                    onChange={e => setVillagesInput(e.target.value)}
                    placeholder="e.g. Narela, Singhu, Kundli, Rai, Murthal"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-shadow"
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 block">
                    These villages will automatically be linked to cadastral survey maps.
                  </span>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-medium text-sm transition-colors cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-medium text-sm flex items-center space-x-2 transition-colors cursor-pointer"
                >
                  <span>Review & Verify</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Step 3: Review Project Parameters & Statutory Handover
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please verify all information before finalizing the project.</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-md border border-slate-200 dark:border-slate-700 text-sm space-y-4">
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  <div><span className="text-slate-500 dark:text-slate-400 block mb-0.5">Project Name:</span> <strong className="text-slate-900 dark:text-white">{name}</strong></div>
                  <div><span className="text-slate-500 dark:text-slate-400 block mb-0.5">Department:</span> <strong className="text-slate-900 dark:text-white">{department}</strong></div>
                  <div><span className="text-slate-500 dark:text-slate-400 block mb-0.5">Location:</span> <strong className="text-slate-900 dark:text-white">{district}, {state}</strong></div>
                  <div><span className="text-slate-500 dark:text-slate-400 block mb-0.5">Project Type:</span> <strong className="text-slate-900 dark:text-white">{projectType}</strong></div>
                  <div><span className="text-slate-500 dark:text-slate-400 block mb-0.5">Total Land:</span> <strong className="text-slate-900 dark:text-white font-mono">{totalAreaAcres} Acres</strong></div>
                  <div><span className="text-slate-500 dark:text-slate-400 block mb-0.5">Estimated Budget:</span> <strong className="text-slate-900 dark:text-white font-mono">₹{estimatedBudgetCr} Crores</strong></div>
                  <div><span className="text-slate-500 dark:text-slate-400 block mb-0.5">Target Parcels:</span> <strong className="text-slate-900 dark:text-white font-mono">{parcelsCount} Parcels</strong></div>
                  <div><span className="text-slate-500 dark:text-slate-400 block mb-0.5">Target Date:</span> <strong className="text-slate-900 dark:text-white">{expectedCompletionDate}</strong></div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Villages:</span> <span className="text-slate-800 dark:text-slate-200 font-medium">{villagesInput}</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-md text-sm text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Upon creation, the project will automatically register in the GIS Map, configure the 10 statutory RFCTLARR milestones, and generate an active monitoring dashboard.</span>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-medium text-sm transition-colors cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm flex items-center space-x-2 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Create Acquisition Project</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
