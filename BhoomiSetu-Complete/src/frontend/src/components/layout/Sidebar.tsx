import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  FolderKanban,
  MapPin,
  FileCheck2,
  IndianRupee,
  Map as MapIcon,
  AlertOctagon,
  Bell,
  BarChart3,
  UserCheck,
  Users,
  Building2,
  FileClock,
  Settings,
  Landmark,
  FileSearch,
  Bot
} from 'lucide-react';


// Nav item shape - declared explicitly so optional properties (badge, isNew)
// are recognised on every item, not just the ones that happen to set them.
interface NavItem {
  label: string;
  path: string;
  icon: React.ForwardRefExoticComponent<any>;
  badge?: number | string;
  badgeColor?: string;
  isNew?: boolean;
}

export const Sidebar: React.FC = () => {
  const { currentRole, currentRoute, navigate, riskAlerts, notifications, documents, currentUser } = useApp();

  if (currentRole === 'PUBLIC') return null;

  const pendingDocsCount = documents.filter(d => d.status === 'Pending' || d.status === 'Under Review').length;
  const activeRisksCount = riskAlerts.filter(r => r.status === 'ACTIVE').length;
  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  const officerNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/officer/dashboard', icon: LayoutDashboard },
    { label: 'Projects', path: '/officer/projects', icon: FolderKanban },
    { label: 'Land Parcels', path: '/officer/land-parcels', icon: MapPin },
    {
      label: 'Documents',
      path: '/officer/documents',
      icon: FileCheck2,
      badge: pendingDocsCount > 0 ? pendingDocsCount : undefined,
      badgeColor: 'bg-amber-400/20 text-amber-300 border-amber-500/30'
    },
    { label: 'Compensation', path: '/officer/compensation', icon: IndianRupee },
    { label: 'GIS Map', path: '/officer/map', icon: MapIcon },
    {
      label: 'Risk Monitor',
      path: '/officer/risk-monitor',
      icon: AlertOctagon,
      badge: activeRisksCount > 0 ? activeRisksCount : undefined,
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30'
    },
    { label: 'Analytics', path: '/officer/reports', icon: BarChart3 },
    {
      label: 'Notifications',
      path: '/officer/notifications',
      icon: Bell,
      badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    },
    { label: 'Officer Profile', path: '/officer/profile', icon: UserCheck }
  ];

  const landownerNavItems: NavItem[] = [
    { label: 'Citizen Dashboard', path: '/landowner/dashboard', icon: LayoutDashboard },
    { label: 'My Land Parcels', path: '/landowner/my-land', icon: MapPin },
    { label: 'Document Vault', path: '/landowner/documents', icon: FileCheck2 },
    { label: 'Compensation & DBT', path: '/landowner/compensation', icon: IndianRupee },
    {
      label: 'Notices & Alerts',
      path: '/landowner/notifications',
      icon: Bell,
      badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    },
    { label: 'Citizen KYC Profile', path: '/landowner/profile', icon: UserCheck }
  ];

  const adminNavItems: NavItem[] = [
    { label: 'System Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'User & Officers', path: '/admin/users', icon: Users },
    { label: 'Department Master', path: '/admin/departments', icon: Building2 },
    { label: 'Project Governance', path: '/admin/projects', icon: FolderKanban },
    { label: 'Audit Trail', path: '/admin/audit-logs', icon: FileClock },
    { label: 'SLA & Settings', path: '/admin/settings', icon: Settings }
  ];

  let items = officerNavItems;
  if (currentRole === 'LANDOWNER') items = landownerNavItems;
  else if (currentRole === 'ADMIN') items = adminNavItems;

  return (
    <aside className="w-64 shrink-0 bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between hidden md:flex overflow-hidden transition-colors">
      <div>
        <div className="p-5 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-sm text-white shadow-sm">
              B
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              BhoomiSetu
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-medium">
            {currentRole === 'OFFICER' ? 'Officer Workspace' : currentRole === 'LANDOWNER' ? 'Citizen Services' : 'Apex Control Plane'}
          </p>
        </div>

        <nav className="p-3 space-y-1">
          {items.map(item => {
            const Icon = item.icon;
            const isActive = currentRoute === item.path || (item.path !== '/' && currentRoute.startsWith(item.path) && item.path.length > 8);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all cursor-pointer ${isActive
                    ? 'bg-blue-50 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400 font-semibold border border-blue-200 dark:border-blue-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white dark:hover:text-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800/60 font-medium'
                  }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center space-x-1">
                  {item.isNew && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 uppercase">
                      AI
                    </span>
                  )}
                  {item.badge !== undefined && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Pill */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center text-sm font-bold text-slate-700 dark:text-slate-200 shrink-0">
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div className="truncate">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{currentUser?.name || 'Authorized Officer'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {currentUser?.designation || currentUser?.role || 'Senior Officer'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
