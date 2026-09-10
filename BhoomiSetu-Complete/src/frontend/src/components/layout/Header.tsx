import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Bell,
  Globe,
  User,
  LogOut,
  Shield,
  Layers,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Landmark,
  Sun,
  Moon,
  ChevronDown
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    currentRole,
    logout,
    loginAs,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    navigate,
    setIsSearchOpen,
    language,
    toggleLanguage,
    theme,
    toggleTheme,
    resetToInitialDemoData
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);

  // Filter notifications for current role or user
  const relevantNotifications = notifications.filter(n => {
    if (currentRole === 'ADMIN') return true;
    if (n.targetRole === 'ALL') return true;
    if (n.targetRole === currentRole) return true;
    if (currentUser?.id && n.targetUserId === currentUser.id) return true;
    return false;
  });

  const unreadCount = relevantNotifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      {/* Top Gov.in National Banner Bar */}
      <div className="bg-[#0b1f3a] text-slate-200 text-sm px-4 py-1.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 font-medium text-slate-300">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>भारत सरकार | Government of India</span>
          </div>
          <span className="hidden md:inline text-slate-500 dark:text-slate-400">•</span>
          <span className="hidden md:inline text-slate-400">National Land Acquisition Monitoring Portal</span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-1.5 hover:text-white transition-colors cursor-pointer text-xs font-medium bg-slate-800/80 px-2 py-1 rounded border border-slate-700"
            title="Toggle Language (English / हिंदी)"
          >
            <Globe className="w-3 h-3 text-amber-400" />
            <span>{language === 'EN' ? 'English | हिंदी' : 'हिंदी | English'}</span>
          </button>

          <button
            onClick={resetToInitialDemoData}
            className="hidden sm:flex items-center space-x-1 text-slate-400 hover:text-amber-300 transition-colors text-xs cursor-pointer"
            title="Reset to original state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          <button
            onClick={toggleTheme}
            className="flex items-center justify-center p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            title="Toggle Dark Mode"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main App Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Identity */}
          <div
            onClick={() => navigate(currentRole === 'OFFICER' ? '/officer/dashboard' : currentRole === 'LANDOWNER' ? '/landowner/dashboard' : currentRole === 'ADMIN' ? '/admin/dashboard' : '/')}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-md bg-linear-to-br from-blue-900 via-blue-800 to-slate-900 flex items-center justify-center text-amber-400 shadow-sm border border-blue-700">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-sans group-hover:text-blue-900 dark:group-hover:text-blue-400 transition-colors">
                  Bhoomi<span className="text-blue-700 dark:text-blue-500">Setu</span>
                </span>
                <span className="text-xs uppercase font-semibold tracking-wide px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {currentRole === 'OFFICER' ? 'Officer Portal' : currentRole === 'LANDOWNER' ? 'Citizen Portal' : currentRole === 'ADMIN' ? 'Admin Portal' : 'Public'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block mt-0.5">
                Connecting Land, People & Progress
              </p>
            </div>
          </div>

          {/* Center / Right Control Panel */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Global Search Bar Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 px-4 py-2 rounded-md border border-slate-200 dark:border-slate-700 transition-all w-40 sm:w-64 cursor-pointer"
            >
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate text-left flex-1">Search Project or Parcel ID...</span>
              <kbd className="hidden sm:inline-block text-xs font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-400">⌘K</kbd>
            </button>

            {/* Role Switcher Demo Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsRoleSwitcherOpen(!isRoleSwitcherOpen);
                  setIsNotifOpen(false);
                  setIsUserMenuOpen(false);
                }}
                className="flex items-center space-x-2 text-sm font-medium px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <Shield className="w-4 h-4 text-slate-500" />
                <span className="hidden md:inline">Role:</span>
                <span className="font-semibold">{currentRole}</span>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>

              {isRoleSwitcherOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Test Environment Role</p>
                  </div>
                  <button
                    onClick={() => {
                      loginAs('OFFICER');
                      setIsRoleSwitcherOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm flex items-center space-x-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors cursor-pointer ${currentRole === 'OFFICER' ? 'bg-blue-50 dark:bg-blue-900/40 font-medium text-blue-900 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">GO</div>
                    <div>
                      <div className="font-medium">Government Officer</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">S.K. Rathore (SLAO Delhi)</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      loginAs('LANDOWNER');
                      setIsRoleSwitcherOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm flex items-center space-x-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer ${currentRole === 'LANDOWNER' ? 'bg-emerald-50 dark:bg-emerald-900/40 font-medium text-emerald-900 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300'}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">LO</div>
                    <div>
                      <div className="font-medium">Citizen / Landowner</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Raj Kumar (Narela)</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      loginAs('ADMIN');
                      setIsRoleSwitcherOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm flex items-center space-x-3 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors cursor-pointer ${currentRole === 'ADMIN' ? 'bg-purple-50 dark:bg-purple-900/40 font-medium text-purple-900 dark:text-purple-300' : 'text-slate-700 dark:text-slate-300'}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">AD</div>
                    <div>
                      <div className="font-medium">System Administrator</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Dr. Rajesh Meena, IAS</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  setIsUserMenuOpen(false);
                  setIsRoleSwitcherOpen(false);
                }}
                className="relative p-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white dark:hover:text-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-slate-500" />
                      <span className="font-semibold text-sm text-slate-800 dark:text-white">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {relevantNotifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                        No notifications found.
                      </div>
                    ) : (
                      relevantNotifications.slice(0, 6).map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationRead(notif.id);
                            
                            if (currentRole === 'LANDOWNER') {
                              if (notif.type === 'COMPENSATION_UPDATE') {
                                navigate('/landowner/compensation');
                              } else if (notif.type === 'VERIFICATION_COMPLETED') {
                                navigate('/landowner/documents');
                              } else if (notif.parcelId) {
                                navigate(`/landowner/my-land/${notif.parcelId}`);
                              } else {
                                navigate('/landowner/dashboard');
                              }
                            } else if (notif.linkRoute) {
                              navigate(notif.linkRoute);
                            }
                            
                            setIsNotifOpen(false);
                          }}
                          className={`p-4 text-sm hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-start space-x-3 ${!notif.read ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''}`}
                        >
                          <div className="mt-1 shrink-0">
                            {notif.type === 'ACTION_REQUIRED' && (
                              <div className="p-1 rounded bg-amber-100 text-amber-800">
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </div>
                            )}
                            {notif.type === 'VERIFICATION_COMPLETED' && (
                              <div className="p-1 rounded bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </div>
                            )}
                            {notif.type === 'COMPENSATION_UPDATE' && (
                              <div className="p-1 rounded bg-blue-100 text-blue-800">
                                <FileText className="w-3.5 h-3.5" />
                              </div>
                            )}
                            {notif.type === 'SYSTEM_ALERT' && (
                              <div className="p-1 rounded bg-red-100 text-red-800">
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </div>
                            )}
                            {notif.type === 'PROJECT_UPDATE' && (
                              <div className="p-1 rounded bg-indigo-100 text-indigo-800">
                                <Layers className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className={`text-sm ${!notif.read ? 'font-semibold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>{notif.title}</span>
                              <span className="text-xs text-slate-400">{notif.timestamp}</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 line-clamp-2">{notif.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 text-center">
                    <button
                      onClick={() => {
                        navigate(currentRole === 'OFFICER' ? '/officer/notifications' : currentRole === 'LANDOWNER' ? '/landowner/notifications' : '/officer/notifications');
                        setIsNotifOpen(false);
                      }}
                      className="text-sm font-medium text-blue-700 hover:text-blue-800 cursor-pointer"
                    >
                      View All Notifications →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Login Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(!isUserMenuOpen);
                    setIsNotifOpen(false);
                    setIsRoleSwitcherOpen(false);
                  }}
                  className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors cursor-pointer"
                >
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div className="hidden lg:block text-left">
                    <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">{currentUser.name}</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{currentUser.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">{currentUser.email}</p>
                      {currentUser.designation && (
                        <p className="text-xs text-slate-500 font-medium mt-1">{currentUser.designation}</p>
                      )}
                    </div>

                    <div className="py-2">
                      <button
                        onClick={() => {
                          if (currentRole === 'OFFICER') navigate('/officer/profile');
                          else if (currentRole === 'LANDOWNER') navigate('/landowner/profile');
                          else navigate('/admin/settings');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center space-x-2 cursor-pointer"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        <span>My Profile</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-700 py-2">
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center space-x-2 cursor-pointer font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
