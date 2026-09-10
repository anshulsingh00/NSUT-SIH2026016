import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  MapPin,
  ArrowRight,
  Clock,
  TrendingUp,
  AlertOctagon,
  Building2,
  Calendar
} from 'lucide-react';
import { ProjectStatus } from '../../types';

export const ProjectList: React.FC = () => {
  const { projects, navigate } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');

  const departments = Array.from(new Set(projects.map(p => p.department)));

  const filteredProjects = projects.filter(p => {
    const matchesSearch =
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.villages.some(v => v.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesDept = departmentFilter === 'ALL' || p.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-sans">
            Land Acquisition Projects Master
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage public infrastructure corridors, track land requirements, and oversee statutory milestones.
          </p>
        </div>

        <button
          onClick={() => navigate('/officer/projects/create')}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Project</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by Project ID, Name, District, or Village..."
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-shadow"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 text-sm text-slate-700 dark:text-slate-300">
            <Filter className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <label htmlFor="statusFilter" className="font-medium">Status:</label>
          </div>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-shadow cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="In Progress">In Progress</option>
            <option value="Near Completion">Near Completion</option>
            <option value="Completed">Completed</option>
            <option value="Delayed">Delayed</option>
          </select>

          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className="border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800"
          >
            <option value="ALL">All Departments</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Project ID</th>
                <th className="py-3 px-4">Project Name</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Total Land</th>
                <th className="py-3 px-4">Acquired</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 text-xs italic">
                    No projects found matching the selected search and filters.
                  </td>
                </tr>
              ) : (
                filteredProjects.map(proj => (
                  <tr key={proj.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-900 dark:text-blue-400">
                      {proj.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div
                        onClick={() => navigate('/officer/projects/:id', { id: proj.id })}
                        className="font-bold text-slate-900 dark:text-white hover:text-blue-800 dark:hover:text-blue-400 cursor-pointer"
                      >
                        {proj.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{proj.projectType}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 dark:text-slate-200 font-medium">{proj.district}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">{proj.state}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {proj.department}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {proj.totalAreaAcres} Acres
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-emerald-800 dark:text-emerald-400">
                      {proj.acquiredAreaAcres} Acres
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${proj.progressPercentage >= 80 ? 'bg-emerald-600' :
                                proj.progressPercentage >= 50 ? 'bg-blue-600' : 'bg-amber-500'
                              }`}
                            style={{ width: `${proj.progressPercentage}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">{proj.progressPercentage}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${proj.status === 'Completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50' :
                          proj.status === 'Near Completion' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-400 border border-teal-200 dark:border-teal-800/50' :
                            proj.status === 'Delayed' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800/50' :
                              'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50'
                        }`}>
                        {proj.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                      {proj.lastUpdated}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate('/officer/projects/:id', { id: proj.id })}
                        className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-900 dark:text-blue-400 font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
