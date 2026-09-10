from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict

# ---------------------------------------------------------------------------
# Allowed values, copied verbatim from the frontend's src/types/index.ts.
# Pydantic rejects anything else at the API boundary, so a bad status string
# can never reach the database and silently break the UI's colour coding.
# If the frontend team changes these, change them here too.
# ---------------------------------------------------------------------------

ProjectStatus = Literal[
    "Draft", "Active", "Planning", "In Progress", "On Hold",
    "Near Completion", "Completed", "Archived", "Delayed",
]

ProjectStage = Literal[
    "Project Created", "Land Identified", "Survey Completed",
    "Documents Submitted", "Ownership Verified", "Valuation Completed",
    "Compensation Approval", "Payment Processing", "Final Acquisition",
    "Project Completion",
]

ParcelStatus = Literal[
    "Verified", "Pending", "Disputed", "Acquired",
    "Compensation Pending", "In Progress",
]

VerificationStatus = Literal["Pending", "Under Review", "Verified", "Rejected"]

CompensationStatus = Literal["Calculation", "Review", "Approved", "Processing", "Paid"]

LandType = Literal["Agricultural", "Residential", "Commercial", "Industrial", "Barren"]

PossessionStatus = Literal["Not Started", "Partial", "Substantial", "Complete"]

RRStatus = Literal["Not Started", "In Progress", "Awaiting Approval", "Completed"]

RoleLevel = Literal["L0", "L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8", "L9", "L10"]

JurisdictionType = Literal["NATION", "STATE", "DISTRICT", "VILLAGE"]

class DepartmentCreate(BaseModel):
    code: str
    name: str
    head_name: str | None = None
    nodal_officer: str | None = None
    contact_email: str | None = None
    allocated_budget_cr: float | None = None

class DepartmentOut(DepartmentCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)

class JurisdictionCreate(BaseModel):
    name: str
    type: JurisdictionType
    parent_id : int | None = None

class JurisdictionOut(JurisdictionCreate):
    id : int 
    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseModel):
    name: str 
    email: str 
    password: str 
    phone : str | None = None
    role_level : RoleLevel | None = None
    designation : str | None = None 
    department_id : int | None = None
    jurisdiction_id : int | None = None


class UserOut(BaseModel):
    id : int
    name : str
    email : str
    role : str | None = None          # derived from role_level by the model property
    role_level : RoleLevel | None = None
    designation : str | None = None
    phone : str | None = None
    department_id : int | None = None
    jurisdiction_id : int | None = None
    digital_signature_verified: bool | None = None
    model_config = ConfigDict(from_attributes=True)

class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ProjectCreate(BaseModel):
    name: str
    department_id: int | None = None
    jurisdiction_id: int | None = None
    project_type: str | None = None
    status: ProjectStatus | None = None
    current_stage: ProjectStage | None = None
    total_area_acres: float | None = None
    estimated_budget_cr: float | None = None
    area_notified_acres: float | None = None
    area_acquired_acres: float | None = None
    affected_families_count: int | None = None
    displaced_families_count: int | None = None
    possession_status: PossessionStatus | None = None
    rr_status: RRStatus | None = None
    compensation_assessed_cr: float | None = None
    disbursed_compensation_cr: float | None = None

