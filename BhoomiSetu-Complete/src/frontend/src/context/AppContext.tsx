import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  Project,
  LandParcel,
  DocumentItem,
  CompensationRecord,
  NotificationItem,
  AuditLogItem,
  RiskAlert,
  DepartmentInfo,
  DepartmentStatus,
  SlaRuleConfig,
  VerificationStatus,
  CompensationStatus,
  ParcelStatus,
  SlaRule,
  SystemSettings
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PROJECTS,
  INITIAL_PARCELS,
  INITIAL_DOCUMENTS,
  INITIAL_COMPENSATIONS,
  INITIAL_RISK_ALERTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_DEPARTMENTS,
  INITIAL_SLA_CONFIG,
  INITIAL_SLA_RULES,
  INITIAL_SETTINGS
} from '../data/mockData';

interface ToastInfo {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  currentUser: UserProfile | null;
  users: UserProfile[];
  currentRole: UserRole | 'PUBLIC';
  currentRoute: string;
  routeParams: Record<string, string>;
  projects: Project[];
  parcels: LandParcel[];
  documents: DocumentItem[];
  compensations: CompensationRecord[];
  riskAlerts: RiskAlert[];
  notifications: NotificationItem[];
  auditLogs: AuditLogItem[];
  departments: DepartmentInfo[];
  slaConfig: SlaRuleConfig;
  globalSearchQuery: string;
  isSearchOpen: boolean;
  toasts: ToastInfo[];
  language: 'EN' | 'HI';
  slas: SlaRule[];
  settings: SystemSettings;
  theme: 'light' | 'dark';

