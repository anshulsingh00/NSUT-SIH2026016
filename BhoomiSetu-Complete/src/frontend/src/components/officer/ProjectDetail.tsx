import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FolderKanban, 
  MapPin, 
  IndianRupee, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  AlertTriangle, 
  ArrowLeft, 
  Map as MapIcon, 
  FileCheck2, 
  User, 
  Download,
  Share2,
  ChevronRight
} from 'lucide-react';

export const ProjectDetail: React.FC = () => {
  const { routeParams, projects, parcels, updateProjectStage, navigate, showToast } = useApp();
  const projectId = routeParams.id || 'PRJ-001';

  const project = projects.find(p => p.id === projectId) || projects[0];
  const projectParcels = parcels.filter(p => p.projectId === project.id);

  const [activeTab, setActiveTab] = useState<'WORKFLOW' | 'PARCELS' | 'FINANCIALS'>('WORKFLOW');

  // Stats calculation
  const totalParcels = project.parcelsCount || projectParcels.length;
  const acquiredParcels = project.acquiredParcelsCount || projectParcels.filter(p => p.status === 'Acquired').length;
  const pendingParcels = projectParcels.filter(p => p.status === 'Pending' || p.status === 'In Progress').length;
  const disputedParcels = projectParcels.filter(p => p.status === 'Disputed').length;

  const handleStageClick = (index: number) => {
    const currentStageStatus = project.stages[index].status;
    let nextStatus: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'DELAYED' = 'COMPLETED';

    if (currentStageStatus === 'COMPLETED') nextStatus = 'IN_PROGRESS';
    else if (currentStageStatus === 'IN_PROGRESS') nextStatus = 'DELAYED';
    else if (currentStageStatus === 'DELAYED') nextStatus = 'COMPLETED';
    else nextStatus = 'IN_PROGRESS';

    updateProjectStage(project.id, index, nextStatus);
  };

  const handleExportDpr = () => {
    showToast(
      'Exporting Project DPR',
      `Detailed Project Report for ${project.name} (${project.id}) downloaded.`,
      'success'
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/officer/projects')}
            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-blue-900 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800/50">
                {project.id}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                project.status === 'Completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' :
                project.status === 'Delayed' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
              }`}>
                {project.status}
              </span>
              {project.delayRisk === 'HIGH' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-400 border border-amber-300 dark:border-amber-800/50 flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3 text-amber-700 dark:text-amber-500" />
                  <span>High Delay Risk</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-sans mt-1">
              {project.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {project.department} • {project.district}, {project.state}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => navigate('/officer/map')}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-300 dark:border-slate-700 cursor-pointer"
          >
            <MapIcon className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            <span>GIS Map View</span>
          </button>

          <button
            onClick={handleExportDpr}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export DPR Summary</span>
          </button>
        </div>
      </div>

      {/* Progress & Milestone Overview Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
          {/* Large Progress Indicator */}
          <div className="lg:col-span-1 flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`${
                    project.progressPercentage >= 80 ? 'text-emerald-600' :
                    project.progressPercentage >= 50 ? 'text-blue-700' : 'text-amber-500'
                  } transition-all duration-700 ease-out`}
                  strokeDasharray={`${project.progressPercentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-sans">{project.progressPercentage}%</span>
                <span className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Completed</span>
              </div>
            </div>
            <div className="mt-3 text-xs font-bold text-slate-800 dark:text-slate-200">
              Overall Acquisition Progress
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Current Stage: <strong className="text-blue-800 dark:text-blue-400">{project.currentStage}</strong>
            </div>
          </div>

          {/* Key Metric Blocks */}
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400">Total Required Land</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{project.totalAreaAcres} Acres</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Acquired: <strong>{project.acquiredAreaAcres} Acres</strong></div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400">Total Parcels</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{totalParcels}</div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">Acquired: {acquiredParcels}</div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400">Pending & Disputed</div>
              <div className="text-xl font-bold text-amber-700 dark:text-amber-500 mt-1 font-mono">{pendingParcels + disputedParcels}</div>
              <div className="text-[11px] text-red-600 dark:text-red-400 font-medium mt-0.5">Disputed: {disputedParcels} records</div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400">Sanctioned Budget</div>
              <div className="text-xl font-bold text-blue-900 dark:text-blue-400 mt-1 font-mono">₹{project.estimatedBudgetCr} Cr</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Disbursed: ₹{project.disbursedCompensationCr} Cr</div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400">Affected Villages</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{project.villages.length} Villages</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{project.villages.join(', ')}</div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400">Target Timeline</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">{project.expectedCompletionDate}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Started: {project.startDate}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center space-x-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('WORKFLOW')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'WORKFLOW'
              ? 'text-blue-900 border-b-2 border-blue-900'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'
          }`}
        >
          Statutory 10-Stage Workflow Timeline
        </button>
        <button
          onClick={() => setActiveTab('PARCELS')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'PARCELS'
              ? 'text-blue-900 border-b-2 border-blue-900'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'
          }`}
        >
          Assigned Land Parcels ({projectParcels.length})
        </button>
      </div>

      {/* Tab 1: Workflow Timeline */}
      {activeTab === 'WORKFLOW' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white font-sans">
                Statutory Acquisition Lifecycle (RFCTLARR 2013 Stages)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any stage tag to update status for demonstration simulation.
              </p>
            </div>
            <div className="flex items-center space-x-3 text-[11px]">
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span><span className="text-slate-700 dark:text-slate-300">Completed</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span><span className="text-slate-700 dark:text-slate-300">In Progress</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-red-500"></span><span className="text-slate-700 dark:text-slate-300">Delayed</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></span><span className="text-slate-700 dark:text-slate-300">Pending</span></span>
            </div>
          </div>

          <div className="space-y-3">
            {project.stages.map((stageItem, index) => {
              const isCompleted = stageItem.status === 'COMPLETED';
              const isInProgress = stageItem.status === 'IN_PROGRESS';
              const isDelayed = stageItem.status === 'DELAYED';

              return (
                <div
                  key={stageItem.stage}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                    isCompleted ? 'bg-emerald-50/40 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50' :
                    isInProgress ? 'bg-blue-50/60 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800 shadow-xs ring-1 ring-blue-300 dark:ring-blue-800' :
                    isDelayed ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800 shadow-xs ring-1 ring-red-300 dark:ring-red-800' :
                    'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 opacity-70'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                      isCompleted ? 'bg-emerald-600 text-white' :
                      isInProgress ? 'bg-blue-700 text-white' :
                      isDelayed ? 'bg-red-600 text-white' :
                      'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}>
                      {isCompleted ? '✓' : index + 1}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{stageItem.stage}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">— {stageItem.label}</span>
                      </div>
                      {stageItem.completedDate && (
                        <div className="text-[10px] text-emerald-800 dark:text-emerald-400 font-medium mt-0.5">
                          ✓ Completed on {stageItem.completedDate} (Took {stageItem.actualDays || stageItem.targetDays} days)
                        </div>
                      )}
                      {stageItem.notes && (
                        <div className="text-[11px] text-red-700 dark:text-red-400 font-mono mt-1 bg-red-100/70 dark:bg-red-900/30 p-1.5 rounded">
                          ⚠️ {stageItem.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => handleStageClick(index)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded cursor-pointer transition-colors ${
                        isCompleted ? 'bg-emerald-200 dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-400 hover:bg-emerald-300 dark:hover:bg-emerald-900/60' :
                        isInProgress ? 'bg-blue-200 dark:bg-blue-900/40 text-blue-950 dark:text-blue-400 hover:bg-blue-300 dark:hover:bg-blue-900/60' :
                        isDelayed ? 'bg-red-200 dark:bg-red-900/40 text-red-950 dark:text-red-400 hover:bg-red-300 dark:hover:bg-red-900/60' :
                        'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                      }`}
                      title="Click to toggle stage status in simulation"
                    >
                      {stageItem.status} (Click to toggle)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Assigned Land Parcels */}
      {activeTab === 'PARCELS' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200">Delineated Survey Parcels in {project.id}</span>
            <button
              onClick={() => navigate('/officer/land-parcels')}
              className="text-xs font-bold text-blue-900 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Open Full Parcels Master →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Parcel ID</th>
                  <th className="py-3 px-4">Owner Name</th>
                  <th className="py-3 px-4">Khasra / Khatauni</th>
                  <th className="py-3 px-4">Village</th>
                  <th className="py-3 px-4">Area (Acres)</th>
                  <th className="py-3 px-4">Total Compensation</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {projectParcels.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-900 dark:text-blue-400">{p.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{p.ownerName}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">{p.khasraNumber} / {p.khatauniNumber}</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{p.village}</td>
                    <td className="py-3 px-4 font-mono text-slate-900 dark:text-slate-300">{p.areaAcres}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">₹{(p.totalCompensation).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        p.status === 'Acquired' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' :
                        p.status === 'Disputed' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate('/officer/land-parcels/:id', { id: p.id })}
                        className="font-bold text-blue-800 dark:text-blue-400 hover:underline cursor-pointer text-xs"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
