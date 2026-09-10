export type UserRole = 'OFFICER' | 'LANDOWNER' | 'ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  designation?: string;
  department?: string;
  district?: string;
  state?: string;
  avatarUrl?: string;
  officerCode?: string;
  assignedProjectIds?: string[];
  landownerParcelIds?: string[];
  aadhaarMasked?: string;
  bankAccountMasked?: string;
  bankIfsc?: string;
  digitalSignatureVerified?: boolean;
}

export type ProjectStatus = 
  | 'Draft'
  | 'Active'
  | 'Planning' 
  | 'In Progress' 
  | 'On Hold'
  | 'Near Completion' 
  | 'Completed' 
  | 'Archived'
  | 'Delayed';

export type ProjectStage = 
  | 'Project Created'
  | 'Land Identified'
  | 'Survey Completed'
  | 'Documents Submitted'
  | 'Ownership Verified'
  | 'Valuation Completed'
  | 'Compensation Approval'
  | 'Payment Processing'
  | 'Final Acquisition'
  | 'Project Completion';

export interface StageTimelineItem {
  stage: ProjectStage;
  label: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'DELAYED';
  completedDate?: string;
  targetDays: number;
  actualDays?: number;
  assignedOfficer?: string;
  notes?: string;
}

export interface GovernanceRules {
  approvalLevelRequired: 'DISTRICT_COLLECTOR' | 'STATE_SECRETARY' | 'CABINET_COMMITTEE';
  solatiumPolicy: string;
  escalationThresholdDays: number;
  auditStrictness: 'STANDARD' | 'ELEVATED' | 'HIGH_VIGILANCE';
  autoDisputeEscalation: boolean;
}

export interface ProjectActivityLogItem {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
}

export interface Project {
  id: string; // e.g. "PRJ-001"
  name: string; // e.g. "Delhi–Meerut Connectivity Corridor"
  department: string; // e.g. "PWD / NHAI"
  projectType: string; // e.g. "Expressway / Highway", "Metro Rail", "Industrial Zone"
  state: string;
  district: string;
  villages: string[];
  totalAreaAcres: number;
  acquiredAreaAcres: number;
  parcelsCount: number;
  acquiredParcelsCount: number;
  estimatedBudgetCr: number;
  disbursedCompensationCr: number;
  startDate: string;
  expectedCompletionDate: string;
  progressPercentage: number;
  status: ProjectStatus;
  currentStage: ProjectStage;
  delayRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  delayDaysCount?: number;
  lastUpdated: string;
  description: string;
  objectives?: string;
  scope?: string;
  assignedOfficer?: string;
  responsibleTeam?: string;
  governanceRules?: GovernanceRules;
  activityHistory?: ProjectActivityLogItem[];
  coordinates: {
    lat: number;
    lng: number;
  };
  stages: StageTimelineItem[];
}

export type ParcelStatus = 'Verified' | 'Pending' | 'Disputed' | 'Acquired' | 'Compensation Pending' | 'In Progress';
export type VerificationStatus = 'Pending' | 'Under Review' | 'Verified' | 'Rejected';
export type CompensationStatus = 'Calculation' | 'Review' | 'Approved' | 'Processing' | 'Paid';
export type LandType = 'Agricultural' | 'Residential' | 'Commercial' | 'Industrial' | 'Barren';

export interface LandParcel {
  id: string; // e.g. "DL-10293"
  projectId: string;
  projectName: string;
  surveyNumber: string; // e.g. "10293/A"
  khasraNumber: string; // e.g. "45/12"
  khatauniNumber: string; // e.g. "880"
  ownerName: string;
  fatherName: string;
  ownerContact: string;
  ownerAadhaarMasked: string;
  village: string;
  district: string;
  state: string;
  areaAcres: number;
  landType: LandType;
  circleRatePerAcre: number; // in INR
  marketValueTotal: number;
  solatiumAmount: number; // 100% under RFCTLARR Act 2013
  additionalAssetValue: number; // trees, wells, structures
  totalCompensation: number;
  verificationStatus: VerificationStatus;
  compensationStatus: CompensationStatus;
  status: ParcelStatus;
  latitude: number;
  longitude: number;
  boundaryPolygon?: [number, number][];
  documentsCount: number;
  verifiedDocumentsCount: number;
  disputeReason?: string;
  lastUpdated: string;
}

