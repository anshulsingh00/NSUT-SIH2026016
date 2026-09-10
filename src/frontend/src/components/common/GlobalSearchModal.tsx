import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, X, FolderKanban, MapPin, ArrowRight, User, Map, AlertOctagon } from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const { 
    isSearchOpen, 
    setIsSearchOpen, 
    projects, 
    parcels, 
    currentRole, 
    currentUser,
    navigate 
  } = useApp();

  const [query, setQuery] = useState('');

  // Handle hotkey Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const canViewProjects = currentUser && (currentRole === 'OFFICER' || currentRole === 'ADMIN');
  const canViewMap = currentUser && (currentRole === 'OFFICER' || currentRole === 'ADMIN');

  const matchingProjects = !canViewProjects 
    ? []
    : trimmed
      ? projects.filter(p => 
          p.id.toLowerCase().includes(trimmed) ||
          p.name.toLowerCase().includes(trimmed) ||
          p.department.toLowerCase().includes(trimmed) ||
          p.district.toLowerCase().includes(trimmed) ||
          p.villages.some(v => v.toLowerCase().includes(trimmed))
        )
      : projects.slice(0, 3);

  // PRIVACY GATING: Hide all parcel & owner personal details from unauthenticated users
  const visibleParcelsPool = !currentUser
    ? []
    : currentRole === 'LANDOWNER'
      ? parcels.filter(p => p.id === 'DL-10293' || (currentUser.name && p.ownerName.toLowerCase().includes(currentUser.name.toLowerCase())))
      : parcels;

  const matchingParcels = !currentUser
    ? []
    : trimmed
      ? visibleParcelsPool.filter(p =>
          p.id.toLowerCase().includes(trimmed) ||
          p.ownerName.toLowerCase().includes(trimmed) ||
          p.surveyNumber.toLowerCase().includes(trimmed) ||
          p.khasraNumber.toLowerCase().includes(trimmed) ||
          p.village.toLowerCase().includes(trimmed) ||
          p.district.toLowerCase().includes(trimmed) ||
          p.projectName.toLowerCase().includes(trimmed)
        )
      : visibleParcelsPool.slice(0, 3);

  const handleSelectProject = (id: string) => {
    setIsSearchOpen(false);
    setQuery('');
    if (currentRole === 'OFFICER' || currentRole === 'ADMIN') {
      navigate('/officer/projects/:id', { id });
    } else {
      navigate('/officer/projects/:id', { id });
    }
  };

  const handleSelectParcel = (id: string) => {
    setIsSearchOpen(false);
    setQuery('');
    if (currentRole === 'LANDOWNER') {
      navigate('/landowner/my-land/:id', { id });
    } else {
      navigate('/officer/land-parcels/:id', { id });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150 transition-colors">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-3 bg-slate-50/50 dark:bg-slate-800/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by Project ID, Parcel ID, Owner Name, Survey/Khasra No, Village, District..."
            className="w-full bg-transparent border-none outline-none focus:ring-0 text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:text-slate-400 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-xs text-slate-400 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white px-2 py-1 rounded bg-slate-200/70 dark:bg-slate-700/70 cursor-pointer transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
          {/* Projects Results */}
          {canViewProjects && (
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                <span className="flex items-center space-x-1.5">
                  <FolderKanban className="w-3.5 h-3.5 text-blue-600" />
                  <span>Projects ({matchingProjects.length})</span>
                </span>
              </div>

              {matchingProjects.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-1">No matching projects.</div>
              ) : (
                <div className="space-y-1.5">
                  {matchingProjects.map(proj => (
                    <div
                      key={proj.id}
                      onClick={() => handleSelectProject(proj.id)}
                      className="p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/60 dark:hover:bg-blue-900/30 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                          {proj.id.split('-')[1]}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-900 dark:group-hover:text-blue-400 flex items-center space-x-2 transition-colors">
                            <span>{proj.name}</span>
                            <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">({proj.id})</span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-2 mt-0.5">
                            <span>{proj.department}</span>
                            <span>•</span>
                            <span>{proj.district}</span>
                            <span>•</span>
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{proj.progressPercentage}% Completed</span>
                          </div>
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Land Parcels Results */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              <span className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Land Parcels & Title Owners {currentUser ? `(${matchingParcels.length})` : '(Protected)'}</span>
              </span>
            </div>

            {!currentUser ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center space-y-2">
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  🔒 Landowner personal dossiers and Khasra records are confidential.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    navigate('/login');
                  }}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-blue-800 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 underline cursor-pointer transition-colors"
                >
                  <span>Sign in to search authenticated land records</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : matchingParcels.length === 0 ? (
              <div className="text-xs text-slate-400 italic py-1">No matching land parcels found.</div>
            ) : (
              <div className="space-y-1.5">
                {matchingParcels.map(parcel => (
                  <div
                    key={parcel.id}
                    onClick={() => handleSelectParcel(parcel.id)}
                    className="p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/30 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                        {parcel.id.slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-900 dark:group-hover:text-emerald-400 flex items-center space-x-2 transition-colors">
                          <span className="font-semibold">{parcel.ownerName}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">[{parcel.id}]</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            parcel.status === 'Acquired' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300' :
                            parcel.status === 'Disputed' ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                          }`}>
                            {parcel.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-2 mt-0.5">
                          <span>Khasra: {parcel.khasraNumber}</span>
                          <span>•</span>
                          <span>Village: {parcel.village}, {parcel.district}</span>
                          <span>•</span>
                          <span>Area: {parcel.areaAcres} Acres</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">₹{(parcel.totalCompensation / 100000).toFixed(2)} Lakh</span>
                        </div>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search Modal Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between transition-colors">
          <div className="flex items-center space-x-3">
            <span>Tip: Search by Khasra number e.g. <strong className="text-slate-700 dark:text-slate-300">45/12/1</strong> or Owner <strong className="text-slate-700 dark:text-slate-300">Raj Kumar</strong></span>
          </div>
          {canViewMap && (
            <button
              onClick={() => {
                setIsSearchOpen(false);
                navigate('/officer/map');
              }}
              className="flex items-center space-x-1 text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-semibold cursor-pointer transition-colors"
            >
              <Map className="w-3 h-3" />
              <span>Open GIS Map</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
