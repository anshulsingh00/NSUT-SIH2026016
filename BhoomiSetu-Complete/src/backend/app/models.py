from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, DateTime, JSON, func
from database import Base

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True)
    code = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    head_name = Column(String)
    nodal_officer = Column(String)
    contact_email = Column(String)
    allocated_budget_cr = Column(Float)
    description = Column(String)
    status = Column(String, default = "ACTIVE")
    head_designation = Column(String)
    contact_phone = Column(String)
    nodal_officer_phone = Column(String)
    office_address = Column(String)
    created_date = Column(DateTime)


class Jurisdiction(Base):
    __tablename__ = "jurisdiction"


    id = Column(Integer,primary_key = True)
    name = Column(String, nullable = False)
    type = Column(String)
    parent_id = Column(Integer, ForeignKey("jurisdiction.id"))

class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key = True)
    name = Column(String, nullable = False)
    email = Column(String, nullable = False, unique = True)
    phone = Column(String)
    password_hash = Column(String, nullable = False)
    role_level = Column(String)
    designation = Column(String)
    department_id = Column(Integer, ForeignKey("departments.id"))
    jurisdiction_id = Column(Integer, ForeignKey("jurisdiction.id"))
    digital_signature_verified =Column(Boolean, default = False )
    created_at = Column(DateTime, default = func.now())

    @property
    def role(self) -> str:
        """
        Collapse the 11 role levels into the three roles the frontend uses.
        A plain Python property, not a database column - nothing is stored,
        it is worked out from role_level whenever it is read.
        """
        if self.role_level in ("L0", "L1", "L2", "L10"):
            return "ADMIN"
        if self.role_level == "L9":
            return "LANDOWNER"
        return "OFFICER"


class Project(Base):
    __tablename__ = "project"

    id = Column(Integer, primary_key = True)
    name = Column(String, nullable = False)
    department_id = Column(Integer, ForeignKey("departments.id"))
    jurisdiction_id = Column(Integer, ForeignKey("jurisdiction.id"))
    project_type = Column(String)
    status = Column(String)
    current_stage = Column(String)
    total_area_acres = Column(Float)
    estimated_budget_cr = Column(Float)
    disbursed_compensation_cr = Column(Float, default = 0)
    start_date = Column(DateTime)
    expected_completion_date = Column(DateTime)
    objectives = Column(String)
    scope = Column(String)
    assigned_officer = Column(String)
    responsible_team = Column(String)
    stage_updated_at = Column(DateTime, default=func.now())

    # Fields required by the SIH problem statement (national dashboard metrics)
    area_notified_acres = Column(Float)
    area_acquired_acres = Column(Float)
    affected_families_count = Column(Integer)
    displaced_families_count = Column(Integer)
    possession_status = Column(String)
    rr_status = Column(String)
    compensation_assessed_cr = Column(Float)

    # Governance rules - exactly one set per project, so plain columns rather
    # than a separate table (nothing here can exist without its project).
    approval_level_required = Column(String)
    solatium_policy = Column(String)
    escalation_threshold_days = Column(Integer)
    audit_strictness = Column(String)
    auto_dispute_escalation = Column(Boolean, default=False)



class Land_parcel(Base):
    __tablename__ = "land_parcel"
    id = Column(Integer, primary_key = True)
    project_id = Column(Integer, ForeignKey("project.id" ))
    owner_user_id = Column(Integer, ForeignKey("user.id"))
    jurisdiction_id = Column(Integer, ForeignKey("jurisdiction.id"))
    survey_number= Column(String)
    khasra_number = Column(String)
    khatauni_number = Column(String)
    area_acre = Column(Float)
    land_type = Column(String)
    circle_rate_per_acre = Column(Float)
    # Compensation breakdown - all computed by the backend, never entered by hand.
    # market_value_total    = area_acre * circle_rate_per_acre
    # solatium_amount       = market_value_total  (100%, Sec 30(1) RFCTLARR 2013)
    # total_compensation    = market_value_total + solatium_amount + additional_asset_value
    market_value_total = Column(Float)
    solatium_amount = Column(Float)
    additional_asset_value = Column(Float, default = 0)
    total_compensation = Column(Float)
    verification_status  = Column(String)
    compensation_status = Column(String)
    status = Column(String)
    # Shayad nahi use hoga, but we will see
    latitude = Column(Float)
    longitude = Column(Float)