  // Actions
  loginAs: (role: UserRole, userEmail?: string) => void;
  logout: () => void;
  navigate: (path: string, params?: Record<string, string>) => void;
  setGlobalSearchQuery: (q: string) => void;
  setIsSearchOpen: (open: boolean) => void;
  showToast: (title: string, description: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  toggleLanguage: () => void;
  toggleTheme: () => void;

  // Project Actions
  addProject: (project: Omit<Project, 'id' | 'lastUpdated' | 'acquiredAreaAcres' | 'acquiredParcelsCount' | 'disbursedCompensationCr'>) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  updateProjectStage: (projectId: string, stageIndex: number, newStatus: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'DELAYED') => void;

  // Parcel Actions
  updateParcel: (id: string, updates: Partial<LandParcel>) => void;
  updateParcelStatus: (id: string, newStatus: ParcelStatus, verificationStatus?: VerificationStatus, compensationStatus?: CompensationStatus) => void;

  // Document & OCR Actions
  uploadDocument: (doc: Omit<DocumentItem, 'id' | 'uploadDate'>) => string;
  verifyDocument: (documentId: string, newStatus: VerificationStatus, remarks?: string) => void;

  // Compensation Actions
  updateCompensationStatus: (id: string, newStatus: CompensationStatus, txnId?: string) => void;
  approveCompensation: (id: string) => void;
  disbursePayment: (id: string) => void;

  // Delay & Risk Actions
  resolveRiskAlert: (id: string) => void;
  updateSlaConfig: (newConfig: Partial<SlaRuleConfig>) => void;

  // Notification Actions
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;

  // Audit Actions
  addAuditLog: (action: string, entityType: 'Project' | 'LandParcel' | 'Document' | 'Compensation' | 'User' | 'Department' | 'System', entityId: string, details: string) => void;

  // Department Actions
  addDepartment: (dept: Omit<DepartmentInfo, 'id'>) => string;
  updateDepartment: (id: string, updates: Partial<DepartmentInfo>) => void;
  deleteDepartment: (id: string) => boolean;
  toggleDepartmentStatus: (id: string) => void;

  // Additional Project Actions
  deleteProject: (id: string) => void;
  addProjectActivityLog: (projectId: string, action: string, details: string) => void;

  // SLA Actions
  addSlaRule: (rule: Omit<SlaRule, 'id'>) => string;
  updateSlaRule: (id: string, updates: Partial<SlaRule>) => void;
  deleteSlaRule: (id: string) => void;
  toggleSlaRuleStatus: (id: string) => void;

  // Settings Actions
  updateSettings: (updates: Partial<SystemSettings>) => void;

  // User Actions
  addUser: (user: Omit<UserProfile, 'id'>) => string;
  updateUser: (id: string, updates: Partial<UserProfile>) => void;
  resetToInitialDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'bhoomi_users_v2',
  PROJECTS: 'bhoomi_projects_v2',
  PARCELS: 'bhoomi_parcels_v2',
  DOCUMENTS: 'bhoomi_documents_v2',
  COMPENSATIONS: 'bhoomi_compensations_v2',
  RISKS: 'bhoomi_risks_v2',
  NOTIFICATIONS: 'bhoomi_notifications_v2',
  AUDIT: 'bhoomi_audit_v2',
  DEPARTMENTS: 'bhoomi_departments_v2',
  SLA: 'bhoomi_sla_v2',
  CURRENT_USER_ID: 'bhoomi_user_id_v2',
  SLA_RULES: 'bhoomi_sla_rules_v2',
  SETTINGS: 'bhoomi_settings_v2',
  THEME: 'bhoomi_theme_v2'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from LocalStorage or fall back to mock data
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || null;
  });

  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || '/';
  });

  const [routeParams, setRouteParams] = useState<Record<string, string>>({});
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const [language, setLanguage] = useState<'EN' | 'HI'>('EN');

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark';
    return savedTheme || 'light';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [parcels, setParcels] = useState<LandParcel[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PARCELS);
    return saved ? JSON.parse(saved) : INITIAL_PARCELS;
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [compensations, setCompensations] = useState<CompensationRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPENSATIONS);
    return saved ? JSON.parse(saved) : INITIAL_COMPENSATIONS;
  });

  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RISKS);
    return saved ? JSON.parse(saved) : INITIAL_RISK_ALERTS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [departments, setDepartments] = useState<DepartmentInfo[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
    return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
  });

  const [slaConfig, setSlaConfig] = useState<SlaRuleConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SLA);
    return saved ? JSON.parse(saved) : INITIAL_SLA_CONFIG;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PARCELS, JSON.stringify(parcels));
  }, [parcels]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPENSATIONS, JSON.stringify(compensations));
  }, [compensations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RISKS, JSON.stringify(riskAlerts));
  }, [riskAlerts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
  }, [currentUserId]);

  const [slas, setSlas] = useState<SlaRule[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SLA_RULES);
    return saved ? JSON.parse(saved) : INITIAL_SLA_RULES;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SLA_RULES, JSON.stringify(slas));
  }, [slas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  const currentUser = users.find(u => u.id === currentUserId) || null;
  const currentRole: UserRole | 'PUBLIC' = currentUser ? currentUser.role : 'PUBLIC';

  // Listen to hash change for browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || '/';
      parseAndSetRoute(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const parseAndSetRoute = (path: string) => {
    // Extract dynamic params like /officer/projects/:id or /officer/land-parcels/:id
    let matchedPath = path;
    const params: Record<string, string> = {};

    const projectMatch = path.match(/^\/officer\/projects\/([A-Za-z0-9-]+)$/);
    if (projectMatch && projectMatch[1] !== 'create') {
      matchedPath = '/officer/projects/:id';
      params.id = projectMatch[1];
    }

    const parcelMatch = path.match(/^\/officer\/land-parcels\/([A-Za-z0-9-]+)$/);
    if (parcelMatch) {
      matchedPath = '/officer/land-parcels/:id';
      params.id = parcelMatch[1];
    }

    const landownerParcelMatch = path.match(/^\/landowner\/my-land\/([A-Za-z0-9-]+)$/);
    if (landownerParcelMatch) {
      matchedPath = '/landowner/my-land/:id';
      params.id = landownerParcelMatch[1];
    }

    setCurrentRoute(matchedPath);
    setRouteParams(params);
  };

  const navigate = (path: string, params?: Record<string, string>) => {
    let fullPath = path;
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        fullPath = fullPath.replace(`:${key}`, val);
      });
    }
    window.location.hash = fullPath;
    parseAndSetRoute(fullPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (title: string, description: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'EN' ? 'HI' : 'EN'));
    showToast(
      language === 'EN' ? 'भाषा बदली गई' : 'Language Changed',
      language === 'EN' ? 'हिंदी भाषा मोड सक्रिय किया गया।' : 'English language mode activated.',
      'info'
    );
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const loginAs = (role: UserRole, userEmail?: string) => {
    let matchedUser = users.find(u => u.role === role);
    if (userEmail) {
      const byEmail = users.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
      if (byEmail) matchedUser = byEmail;
    }

    if (matchedUser) {
      setCurrentUserId(matchedUser.id);
      showToast(
        'Authentication Successful',
        `Logged in as ${matchedUser.name} (${role === 'OFFICER' ? 'Govt Officer' : role === 'LANDOWNER' ? 'Landowner' : 'Administrator'}).`,
        'success'
      );
      addAuditLog(
        `User Login (${role})`,
        'User',
        matchedUser.id,
        `Successful authentication from IP 10.24.112.45 via official portal.`
      );

      // Redirect to respective dashboard
      if (role === 'OFFICER') navigate('/officer/dashboard');
      else if (role === 'LANDOWNER') navigate('/landowner/dashboard');
      else if (role === 'ADMIN') navigate('/admin/dashboard');
    }
  };

  const logout = () => {
    if (currentUser) {
      addAuditLog(
        `User Logout (${currentUser.role})`,
        'User',
        currentUser.id,
        `Session ended securely.`
      );
    }
    setCurrentUserId(null);
    showToast('Logged Out', 'You have been safely signed out.', 'info');
    navigate('/');
  };

  const addAuditLog = (
    action: string,
    entityType: 'Project' | 'LandParcel' | 'Document' | 'Compensation' | 'User' | 'Department' | 'System',
    entityId: string,
    details: string
  ) => {
    const now = new Date();
    const timeString = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newLog: AuditLogItem = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: timeString,
      user: currentUser ? `${currentUser.name} (${currentUser.designation || currentUser.role})` : 'System Daemon',
      role: currentUser?.role === 'OFFICER' ? 'Government Officer' : currentUser?.role === 'LANDOWNER' ? 'Landowner' : currentUser?.role === 'ADMIN' ? 'Administrator' : 'System',
      department: currentUser?.department || 'Digital Land Authority',
      action,
      entityType,
      entityId,
      details,
      ipAddress: '10.24.112.45'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const addNotification = (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: `NOTIF-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('Notifications Cleared', 'All notifications marked as read.', 'info');
  };

  const addProject = (projectData: Omit<Project, 'id' | 'lastUpdated' | 'acquiredAreaAcres' | 'acquiredParcelsCount' | 'disbursedCompensationCr'>): string => {
    const newId = `PRJ-${String(projects.length + 1).padStart(3, '0')}`;
    const newProject: Project = {
      ...projectData,
      id: newId,
      acquiredAreaAcres: 0,
      acquiredParcelsCount: 0,
      disbursedCompensationCr: 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    setProjects(prev => [newProject, ...prev]);
    addAuditLog(
      'Created New Project',
      'Project',
      newId,
      `Project "${newProject.name}" created under ${newProject.department} with total land requirement of ${newProject.totalAreaAcres} acres across ${newProject.villages.join(', ')}.`
    );
    addNotification({
      targetRole: 'OFFICER',
      title: 'New Project Created',
      message: `Project ${newId} (${newProject.name}) has been registered and initialized for land survey.`,
      type: 'PROJECT_UPDATE',
      projectId: newId
    });
    showToast('Project Created Successfully', `Project ${newId} has been created and assigned.`, 'success');
    return newId;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          ...updates,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return p;
    }));
    addAuditLog('Updated Project Details', 'Project', id, `Updated project parameters for ${id}.`);
  };

  const updateProjectStage = (projectId: string, stageIndex: number, newStatus: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'DELAYED') => {
    setProjects(prev => prev.map(proj => {
      if (proj.id !== projectId) return proj;
      const updatedStages = [...proj.stages];
      if (updatedStages[stageIndex]) {
        updatedStages[stageIndex] = {
          ...updatedStages[stageIndex],
          status: newStatus,
          completedDate: newStatus === 'COMPLETED' ? new Date().toISOString().split('T')[0] : undefined
        };
      }

      // Calculate progress percentage based on completed stages
      const completedCount = updatedStages.filter(s => s.status === 'COMPLETED').length;
      const progressPercentage = Math.round((completedCount / updatedStages.length) * 100);

      // Determine current active stage
      const inProgressStage = updatedStages.find(s => s.status === 'IN_PROGRESS' || s.status === 'DELAYED');
      const currentStage = inProgressStage ? inProgressStage.stage : proj.currentStage;

      return {
        ...proj,
        stages: updatedStages,
        progressPercentage,
        currentStage,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
    }));

    showToast('Project Workflow Updated', `Stage status updated for project ${projectId}.`, 'success');
    addAuditLog('Updated Project Stage', 'Project', projectId, `Stage ${stageIndex + 1} updated to ${newStatus}.`);
  };

  const updateParcel = (id: string, updates: Partial<LandParcel>) => {
    setParcels(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          ...updates,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return p;
    }));
    addAuditLog('Updated Parcel Record', 'LandParcel', id, `Updated parcel attributes for ${id}.`);
  };

  const updateParcelStatus = (
    id: string,
    newStatus: ParcelStatus,
    verificationStatus?: VerificationStatus,
    compensationStatus?: CompensationStatus
  ) => {
    let updatedParcelName = '';
    let updatedProjectId = '';

    setParcels(prev => prev.map(p => {
      if (p.id === id) {
        updatedParcelName = p.ownerName;
        updatedProjectId = p.projectId;
        return {
          ...p,
          status: newStatus,
          verificationStatus: verificationStatus || p.verificationStatus,
          compensationStatus: compensationStatus || p.compensationStatus,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return p;
    }));

    showToast('Parcel Status Updated', `Parcel ${id} (${updatedParcelName}) updated to ${newStatus}.`, 'success');
    addAuditLog('Updated Parcel Status', 'LandParcel', id, `Status updated to ${newStatus} (${verificationStatus || 'N/A'}, ${compensationStatus || 'N/A'}).`);

    // Notify landowner
    addNotification({
      targetRole: 'LANDOWNER',
      title: 'Land Status Updated',
      message: `Your land parcel ${id} status has been updated to "${newStatus}".`,
      type: 'PROJECT_UPDATE',
      parcelId: id,
      projectId: updatedProjectId
    });
  };

  const uploadDocument = (docData: Omit<DocumentItem, 'id' | 'uploadDate'>): string => {
    const newDocId = `DOC-${docData.parcelId.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString().slice(-3)}`;
    const newDoc: DocumentItem = {
      ...docData,
      id: newDocId,
      uploadDate: new Date().toISOString().split('T')[0]
    };

    setDocuments(prev => [newDoc, ...prev]);

    // Update parcel document count
    setParcels(prev => prev.map(p => {
      if (p.id === docData.parcelId) {
        return {
          ...p,
          documentsCount: p.documentsCount + 1
        };
      }
      return p;
    }));

    showToast('Document Uploaded', `${newDoc.title} uploaded successfully. Pending verification.`, 'success');
    addAuditLog('Uploaded Document', 'Document', newDocId, `Uploaded ${newDoc.title} for parcel ${docData.parcelId}.`);

    // Notify officer
    addNotification({
      targetRole: 'OFFICER',
      title: 'New Document Uploaded',
      message: `Landowner ${docData.ownerName} uploaded "${newDoc.title}" for Parcel ${docData.parcelId}.`,
      type: 'ACTION_REQUIRED',
      parcelId: docData.parcelId,
      projectId: docData.projectId
    });

    return newDocId;
  };

  const verifyDocument = (documentId: string, newStatus: VerificationStatus, remarks?: string) => {
    let targetParcelId = '';
    let targetOwnerName = '';
    let targetDocTitle = '';
    let targetProjectId = '';

    setDocuments(prev => prev.map(doc => {
      if (doc.id === documentId) {
        targetParcelId = doc.parcelId;
        targetOwnerName = doc.ownerName;
        targetDocTitle = doc.title;
        targetProjectId = doc.projectId;
        return {
          ...doc,
          status: newStatus,
          verifiedBy: currentUser ? `${currentUser.name} (${currentUser.designation || currentUser.role})` : 'Competent Authority (SLAO)',
          verifiedDate: new Date().toISOString().split('T')[0],
          rejectionReason: newStatus === 'Rejected' ? remarks || 'Document clarity/mutation mismatch' : undefined
        };
      }
      return doc;
    }));

    // Update parcel verification status & verified count
    if (targetParcelId) {
      setParcels(prev => prev.map(p => {
        if (p.id === targetParcelId) {
          const parcelDocs = documents.map(d => d.id === documentId ? { ...d, status: newStatus } : d).filter(d => d.parcelId === targetParcelId);
          const allVerified = parcelDocs.length > 0 && parcelDocs.every(d => d.status === 'Verified');
          const hasRejected = parcelDocs.some(d => d.status === 'Rejected');
          const verifiedCount = parcelDocs.filter(d => d.status === 'Verified').length;

          let vStatus: VerificationStatus = 'Under Review';
          if (allVerified) vStatus = 'Verified';
          else if (hasRejected) vStatus = 'Rejected';

          let pStatus: ParcelStatus = p.status;
          if (allVerified && p.status === 'Pending') {
            pStatus = 'Verified';
          }

          return {
            ...p,
            verificationStatus: vStatus,
            status: pStatus,
            verifiedDocumentsCount: verifiedCount
          };
        }
        return p;
      }));
    }

    showToast(
      newStatus === 'Verified' ? 'Document Verified' : 'Document Status Updated',
      `${targetDocTitle} has been marked as ${newStatus}.`,
      newStatus === 'Verified' ? 'success' : 'warning'
    );

    addAuditLog(
      `Document Verification (${newStatus})`,
      'Document',
      documentId,
      `Document "${targetDocTitle}" for Parcel ${targetParcelId} marked as ${newStatus}. ${remarks ? `Remarks: ${remarks}` : ''}`
    );

    // Notify landowner
    addNotification({
      targetRole: 'LANDOWNER',
      title: newStatus === 'Verified' ? 'Verification Completed' : 'Document Review Notice',
      message: newStatus === 'Verified'
        ? `Your document "${targetDocTitle}" for Parcel ${targetParcelId} has been successfully verified by the Land Acquisition Officer.`
        : `Your document "${targetDocTitle}" requires attention: ${remarks || 'Please re-upload clearer scan.'}`,
      type: newStatus === 'Verified' ? 'VERIFICATION_COMPLETED' : 'ACTION_REQUIRED',
      parcelId: targetParcelId,
      projectId: targetProjectId
    });
  };

  const updateCompensationStatus = (id: string, newStatus: CompensationStatus, txnId?: string) => {
    let affectedParcelId = '';
    let affectedLandowner = '';
    let affectedAmount = 0;
    let affectedProjectId = '';

    setCompensations(prev => prev.map(c => {
      if (c.id === id) {
        affectedParcelId = c.parcelId;
        affectedLandowner = c.landownerName;
        affectedAmount = c.totalCompensation;
        affectedProjectId = c.projectId;
        return {
          ...c,
          status: newStatus,
          dbtTransactionId: txnId || c.dbtTransactionId,
          disbursementDate: newStatus === 'Paid' ? new Date().toISOString().split('T')[0] : c.disbursementDate
        };
      }
      return c;
    }));

    // Update parcel status
    if (affectedParcelId) {
      setParcels(prev => prev.map(p => {
        if (p.id === affectedParcelId) {
          let overallStatus: ParcelStatus = p.status;
          if (newStatus === 'Paid') overallStatus = 'Acquired';
          else if (newStatus === 'Approved') overallStatus = 'In Progress';
          else if (newStatus === 'Processing') overallStatus = 'In Progress';

          return {
            ...p,
            compensationStatus: newStatus,
            status: overallStatus
          };
        }
        return p;
      }));
    }

    showToast(
      'Compensation Status Updated',
      `Compensation for ${affectedLandowner} (₹${affectedAmount.toLocaleString('en-IN')}) updated to ${newStatus}.`,
      'success'
    );

    addAuditLog(
      `Compensation Status Update (${newStatus})`,
      'Compensation',
      id,
      `Compensation for Parcel ${affectedParcelId} updated to ${newStatus}. Amount: ₹${affectedAmount.toLocaleString('en-IN')}.`
    );

    // Notify landowner
    addNotification({
      targetRole: 'LANDOWNER',
      title: 'Compensation Update',
      message: `Compensation status for your parcel ${affectedParcelId} is now "${newStatus}". (Amount: ₹${affectedAmount.toLocaleString('en-IN')}).`,
      type: 'COMPENSATION_UPDATE',
      parcelId: affectedParcelId,
      projectId: affectedProjectId
    });
  };

  const approveCompensation = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setCompensations(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'Approved',
          approvedBy: currentUser ? `${currentUser.name} (Competent Authority)` : 'Competent Authority (SLAO)',
          approvedDate: today
        };
      }
      return c;
    }));

    const comp = compensations.find(c => c.id === id);
    if (comp) {
      updateParcel(comp.parcelId, { compensationStatus: 'Approved' });
      showToast(
        'Compensation Award Approved',
        `Award of ₹${comp.totalCompensation.toLocaleString('en-IN')} approved under Sec 23 RFCTLARR Act 2013.`,
        'success'
      );
      addAuditLog(
        'Approved Compensation Award',
        'Compensation',
        id,
        `Approved compensation award for ${comp.landownerName}, Parcel ${comp.parcelId}. Amount: ₹${comp.totalCompensation.toLocaleString('en-IN')}.`
      );
      addNotification({
        targetRole: 'LANDOWNER',
        title: 'Compensation Approved',
        message: `Your compensation award of ₹${comp.totalCompensation.toLocaleString('en-IN')} for Parcel ${comp.parcelId} has been approved by the Competent Authority.`,
        type: 'COMPENSATION_UPDATE',
        parcelId: comp.parcelId,
        projectId: comp.projectId
      });
    }
  };

  const disbursePayment = (id: string) => {
    const txnId = `PFMS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const today = new Date().toISOString().split('T')[0];

    const comp = compensations.find(c => c.id === id);
    if (!comp) return;

    setCompensations(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'Paid',
          dbtTransactionId: txnId,
          disbursementDate: today
        };
      }
      return c;
    }));

    // Update parcel as Acquired
    updateParcel(comp.parcelId, {
      compensationStatus: 'Paid',
      status: 'Acquired'
    });

    // Update project budget and acquired count
    setProjects(prev => prev.map(p => {
      if (p.id === comp.projectId) {
        return {
          ...p,
          acquiredParcelsCount: p.acquiredParcelsCount + 1,
          acquiredAreaAcres: p.acquiredAreaAcres + comp.areaAcres,
          disbursedCompensationCr: +(p.disbursedCompensationCr + (comp.totalCompensation / 10000000)).toFixed(2)
        };
      }
      return p;
    }));

    showToast(
      'Payment Disbursed via PFMS DBT',
      `₹${comp.totalCompensation.toLocaleString('en-IN')} transferred to ${comp.landownerName} (SBI ${comp.bankAccountMasked}). Txn ID: ${txnId}`,
      'success'
    );

    addAuditLog(
      'Disbursed Direct Benefit Transfer (DBT)',
      'Compensation',
      id,
      `Disbursed ₹${comp.totalCompensation.toLocaleString('en-IN')} via DBT Txn ${txnId} to ${comp.landownerName}, Parcel ${comp.parcelId}. Parcel marked as Acquired.`
    );

    addNotification({
      targetRole: 'LANDOWNER',
      title: 'Payment Disbursed to Bank Account',
      message: `Your compensation of ₹${comp.totalCompensation.toLocaleString('en-IN')} has been credited to your bank account via PFMS DBT (Txn Ref: ${txnId}).`,
      type: 'COMPENSATION_UPDATE',
      parcelId: comp.parcelId,
      projectId: comp.projectId
    });
  };

  const resolveRiskAlert = (id: string) => {
    setRiskAlerts(prev => prev.map(r => r.id === id ? { ...r, status: 'RESOLVED' } : r));
    showToast('Risk Alert Resolved', 'Mitigation measures initiated and logged.', 'success');
    addAuditLog('Resolved Risk Alert', 'System', id, `Risk Alert ${id} marked as resolved by officer.`);
  };

  const updateSlaConfig = (newConfig: Partial<SlaRuleConfig>) => {
    setSlaConfig(prev => ({ ...prev, ...newConfig }));
    localStorage.setItem(STORAGE_KEYS.SLA, JSON.stringify({ ...slaConfig, ...newConfig }));
    showToast('SLA Thresholds Updated', 'System delay risk calculation rules have been updated.', 'success');
    addAuditLog('Updated SLA Rules', 'System', 'SLA-CONFIG', `Updated system SLA thresholds.`);
  };

  const addUser = (userData: Omit<UserProfile, 'id'>): string => {
    const newId = `usr-${Date.now().toString().slice(-4)}`;
    const newUser: UserProfile = {
      ...userData,
      id: newId
    };
    setUsers(prev => [...prev, newUser]);
    showToast('User Created', `Account for ${newUser.name} created.`, 'success');
    addAuditLog('Created User', 'User', newId, `Added user ${newUser.name} with role ${newUser.role}.`);
    return newId;
  };

  const updateUser = (id: string, updates: Partial<UserProfile>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    showToast('User Updated', 'User details updated successfully.', 'success');
  };

  // Department Management Operations
  const addDepartment = (deptData: Omit<DepartmentInfo, 'id'>): string => {
    // Duplicate validation
    const codeExists = departments.some(d => d.code.toLowerCase() === deptData.code.trim().toLowerCase());
    const nameExists = departments.some(d => d.name.toLowerCase() === deptData.name.trim().toLowerCase());

    if (codeExists) {
      showToast('Duplicate Code Error', `A department with code "${deptData.code}" already exists.`, 'error');
      return '';
    }
    if (nameExists) {
      showToast('Duplicate Name Error', `A department with name "${deptData.name}" already exists.`, 'error');
      return '';
    }

    const newId = `dept-${Date.now().toString().slice(-4)}`;
    const newDept: DepartmentInfo = {
      ...deptData,
      id: newId,
      status: deptData.status || 'ACTIVE',
      createdDate: new Date().toISOString().split('T')[0]
    };

    setDepartments(prev => [newDept, ...prev]);
    showToast('Department Created', `Department "${newDept.name}" (${newDept.code}) registered successfully.`, 'success');
    addAuditLog('Created Department', 'Department', newId, `Registered department "${newDept.name}" (${newDept.code}) with Head: ${newDept.headName}.`);
    return newId;
  };

  const updateDepartment = (id: string, updates: Partial<DepartmentInfo>) => {
    const existing = departments.find(d => d.id === id);
    if (!existing) return;

    // Check duplicate code or name against other departments
    if (updates.code && updates.code.toLowerCase() !== existing.code.toLowerCase()) {
      const codeExists = departments.some(d => d.id !== id && d.code.toLowerCase() === updates.code!.trim().toLowerCase());
      if (codeExists) {
        showToast('Duplicate Code Error', `Another department with code "${updates.code}" already exists.`, 'error');
        return;
      }
    }
    if (updates.name && updates.name.toLowerCase() !== existing.name.toLowerCase()) {
      const nameExists = departments.some(d => d.id !== id && d.name.toLowerCase() === updates.name!.trim().toLowerCase());
      if (nameExists) {
        showToast('Duplicate Name Error', `Another department with name "${updates.name}" already exists.`, 'error');
        return;
      }
    }

    setDepartments(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, ...updates };
      }
      return d;
    }));

    // If department name or code changed, synchronize throughout existing projects
    if (updates.name && updates.name !== existing.name) {
      setProjects(prev => prev.map(p => {
        if (p.department === existing.name || p.department.includes(existing.code)) {
          return {
            ...p,
            department: updates.name!
          };
        }
        return p;
      }));
    }

    showToast('Department Updated', `Details for "${updates.name || existing.name}" updated successfully.`, 'success');
    addAuditLog('Updated Department', 'Department', id, `Updated department fields for "${existing.name}".`);
  };

  const deleteDepartment = (id: string): boolean => {
    const existing = departments.find(d => d.id === id);
    if (!existing) return false;

    // Check for linked active projects
    const linkedProjects = projects.filter(p => p.department.toLowerCase().includes(existing.name.toLowerCase()) || p.department.toLowerCase().includes(existing.code.toLowerCase()));
    if (linkedProjects.length > 0) {
      showToast(
        'Cannot Delete Department',
        `Department "${existing.name}" is linked to ${linkedProjects.length} active infrastructure corridors. Deactivate it or reassign corridors first.`,
        'warning'
      );
      return false;
    }

    setDepartments(prev => prev.filter(d => d.id !== id));
    showToast('Department Deleted', `Department "${existing.name}" (${existing.code}) removed from system.`, 'info');
    addAuditLog('Deleted Department', 'Department', id, `Removed department "${existing.name}" (${existing.code}).`);
    return true;
  };

  const toggleDepartmentStatus = (id: string) => {
    const target = departments.find(d => d.id === id);
    if (!target) return;
    const newStatus: DepartmentStatus = (target.status === 'INACTIVE') ? 'ACTIVE' : 'INACTIVE';

    setDepartments(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
    showToast(
      `Department ${newStatus === 'ACTIVE' ? 'Activated' : 'Deactivated'}`,
      `"${target.name}" is now marked as ${newStatus}.`,
      newStatus === 'ACTIVE' ? 'success' : 'warning'
    );
    addAuditLog(
      `Department Status Change (${newStatus})`,
      'Department',
      id,
      `Department "${target.name}" transitioned to ${newStatus}.`
    );
  };

  // Additional Project Operations
  const deleteProject = (id: string) => {
    const target = projects.find(p => p.id === id);
    if (!target) return;

    setProjects(prev => prev.filter(p => p.id !== id));
    showToast('Project Removed', `Project "${target.name}" (${id}) removed.`, 'info');
    addAuditLog('Deleted Project', 'Project', id, `Removed project "${target.name}".`);
  };

  const addProjectActivityLog = (projectId: string, action: string, details: string) => {
    const newLogItem = {
      id: `act-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      action,
      user: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Administrator',
      details
    };

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          activityHistory: [newLogItem, ...(p.activityHistory || [])]
        };
      }
      return p;
    }));

    addAuditLog(action, 'Project', projectId, details);
  };

  const addSlaRule = (rule: Omit<SlaRule, 'id'>): string => {
    const newId = `SLA-${String(slas.length + 1).padStart(3, '0')}`;
    const newRule: SlaRule = {
      ...rule,
      id: newId
    };
    setSlas(prev => [newRule, ...prev]);
    addAuditLog('Created SLA Rule', 'System', newId, `SLA Rule "${newRule.name}" created for ${newRule.department}.`);
    showToast('SLA Rule Added', `${newRule.name} configured successfully.`, 'success');
    return newId;
  };

  const updateSlaRule = (id: string, updates: Partial<SlaRule>) => {
    setSlas(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    addAuditLog('Updated SLA Rule', 'System', id, `Updated configuration for SLA Rule ${id}.`);
    showToast('SLA Rule Updated', `Changes saved successfully.`, 'success');
  };

  const deleteSlaRule = (id: string) => {
    setSlas(prev => prev.filter(s => s.id !== id));
    addAuditLog('Deleted SLA Rule', 'System', id, `Deleted SLA Rule ${id}.`);
    showToast('SLA Rule Deleted', `Rule removed successfully.`, 'success');
  };

  const toggleSlaRuleStatus = (id: string) => {
    setSlas(prev => prev.map(s => {
      if (s.id === id) {
        const newStatus = !s.isActive;
        addAuditLog(
          newStatus ? 'Activated SLA Rule' : 'Deactivated SLA Rule',
          'System',
          id,
          `${s.name} is now ${newStatus ? 'Active' : 'Inactive'}`
        );
        return { ...s, isActive: newStatus };
      }
      return s;
    }));
  };

  const updateSettings = (updates: Partial<SystemSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...updates };
      addAuditLog('Updated System Settings', 'System', 'Global', `Modified application settings.`);
      showToast('Settings Saved', `System settings updated successfully.`, 'success');
      return updated;
    });
  };

  const resetToInitialDemoData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setProjects(INITIAL_PROJECTS);
    setParcels(INITIAL_PARCELS);
    setDocuments(INITIAL_DOCUMENTS);
    setCompensations(INITIAL_COMPENSATIONS);
    setRiskAlerts(INITIAL_RISK_ALERTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setDepartments(INITIAL_DEPARTMENTS);
    setSlaConfig(INITIAL_SLA_CONFIG);
    setSlas(INITIAL_SLA_RULES);
    setSettings(INITIAL_SETTINGS);
    setCurrentUserId('usr-officer-01');
    showToast('Demo Data Reset', 'All records have been reset to pristine demo state.', 'info');
    navigate('/officer/dashboard');
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      currentRole,
      currentRoute,
      routeParams,
      projects,
      parcels,
      documents,
      compensations,
      riskAlerts,
      notifications,
      auditLogs,
      departments,
      slaConfig,
      slas,
      settings,
      globalSearchQuery,
      isSearchOpen,
      toasts,
      language,
      theme,
      loginAs,
      logout,
      navigate,
      setGlobalSearchQuery,
      setIsSearchOpen,
      showToast,
      removeToast,
      toggleLanguage,
      toggleTheme,
      addProject,
      updateProject,
      updateProjectStage,
      updateParcel,
      updateParcelStatus,
      uploadDocument,
      verifyDocument,
      updateCompensationStatus,
      approveCompensation,
      disbursePayment,
      resolveRiskAlert,
      updateSlaConfig,
      markNotificationRead,
      markAllNotificationsRead,
      addNotification,
      addAuditLog,
      addDepartment,
      updateDepartment,
      deleteDepartment,
      toggleDepartmentStatus,
      deleteProject,
      addProjectActivityLog,
      addSlaRule,
      updateSlaRule,
      deleteSlaRule,
      toggleSlaRuleStatus,
      updateSettings,
      addUser,
      updateUser,
      resetToInitialDemoData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
