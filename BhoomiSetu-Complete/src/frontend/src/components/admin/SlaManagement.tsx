import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AlertOctagon, CheckCircle2, Clock, Filter, Plus, Search, Settings, ShieldAlert, Timer, Trash2, X } from 'lucide-react';
import { SlaRule, SlaPriority } from '../../types';

export const SlaManagement: React.FC = () => {
  const { slas, addSlaRule, updateSlaRule, deleteSlaRule, toggleSlaRuleStatus } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<SlaPriority | 'ALL'>('ALL');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSla, setEditingSla] = useState<SlaRule | null>(null);

  const [formData, setFormData] = useState<Partial<SlaRule>>({
    name: '',
    department: '',
    category: '',
    priority: 'Medium',
    responseTimeHours: 24,
    resolutionTimeHours: 168,
    escalationThresholdHours: 144,
    isActive: true
  });

  const getPriorityColor = (priority: SlaPriority) => {
    switch(priority) {
      case 'Critical': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'High': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Low': return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700';
    }
  };

  const filteredSlas = slas.filter(sla => {
    const matchesSearch = sla.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sla.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'ALL' || sla.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSla) {
      updateSlaRule(editingSla.id, formData);
    } else {
      addSlaRule(formData as Omit<SlaRule, 'id'>);
    }
    closeModal();
  };

  const openNewModal = () => {
    setEditingSla(null);
    setFormData({
      name: '',
      department: '',
      category: '',
      priority: 'Medium',
      responseTimeHours: 24,
      resolutionTimeHours: 168,
      escalationThresholdHours: 144,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (sla: SlaRule) => {
    setEditingSla(sla);
    setFormData(sla);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSla(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 mb-2">
            <Timer className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-sm">Active Rules</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{slas.filter(s => s.isActive).length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 mb-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <span className="font-semibold text-sm">Critical SLAs</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{slas.filter(s => s.priority === 'Critical').length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 mb-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-sm">Avg Compliance</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">94.2%</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 mb-2">
            <AlertOctagon className="w-5 h-5 text-rose-600" />
            <span className="font-semibold text-sm">Recent Breaches</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">12</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search SLAs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none w-64"
              />
            </div>
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as SlaPriority | 'ALL')}
                className="pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none appearance-none bg-white dark:bg-slate-900"
              >
                <option value="ALL">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
          <button 
            onClick={openNewModal}
            className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New SLA Rule</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                <th className="p-4">Rule Name</th>
                <th className="p-4">Department / Category</th>
                <th className="p-4">Target Times</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSlas.length > 0 ? (
                filteredSlas.map((sla) => (
                  <tr key={sla.id} className="hover:bg-slate-50 dark:bg-slate-800 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{sla.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{sla.id}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{sla.department}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{sla.category}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-700 dark:text-slate-300">Response: <span className="font-semibold">{sla.responseTimeHours}h</span></div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">Resolution: <span className="font-semibold">{sla.resolutionTimeHours}h</span></div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getPriorityColor(sla.priority)}`}>
                        {sla.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => toggleSlaRuleStatus(sla.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${sla.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 transition-transform ${sla.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => openEditModal(sla)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          if(window.confirm(`Delete SLA Rule ${sla.name}?`)) {
                            deleteSlaRule(sla.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No SLA rules found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingSla ? 'Edit SLA Rule' : 'Create New SLA Rule'}
              </h3>
              <button onClick={closeModal} className="p-1 text-slate-400 hover:text-slate-600 dark:text-slate-400 hover:bg-slate-200 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Rule Name</label>
                  <input 
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                    placeholder="e.g. Document Verification"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Priority</label>
                  <select 
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value as SlaPriority})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Department</label>
                  <input 
                    required
                    type="text"
                    value={formData.department}
                    onChange={e => setFormData({...formData, department: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                    placeholder="e.g. Revenue Department"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Category</label>
                  <input 
                    required
                    type="text"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                    placeholder="e.g. Verification"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Response Time (Hours)</label>
                  <input 
                    required
                    type="number"
                    min={1}
                    value={formData.responseTimeHours}
                    onChange={e => setFormData({...formData, responseTimeHours: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Resolution Time (Hours)</label>
                  <input 
                    required
                    type="number"
                    min={1}
                    value={formData.resolutionTimeHours}
                    onChange={e => setFormData({...formData, resolutionTimeHours: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Escalation Threshold (Hours)</label>
                  <input 
                    required
                    type="number"
                    min={1}
                    value={formData.escalationThresholdHours}
                    onChange={e => setFormData({...formData, escalationThresholdHours: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-md transition-colors flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingSla ? 'Save Changes' : 'Create Rule'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