class ProjectOut(ProjectCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


class LandParcelCreate(BaseModel):
    project_id: int | None = None
    owner_user_id: int | None = None
    jurisdiction_id: int | None = None
    survey_number: str | None = None
    khasra_number: str | None = None
    khatauni_number: str | None = None
    area_acre: float | None = None
    land_type: LandType | None = None
    circle_rate_per_acre: float | None = None
    additional_asset_value: float | None = 0
    verification_status: VerificationStatus | None = None
    compensation_status: CompensationStatus | None = None
    status: ParcelStatus | None = None
    latitude: float | None = None
    longitude: float | None = None


class LandParcelOut(LandParcelCreate):
    id: int
    # Computed by the backend - never accepted as input.
    market_value_total: float | None = None
    solatium_amount: float | None = None
    total_compensation: float | None = None
    model_config = ConfigDict(from_attributes=True)

# ===========================================================================
# Allowed values for the workflow tables
# ===========================================================================

StageStatus = Literal["COMPLETED", "IN_PROGRESS", "PENDING", "DELAYED"]

DocumentType = Literal[
    "Ownership Proof (7/12 & Khatauni)",
    "Identity Proof (Aadhaar/PAN)",
    "Survey & Demarcation Report",
    "Valuation & Tree/Structure Report",
    "Compensation Form & Bank Mandate",
    "No Objection Certificate (NOC)",
    "Gram Sabha Resolution",
]

NotificationType = Literal[
    "ACTION_REQUIRED", "VERIFICATION_COMPLETED", "COMPENSATION_UPDATE",
    "PROJECT_UPDATE", "SYSTEM_ALERT",
]

TargetRole = Literal["OFFICER", "LANDOWNER", "ADMIN", "ALL"]

EntityType = Literal[
    "Project", "LandParcel", "Document", "Compensation",
    "User", "Department", "System",
]

RiskSeverity = Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
RiskStatus = Literal["ACTIVE", "RESOLVED"]

StatutorySection = Literal[
    "Section 4(1)", "Section 6", "Section 11", "Section 19",
    "Section 21", "Section 23", "Section 30",
]
StatutoryStatus = Literal["Draft", "Issued", "Published", "Superseded"]

ApprovalLevel = Literal["DISTRICT_COLLECTOR", "STATE_SECRETARY", "CABINET_COMMITTEE"]
AuditStrictness = Literal["STANDARD", "ELEVATED", "HIGH_VIGILANCE"]
KycStatus = Literal["Pending", "Verified", "Rejected"]


# ===========================================================================
# Project stages
# ===========================================================================

class ProjectStageCreate(BaseModel):
    project_id: int
    stage: ProjectStage
    label: str | None = None
    status: StageStatus | None = None
    sequence: int | None = None
    target_days: int | None = None
    actual_days: int | None = None
    started_date: datetime | None = None
    completed_date: datetime | None = None
    assigned_officer_id: int | None = None
    notes: str | None = None


class ProjectStageOut(ProjectStageCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


# ===========================================================================
# Documents
# ===========================================================================

class DocumentCreate(BaseModel):
    parcel_id: int | None = None
    project_id: int | None = None
    title: str | None = None
    document_type: DocumentType | None = None
    file_name: str | None = None
    file_size: str | None = None
    file_url: str | None = None
    status: VerificationStatus | None = "Pending"
    ocr_data: dict | None = None
    ocr_confidence: float | None = None


class DocumentOut(DocumentCreate):
    id: int
    upload_date: datetime | None = None
    verified_by_id: int | None = None
    verified_date: datetime | None = None
    rejection_reason: str | None = None
    model_config = ConfigDict(from_attributes=True)


class DocumentVerifyRequest(BaseModel):
    """Body for verifying or rejecting a document."""
    status: VerificationStatus
    remarks: str | None = None


class DocumentVerificationOut(BaseModel):
    id: int
    document_id: int
    verified_by_id: int | None = None
    status: str | None = None
    remarks: str | None = None
    verified_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


# ===========================================================================
# Compensation records
# ===========================================================================

class CompensationCreate(BaseModel):
    parcel_id: int
    project_id: int | None = None
    landowner_id: int | None = None
    status: CompensationStatus | None = "Calculation"
    bank_name: str | None = None
    bank_account_masked: str | None = None
    ifsc_code: str | None = None
    award_notification_no: str | None = None


class CompensationOut(CompensationCreate):
    id: int
    # Money figures are derived from the parcel, never sent in.
    basic_land_value: float | None = None
    solatium_multiplier: float | None = None
    solatium_amount: float | None = None
    additional_asset_value: float | None = None
    total_compensation: float | None = None
    approved_by_id: int | None = None
    approved_date: datetime | None = None
    dbt_transaction_id: str | None = None
    disbursement_date: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


# ===========================================================================
# Statutory notifications
# ===========================================================================

class StatutoryNotificationCreate(BaseModel):
    project_id: int
    jurisdiction_id: int | None = None
    notification_no: str | None = None
    section: StatutorySection | None = None
    title: str | None = None
    issue_date: datetime | None = None
    gazette_reference: str | None = None
    area_notified_acres: float | None = None
    status: StatutoryStatus | None = "Draft"
    issued_by_id: int | None = None


class StatutoryNotificationOut(StatutoryNotificationCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


# ===========================================================================
# Audit log
# ===========================================================================

class AuditLogOut(BaseModel):
    id: int
    timestamp: datetime | None = None
    user_id: int | None = None
    user_name: str | None = None
    role: str | None = None
    department: str | None = None
    action: str | None = None
    entity_type: str | None = None
    entity_id: str | None = None
    details: str | None = None
    ip_address: str | None = None
    model_config = ConfigDict(from_attributes=True)


# ===========================================================================
# Risk alerts
# ===========================================================================

class RiskAlertOut(BaseModel):
    id: int
    project_id: int
    current_stage: str | None = None
    days_pending: int | None = None
    expected_days: int | None = None
    severity: str | None = None
    reason: str | None = None
    recommended_action: str | None = None
    affected_parcels_count: int | None = None
    bottleneck_officer_id: int | None = None
    detected_date: datetime | None = None
    status: str | None = None
    resolved_by_id: int | None = None
    resolved_date: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


# ===========================================================================
# In-app notifications
# ===========================================================================

class NotificationCreate(BaseModel):
    target_role: TargetRole | None = None
    target_user_id: int | None = None
    title: str
    message: str | None = None
    type: NotificationType | None = None
    link_route: str | None = None
    parcel_id: int | None = None
    project_id: int | None = None


class NotificationOut(NotificationCreate):
    id: int
    read: bool | None = None
    timestamp: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


# ===========================================================================
# System settings
# ===========================================================================

class SystemSettingsUpdate(BaseModel):
    """Every field optional - callers send only what they are changing."""
    app_name: str | None = None
    organization_name: str | None = None
    support_email: str | None = None
    notifications_enabled: bool | None = None
    default_language: Literal["EN", "HI"] | None = None
    session_timeout_minutes: int | None = None
    two_factor_auth_required: bool | None = None
    maintenance_mode: bool | None = None


class SystemSettingsOut(BaseModel):
    id: int
    app_name: str | None = None
    organization_name: str | None = None
    support_email: str | None = None
    notifications_enabled: bool | None = None
    default_language: str | None = None
    session_timeout_minutes: int | None = None
    two_factor_auth_required: bool | None = None
    maintenance_mode: bool | None = None
    updated_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


# ===========================================================================
# Landowner KYC - masked output only, raw values never leave the server
# ===========================================================================

class LandownerKYCOut(BaseModel):
    id: int
    user_id: int
    aadhaar_masked: str | None = None
    bank_account_masked: str | None = None
    bank_name: str | None = None
    ifsc_code: str | None = None
    account_holder_name: str | None = None
    kyc_status: str | None = None
    verified_date: datetime | None = None
    model_config = ConfigDict(from_attributes=True)