class sla_rules(Base):
    __tablename__ = "sla_rules"


    id = Column(String, primary_key=True)
    name = Column(String)
    department = Column(String)
    category = Column(String)
    priority = Column(String)
    response_time_hours = Column(Integer)
    resolution_time_hours = Column(Integer)
    escalation_threshold_hours  = Column(Integer)
    is_active = Column(Boolean)


# ===========================================================================
# Acquisition workflow
# ===========================================================================

class ProjectStage(Base):
    """
    One row per statutory stage per project - ten rows for a full project.

    Project.current_stage is a single string saying where a project is now;
    this table is the whole timeline, including stages already finished, so
    the UI can draw progress and the risk engine can measure any stage.
    """
    __tablename__ = "project_stage"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("project.id"), nullable=False)
    stage = Column(String, nullable=False)
    label = Column(String)
    status = Column(String)              # COMPLETED | IN_PROGRESS | PENDING | DELAYED
    sequence = Column(Integer)           # 1-10, so stages sort correctly
    target_days = Column(Integer)
    actual_days = Column(Integer)
    started_date = Column(DateTime)
    completed_date = Column(DateTime)
    assigned_officer_id = Column(Integer, ForeignKey("user.id"))
    notes = Column(String)


class Document(Base):
    """A file uploaded against a land parcel, plus its verification state."""
    __tablename__ = "document"

    id = Column(Integer, primary_key=True)
    parcel_id = Column(Integer, ForeignKey("land_parcel.id"))
    project_id = Column(Integer, ForeignKey("project.id"))
    title = Column(String)
    document_type = Column(String)
    file_name = Column(String)
    file_size = Column(String)
    # The file itself lives in object storage; the database stores a pointer.
    file_url = Column(String)
    upload_date = Column(DateTime, default=func.now())
    status = Column(String)              # Pending | Under Review | Verified | Rejected
    verified_by_id = Column(Integer, ForeignKey("user.id"))
    verified_date = Column(DateTime)
    rejection_reason = Column(String)
    # OCR output kept as JSON - its shape varies by document type, and it is
    # read as a whole rather than queried field by field.
    ocr_data = Column(JSON)
    ocr_confidence = Column(Float)


class DocumentVerification(Base):
    """
    One row per verification attempt - append-only history.

    Document.status holds only the latest outcome. A document that was
    rejected, resubmitted and then approved has three rows here, which is
    what an audit actually needs to see.
    """
    __tablename__ = "document_verification"

    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey("document.id"), nullable=False)
    verified_by_id = Column(Integer, ForeignKey("user.id"))
    status = Column(String)              # the decision made in this round
    remarks = Column(String)
    verified_at = Column(DateTime, default=func.now())


class CompensationRecord(Base):
    """
    The payment side of a parcel: award, approval and DBT disbursement.

    Money amounts are copied from the parcel at award time on purpose - once
    an award is declared under Sec 23 it is a fixed legal figure, and must not
    change if someone later edits the parcel's circle rate.
    """
    __tablename__ = "compensation_record"

    id = Column(Integer, primary_key=True)
    parcel_id = Column(Integer, ForeignKey("land_parcel.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("project.id"))
    landowner_id = Column(Integer, ForeignKey("user.id"))

    basic_land_value = Column(Float)
    solatium_multiplier = Column(Float, default=1.0)   # 100% under Sec 30(1)
    solatium_amount = Column(Float)
    additional_asset_value = Column(Float, default=0)
    total_compensation = Column(Float)

    status = Column(String)              # Calculation | Review | Approved | Processing | Paid
    approved_by_id = Column(Integer, ForeignKey("user.id"))
    approved_date = Column(DateTime)

    bank_name = Column(String)
    bank_account_masked = Column(String)
    ifsc_code = Column(String)
    dbt_transaction_id = Column(String)
    disbursement_date = Column(DateTime)
    award_notification_no = Column(String)


# ===========================================================================
# Oversight and statutory tracking
# ===========================================================================

class StatutoryNotification(Base):
    """
    Formal notifications issued under the RFCTLARR Act (Sec 4, 6, 11, 19, 23).

    Distinct from the in-app Notification table below: these are legal
    instruments published in the gazette, and "notifications issued" is one of
    the headline metrics the problem statement asks the dashboard to show.
    """
    __tablename__ = "statutory_notification"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("project.id"), nullable=False)
    jurisdiction_id = Column(Integer, ForeignKey("jurisdiction.id"))
    notification_no = Column(String)
    section = Column(String)             # e.g. "Section 4(1)", "Section 23"
    title = Column(String)
    issue_date = Column(DateTime)
    gazette_reference = Column(String)
    area_notified_acres = Column(Float)
    status = Column(String)              # Draft | Issued | Published | Superseded
    issued_by_id = Column(Integer, ForeignKey("user.id"))


class AuditLog(Base):
    """Immutable record of every significant action taken in the system."""
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, default=func.now())
    user_id = Column(Integer, ForeignKey("user.id"))
    user_name = Column(String)           # copied, so the log survives user deletion
    role = Column(String)
    department = Column(String)
    action = Column(String)
    entity_type = Column(String)         # Project | LandParcel | Document | ...
    entity_id = Column(String)
    details = Column(String)
    ip_address = Column(String)


