import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MapPin,
  Search,
  Filter,
  FileCheck2,
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye
} from 'lucide-react';
import { ParcelStatus, VerificationStatus } from '../../types';

export const LandParcelList: React.FC = () => {
  const { parcels, projects, navigate } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');

  const districts = Array.from(new Set(parcels.map(p => p.district)));

  const filteredParcels = parcels.filter(p => {
    const matchesSearch =
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.khasraNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.surveyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.village.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProj = projectFilter === 'ALL' || p.projectId === projectFilter;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesDistrict = districtFilter === 'ALL' || p.district === districtFilter;

    return matchesSearch && matchesProj && matchesStatus && matchesDistrict;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-sans">
            Cadastral Land Parcels Master
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track individual survey boundaries, landowner title verification, and award status.
          </p>
        </div>

        <button
          onClick={() => navigate('/officer/map')}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs cursor-pointer"
        >
          <MapPin className="w-4 h-4 text-amber-300" />
          <span>Switch to GIS Cadastral Map</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by Parcel ID (e.g. DL-10293), Owner (Raj Kumar), Khasra No, Village..."
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-shadow"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-shadow cursor-pointer"
          >
            <option value="ALL">All Projects</option>
            {projects.map(pr => (
              <option key={pr.id} value={pr.id}>{pr.id} — {pr.name.slice(0, 24)}...</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-shadow cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Verified">Verified</option>
            <option value="Pending">Pending</option>
            <option value="Disputed">Disputed</option>
            <option value="Acquired">Acquired</option>
            <option value="Compensation Pending">Compensation Pending</option>
            <option value="In Progress">In Progress</option>
          </select>

          <select
            value={districtFilter}
            onChange={e => setDistrictFilter(e.target.value)}
            className="border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800"
          >
            <option value="ALL">All Districts</option>
            {districts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Parcels Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Parcel ID</th>
                <th className="py-3 px-4">Owner Name</th>
                <th className="py-3 px-4">Village & District</th>
                <th className="py-3 px-4">Khasra / Khatauni</th>
                <th className="py-3 px-4">Area</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Compensation</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredParcels.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 text-xs italic">
                    No parcels found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredParcels.map(parcel => (
                  <tr key={parcel.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-900 dark:text-blue-400">
                      {parcel.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div
                        onClick={() => navigate('/officer/land-parcels/:id', { id: parcel.id })}
                        className="font-bold text-slate-900 dark:text-white hover:text-blue-800 cursor-pointer"
                      >
                        {parcel.ownerName}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">s/o {parcel.fatherName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 dark:text-slate-200 font-medium">{parcel.village}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{parcel.district}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {parcel.khasraNumber} <span className="text-slate-400">/</span> {parcel.khatauniNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium">
                      {parcel.areaAcres} Acres
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] text-blue-800 dark:text-blue-400 font-semibold">{parcel.projectId}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                          parcel.verificationStatus === 'Verified' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' :
                          parcel.verificationStatus === 'Rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
                          parcel.verificationStatus === 'Under Review' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                          'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400'
                        }`}>
                        {parcel.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                          parcel.compensationStatus === 'Paid' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' :
                          parcel.compensationStatus === 'Approved' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                          'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                        {parcel.compensationStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          parcel.status === 'Acquired' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50' :
                          parcel.status === 'Verified' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-400 border border-teal-200 dark:border-teal-800/50' :
                          parcel.status === 'Disputed' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800/50' :
                          parcel.status === 'Compensation Pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50' :
                          'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50'
                        }`}>
                        {parcel.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate('/officer/land-parcels/:id', { id: parcel.id })}
                        className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-900 dark:text-blue-400 font-bold text-[11px] transition-colors cursor-pointer"
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