export type DocumentType = 
  | 'Ownership Proof (7/12 & Khatauni)'
  | 'Identity Proof (Aadhaar/PAN)'
  | 'Survey & Demarcation Report'
  | 'Valuation & Tree/Structure Report'
  | 'Compensation Form & Bank Mandate'
  | 'No Objection Certificate (NOC)'
  | 'Gram Sabha Resolution';

export interface OcrExtractedData {
  ownerName: string;
  surveyNumber: string;
  khasraNumber: string;
  khatauniNumber: string;
  village: string;
  district: string;
  state: string;
  areaAcres: number;
  circleRate: number;
  confidenceScore: number; // 0 - 100
  rawExtractedText: string;
}

export interface DocumentItem {
  id: string;
  parcelId: string;
  projectId: string;
  ownerName: string;
  title: string;
  documentType: DocumentType;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  status: VerificationStatus;
  verifiedBy?: string;
  verifiedDate?: string;
  rejectionReason?: string;
  ocrData?: OcrExtractedData;
  fileUrl?: string;
}

export interface CompensationRecord {
  id: string;
  parcelId: string;
  projectId: string;
  projectName: string;
  landownerName: string;
  fatherName: string;
  village: string;
  district: string;
  areaAcres: number;
  landType: LandType;
  circleRatePerAcre: number;
  basicLandValue: number;
  solatiumMultiplier: number; // 100% = 1.0 multiplier
  solatiumAmount: number;
  additionalAssetValue: number;
  totalCompensation: number;
  status: CompensationStatus;
  approvedBy?: string;
  approvedDate?: string;
  bankAccountMasked: string;
  bankName: string;
  ifscCode: string;
  dbtTransactionId?: string;
  disbursementDate?: string;
  awardNotificationNo: string;
}

export type NotificationType = 
  | 'ACTION_REQUIRED'
  | 'VERIFICATION_COMPLETED'
  | 'COMPENSATION_UPDATE'
  | 'PROJECT_UPDATE'
  | 'SYSTEM_ALERT';

export interface NotificationItem {
  id: string;
  targetRole: UserRole | 'ALL';
  targetUserId?: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  timestamp: string;
  linkRoute?: string;
  parcelId?: string;
  projectId?: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  department: string;
  action: string;
  entityType: 'Project' | 'LandParcel' | 'Document' | 'Compensation' | 'User' | 'Department' | 'System';
  entityId: string;
  details: string;
  ipAddress: string;
}

export interface RiskAlert {
  id: string;
  projectId: string;
  projectName: string;
  currentStage: ProjectStage;
  daysPending: number;
  expectedDays: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: string;
  recommendedAction: string;
  affectedParcelsCount: number;
  bottleneckOfficer?: string;
  detectedDate: string;
  status: 'ACTIVE' | 'RESOLVED';
}

export type DepartmentStatus = 'ACTIVE' | 'INACTIVE';

export interface DepartmentInfo {
  id: string;
  code: string;
  name: string;
  description?: string;
  status?: DepartmentStatus;
  headName: string;
  headDesignation?: string;
  activeProjectsCount: number;
  totalAcquiredAcres: number;
  allocatedBudgetCr: number;
  contactEmail: string;
  contactPhone?: string;
  nodalOfficer: string;
  nodalOfficerPhone?: string;
  officeAddress?: string;
  createdDate?: string;
}

export interface SlaRuleConfig {
  documentVerificationDays: number;
  valuationApprovalDays: number;
  compensationApprovalDays: number;
  paymentDisbursementDays: number;
  attentionThresholdDays: number; // 8-15
  highRiskThresholdDays: number; // 16-30
  criticalThresholdDays: number; // 30+
  rfctlarrSolatiumPct: number; // 100%
  autoOcrValidation: boolean;
}

export type SlaPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type SlaStatus = 'Within SLA' | 'At Risk' | 'Breached' | 'Resolved';

export interface SlaRule {
  id: string;
  name: string;
  department: string;
  category: string;
  priority: SlaPriority;
  responseTimeHours: number;
  resolutionTimeHours: number;
  escalationThresholdHours: number;
  isActive: boolean;
}

export interface SlaMetric {
  averageResponseTimeHours: number;
  averageResolutionTimeHours: number;
  compliancePercentage: number;
  breachedCases: number;
}

export interface SystemSettings {
  appName: string;
  organizationName: string;
  supportEmail: string;
  notificationsEnabled: boolean;
  defaultLanguage: 'EN' | 'HI';
  sessionTimeoutMinutes: number;
  twoFactorAuthRequired: boolean;
  maintenanceMode: boolean;
}