class RiskAlert(Base):
    """
    A recorded delay flag.

    The live engine in risk_engine.py computes current risk on request; this
    table stores flags that were raised so they can be assigned, actioned and
    marked resolved, and so history survives after the delay is fixed.
    """
    __tablename__ = "risk_alert"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("project.id"), nullable=False)
    current_stage = Column(String)
    days_pending = Column(Integer)
    expected_days = Column(Integer)
    severity = Column(String)            # LOW | MEDIUM | HIGH | CRITICAL
    reason = Column(String)
    recommended_action = Column(String)
    affected_parcels_count = Column(Integer)
    bottleneck_officer_id = Column(Integer, ForeignKey("user.id"))
    detected_date = Column(DateTime, default=func.now())
    status = Column(String, default="ACTIVE")   # ACTIVE | RESOLVED
    resolved_by_id = Column(Integer, ForeignKey("user.id"))
    resolved_date = Column(DateTime)


class Notification(Base):
    """In-app alert shown to a role or a specific user."""
    __tablename__ = "notification"

    id = Column(Integer, primary_key=True)
    target_role = Column(String)         # OFFICER | LANDOWNER | ADMIN | ALL
    target_user_id = Column(Integer, ForeignKey("user.id"))
    title = Column(String)
    message = Column(String)
    type = Column(String)
    read = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=func.now())
    link_route = Column(String)
    parcel_id = Column(Integer, ForeignKey("land_parcel.id"))
    project_id = Column(Integer, ForeignKey("project.id"))


# ===========================================================================
# Configuration and sensitive data
# ===========================================================================

class SystemSettings(Base):
    """
    Platform-wide configuration. Exactly one row, id = 1.

    session_timeout_minutes and two_factor_auth_required are read by the auth
    layer, so security policy is administrator-configurable rather than
    hardcoded in security.py.
    """
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True)
    app_name = Column(String, default="BhoomiSetu")
    organization_name = Column(String)
    support_email = Column(String)
    notifications_enabled = Column(Boolean, default=True)
    default_language = Column(String, default="EN")
    session_timeout_minutes = Column(Integer, default=60)
    two_factor_auth_required = Column(Boolean, default=False)
    maintenance_mode = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


class LandownerKYC(Base):
    """
    Unmasked identity and bank details, isolated from the users table.

    Kept separate so access can be restricted to the few roles that genuinely
    need it (LAO, finance, the citizen themselves, read-only audit). Values are
    stored encrypted; the API only ever returns the masked form.
    """
    __tablename__ = "landowner_kyc"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False, unique=True)
    aadhaar_encrypted = Column(String)
    aadhaar_masked = Column(String)          # e.g. XXXX-XXXX-8921, safe to display
    pan_encrypted = Column(String)
    bank_account_encrypted = Column(String)
    bank_account_masked = Column(String)
    bank_name = Column(String)
    ifsc_code = Column(String)
    account_holder_name = Column(String)
    kyc_status = Column(String, default="Pending")   # Pending | Verified | Rejected
    verified_date = Column(DateTime)
    created_at = Column(DateTime, default=func.now())


