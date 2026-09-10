import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Landmark, Shield, User, Lock, Mail, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

export const LoginPage: React.FC = () => {
  const { loginAs, navigate, showToast } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>('OFFICER');
  const [email, setEmail] = useState('sk.rathore@delhi.gov.in');
  const [password, setPassword] = useState('bhoomi123');
  const [rememberMe, setRememberMe] = useState(true);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    // Seeded backend accounts (all share the password bhoomi123)
    if (role === 'OFFICER') {
      setEmail('sk.rathore@delhi.gov.in');
    } else if (role === 'LANDOWNER') {
      setEmail('rajkumar.narela@example.com');
    } else if (role === 'ADMIN') {
      setEmail('dg.landrecords@nic.in');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Real authentication: the backend verifies the bcrypt hash and returns
      // a signed JWT, which api.ts stores for later requests.
      const user = await api.login(email, password);
      showToast(
        'Signed in',
        `Authenticated as ${user.name} (${user.role_level}) via BhoomiSetu API.`,
        'success'
      );
      loginAs((user.role ?? selectedRole) as UserRole, email);
    } catch (err) {
      // Backend unreachable or bad credentials - fall back to the local demo
      // login so the prototype still works without the API running.
      const message = err instanceof Error ? err.message : 'Login failed';
      showToast('Offline demo mode', `${message}. Signed in locally.`, 'warning');
      loginAs(selectedRole, email);
    }
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-800 min-h-[calc(100vh-8rem)] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        {/* Portal Header Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-900 text-amber-400 shadow-md border border-blue-700 mb-3">
            <Landmark className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-sans tracking-tight">
            Bhoomi<span className="text-blue-800">Setu</span> Portal Login
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Official Land Acquisition & GIS Monitoring Single Sign-On
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Role Tabs */}
          <div className="grid grid-cols-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleRoleChange('OFFICER')}
              className={`py-3 text-center transition-colors cursor-pointer ${
                selectedRole === 'OFFICER'
                  ? 'bg-white dark:bg-slate-900 text-blue-900 border-b-2 border-blue-900 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'
              }`}
            >
              Govt Officer
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('LANDOWNER')}
              className={`py-3 text-center transition-colors cursor-pointer ${
                selectedRole === 'LANDOWNER'
                  ? 'bg-white dark:bg-slate-900 text-emerald-900 border-b-2 border-emerald-800 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'
              }`}
            >
              Landowner
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('ADMIN')}
              className={`py-3 text-center transition-colors cursor-pointer ${
                selectedRole === 'ADMIN'
                  ? 'bg-white dark:bg-slate-900 text-purple-900 border-b-2 border-purple-900 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'
              }`}
            >
              Administrator
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Official Email / Jan-Parichay ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="officer@gov.in or citizen@gmail.com"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-800 focus:border-blue-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Password / Digital Signature PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-800 focus:border-blue-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 text-blue-800 focus:ring-blue-800"
                  />
                  <span>Remember session on this device</span>
                </label>
                <span className="text-blue-800 hover:underline cursor-pointer text-[11px]">
                  Forgot credentials?
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Sign In to {selectedRole === 'OFFICER' ? 'Officer Portal' : selectedRole === 'LANDOWNER' ? 'Citizen Portal' : 'Admin Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick 1-Click Demo Section */}
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
              <div className="text-center mb-3">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Instant Demonstration Logins (1-Click)
                </span>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => loginAs('OFFICER')}
                  className="w-full py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-950 text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    <span>Login as Government Officer</span>
                  </div>
                  <span className="text-[10px] text-blue-700 font-normal">S.K. Rathore (SLAO)</span>
                </button>

                <button
                  type="button"
                  onClick={() => loginAs('LANDOWNER')}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>Login as Landowner</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-normal">Raj Kumar (Narela)</span>
                </button>

                <button
                  type="button"
                  onClick={() => loginAs('ADMIN')}
                  className="w-full py-2 px-3 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-950 text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                    <span>Login as Administrator</span>
                  </div>
                  <span className="text-[10px] text-purple-700 font-normal">Dr. Rajesh Meena, IAS</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security notice */}
        <div className="text-center mt-6 text-[11px] text-slate-500 dark:text-slate-400">
          <span>Official Portal of Ministry of Road Transport & Highways and Indian Railways. Unauthorized access is punishable under IT Act 2000.</span>
        </div>
      </div>
    </div>
  );
};
