"""
Seed the database with a realistic demo dataset.

Run with:  python seed.py

Administrative names (states / districts / villages) are real public data.
All personal details, bank data and compensation figures are SYNTHETIC —
no real citizen information is used anywhere in this file.
"""

import random
from datetime import datetime, timedelta

from calculations import calculate_compensation
from database import SessionLocal
from models import (
    AuditLog, CompensationRecord, Department, Document, DocumentVerification,
    Jurisdiction, Land_parcel, LandownerKYC, Notification, Project,
    ProjectStage, RiskAlert, StatutoryNotification, SystemSettings, User,
    sla_rules,
)
from security import hash_password

# Fixes every random choice, so the same names, statuses and amounts appear
# on every run. Dates are relative to now(), so elapsed-day counts move
# forward over time - which is intended: the delay engine must age.
random.seed(42)

DEMO_PASSWORD = "bhoomi123"


def wipe(db):
    """Delete existing rows so the script can be re-run safely."""
    # Order matters: rows that point at others must go first.
    for model in (
        DocumentVerification, Document, CompensationRecord, RiskAlert,
        Notification, AuditLog, StatutoryNotification, ProjectStage,
        LandownerKYC, SystemSettings,
        Land_parcel, Project, User, Department, Jurisdiction, sla_rules,
    ):
        db.query(model).delete()
    db.commit()


def seed_jurisdictions(db):
    """Build the nation -> state -> district -> village tree."""
    india = Jurisdiction(name="India", type="NATION", parent_id=None)
    db.add(india)
    db.commit()
    db.refresh(india)

    tree = {
        "Delhi NCT": {
            "North Delhi": ["Narela", "Bawana", "Alipur"],
            "South West Delhi": ["Najafgarh", "Dwarka", "Kapashera"],
        },
        "Haryana": {
            "Gurugram": ["Manesar", "Sohna", "Farrukhnagar"],
            "Sonipat": ["Kharkhoda", "Gohana", "Rai"],
        },
        "Uttar Pradesh": {
            "Gautam Buddha Nagar": ["Dadri", "Jewar", "Dankaur"],
            "Meerut": ["Sardhana", "Mawana", "Kithore"],
        },
    }

    villages = []
    for state_name, districts in tree.items():
        state = Jurisdiction(name=state_name, type="STATE", parent_id=india.id)
        db.add(state)
        db.commit()
        db.refresh(state)

        for district_name, village_names in districts.items():
            district = Jurisdiction(name=district_name, type="DISTRICT", parent_id=state.id)
            db.add(district)
            db.commit()
            db.refresh(district)

            for village_name in village_names:
                village = Jurisdiction(name=village_name, type="VILLAGE", parent_id=district.id)
                db.add(village)
                db.commit()
                db.refresh(village)
                villages.append(village)

    print(f"  jurisdictions: {db.query(Jurisdiction).count()}")
    return india, villages


def seed_departments(db):
    rows = [
        Department(
            code="NHAI", name="National Highways Authority of India",
            head_name="Shri Arvind Swarup", head_designation="Regional Officer",
            nodal_officer="P.K. Malhotra, GM (Tech)", contact_email="ro.delhi@nhai.gov.in",
            contact_phone="+91 11 2567 1000", allocated_budget_cr=11500.0,
            status="ACTIVE", office_address="G-5 & 6, Sector 10, Dwarka, New Delhi",
            description="Central authority for national highway development and land acquisition.",
            created_date=datetime(2024, 4, 1),
        ),
        Department(
            code="PWD-NCR", name="Public Works Department, Delhi NCR",
            head_name="Er. Virendra Tyagi", head_designation="Chief Engineer",
            nodal_officer="S.K. Rathore, SLAO", contact_email="pwd.landcell@delhi.gov.in",
            contact_phone="+91 11 2339 4021", allocated_budget_cr=4200.0,
            status="ACTIVE", office_address="MSO Building, I.P. Estate, New Delhi",
            description="State public works and urban road infrastructure.",
            created_date=datetime(2024, 4, 1),
        ),
        Department(
            code="DFCCIL", name="Dedicated Freight Corridor Corporation of India Ltd",
            head_name="Smt. Ananya Sen", head_designation="Director (Projects)",
            nodal_officer="Amitabh Sen, CPM", contact_email="land.dfccil@railnet.gov.in",
            contact_phone="+91 11 2436 7890", allocated_budget_cr=7800.0,
            status="ACTIVE", office_address="Pragati Maidan, New Delhi",
            description="Railway freight corridor land acquisition and execution.",
            created_date=datetime(2024, 5, 15),
        ),
        Department(
            code="DMRC", name="Delhi Metro Rail Corporation",
            head_name="Shri K.K. Aggarwal", head_designation="Director (Planning)",
            nodal_officer="Meera Deshmukh, Dy CPM", contact_email="metro.land@dmrc.org",
            contact_phone="+91 11 2341 7910", allocated_budget_cr=2900.0,
            status="ACTIVE", office_address="Metro Bhawan, Barakhamba Road, New Delhi",
            description="Metro rail corridor planning and station area acquisition.",
            created_date=datetime(2024, 6, 1),
        ),
        Department(
            code="HSIIDC", name="Haryana State Industrial & Infrastructure Development Corp",
            head_name="Shri R.K. Bhardwaj", head_designation="Managing Director",
            nodal_officer="Sandeep Khatri, LAO", contact_email="land.hsiidc@hry.gov.in",
            contact_phone="+91 172 290 1234", allocated_budget_cr=3600.0,
            status="ACTIVE", office_address="C-13/14, Sector 6, Panchkula, Haryana",
            description="Industrial estate and logistics park land development.",
            created_date=datetime(2024, 7, 20),
        ),
    ]
    db.add_all(rows)
    db.commit()
    print(f"  departments:   {len(rows)}")
    return rows


def seed_users(db, departments, jurisdictions_by_name):
    """One user per role level L0-L10. All passwords are the same demo password."""
    specs = [
        ("L0",  "Dr. Rajesh Meena, IAS",   "dg.landrecords@nic.in",       "Director General, Land Records",        None,   "India"),
        ("L1",  "Smt. Kavita Sharma, IAS", "state.admin.delhi@nic.in",    "State Nodal Officer",                   None,   "Delhi NCT"),
        ("L2",  "Shri Anil Deshmukh, IAS", "collector.northdelhi@nic.in", "District Collector",                    None,   "North Delhi"),
        ("L3",  "P.K. Malhotra",           "pm.nhai@nhai.gov.in",         "Project Manager",                       "NHAI", "Delhi NCT"),
        ("L4",  "S.K. Rathore",            "sk.rathore@delhi.gov.in",     "Special Land Acquisition Officer",      "PWD-NCR", "North Delhi"),
        ("L5",  "Ramesh Yadav",            "patwari.narela@delhi.gov.in", "Field Surveyor / Patwari",              "PWD-NCR", "Narela"),
        ("L6",  "Adv. Neha Kulkarni",      "legal.northdelhi@nic.in",     "Legal & Hearing Officer",               None,   "North Delhi"),
        ("L7",  "Suresh Iyer",             "treasury.delhi@nic.in",       "Finance / Treasury Officer",            None,   "Delhi NCT"),
        ("L8",  "Priya Sharma",            "grievance.delhi@nic.in",      "Grievance Redressal Officer",           None,   "Delhi NCT"),
        ("L9",  "Raj Kumar",               "rajkumar.narela@example.com", "Landowner",                             None,   "Narela"),
        ("L10", "Vigilance Audit Cell",    "audit.cag@cag.gov.in",        "Auditor / Oversight",                   None,   "India"),
    ]

    dept_by_code = {d.code: d.id for d in departments}
    rows = []
    for role_level, name, email, designation, dept_code, jurisdiction_name in specs:
        rows.append(User(
            name=name,
            email=email,
            password_hash=hash_password(DEMO_PASSWORD),
            role_level=role_level,
            designation=designation,
            phone=f"+91 9{random.randint(100000000, 999999999)}",
            department_id=dept_by_code.get(dept_code) if dept_code else None,
            jurisdiction_id=jurisdictions_by_name.get(jurisdiction_name),
            digital_signature_verified=role_level not in ("L9",),
        ))
    db.add_all(rows)
    db.commit()
    print(f"  users:         {len(rows)}  (password for all: {DEMO_PASSWORD!r})")
    return rows


def seed_projects(db, departments, jurisdictions_by_name):
    dept = {d.code: d.id for d in departments}
    # Last value is days_at_stage - how long the project has been sitting at its
    # current stage. Chosen against each stage's target so the risk engine
    # produces one of every severity band instead of all-green.
    #   stage target vs days_at_stage -> expected severity
    #   Survey Completed     60 vs 40  ->  ON_TRACK
    #   Ownership Verified   30 vs 33  ->  ATTENTION   (3 days over)
    #   Payment Processing   15 vs 35  ->  HIGH_RISK   (20 days over)
    #   Valuation Completed  30 vs 78  ->  CRITICAL    (48 days over)
    #   Documents Submitted  45 vs 60  ->  HIGH_RISK   (15 days over)
    #   Land Identified      45 vs 10  ->  ON_TRACK
    specs = [
        ("Delhi-Meerut Connectivity Corridor",   "NHAI",   "Delhi NCT",      "Expressway / Highway", "In Progress",     "Survey Completed",     1240.0, 13450.0, 40),
        ("Western Dedicated Freight Corridor",   "DFCCIL", "Haryana",        "Railway Freight",      "In Progress",     "Ownership Verified",   2180.0, 7800.0,  33),
        ("Jewar Airport Access Road",            "NHAI",   "Uttar Pradesh",  "Expressway / Highway", "Near Completion", "Payment Processing",   860.0,  4100.0,  35),
        ("Dwarka Metro Extension Phase IV",      "DMRC",   "Delhi NCT",      "Metro Rail",           "In Progress",     "Valuation Completed",  310.0,  2900.0,  78),
        ("Manesar Industrial Logistics Park",    "HSIIDC", "Haryana",        "Industrial Zone",      "Delayed",         "Documents Submitted",  1520.0, 3600.0,  60),
        ("Sonipat-Gohana Irrigation Canal",      "PWD-NCR","Haryana",        "Irrigation",           "Planning",        "Land Identified",      640.0,  980.0,   10),
    ]

    rows = []
    for name, dept_code, jur_name, ptype, status, stage, area, budget, days_at_stage in specs:
        notified = round(area * random.uniform(0.90, 1.00), 1)
        acquired = round(notified * random.uniform(0.35, 0.95), 1)
        assessed = round(budget * random.uniform(0.30, 0.60), 1)
        disbursed = round(assessed * random.uniform(0.40, 0.95), 1)
        affected = random.randint(180, 2400)

        rows.append(Project(
            name=name,
            department_id=dept[dept_code],
            jurisdiction_id=jurisdictions_by_name.get(jur_name),
            project_type=ptype,
            status=status,
            current_stage=stage,
            stage_updated_at=datetime.now() - timedelta(days=days_at_stage),
            total_area_acres=area,
            estimated_budget_cr=budget,
            area_notified_acres=notified,
            area_acquired_acres=acquired,
            compensation_assessed_cr=assessed,
            disbursed_compensation_cr=disbursed,
            affected_families_count=affected,
            displaced_families_count=int(affected * random.uniform(0.15, 0.40)),
            possession_status=random.choice(["Not Started", "Partial", "Substantial", "Complete"]),
            rr_status=random.choice(["Not Started", "In Progress", "Awaiting Approval", "Completed"]),
            assigned_officer="S.K. Rathore, SLAO",
            responsible_team="District Land Acquisition Cell",
            objectives="Statutory acquisition under RFCTLARR Act 2013 for public infrastructure.",
            scope=f"{area} acres across notified villages.",
            start_date=datetime(2025, random.randint(1, 9), random.randint(1, 28)),
            expected_completion_date=datetime(2027, random.randint(1, 12), random.randint(1, 28)),
        ))
    db.add_all(rows)
    db.commit()
    for r in rows:
        db.refresh(r)
    print(f"  projects:      {len(rows)}")
    return rows


def seed_land_parcels(db, projects, villages, landowner_user_id):
    """~8 parcels per project, spread across villages."""
    land_types = ["Agricultural", "Residential", "Commercial", "Industrial", "Barren"]
    verif = ["Pending", "Under Review", "Verified", "Rejected"]
    comp = ["Calculation", "Review", "Approved", "Processing", "Paid"]
    parcel_status = ["Verified", "Pending", "Disputed", "Acquired", "Compensation Pending", "In Progress"]

    rows = []
    for project in projects:
        for i in range(8):
            village = random.choice(villages)
            area = round(random.uniform(0.4, 6.5), 2)
            circle_rate = random.choice([900000, 1200000, 1800000, 2400000, 3600000])
            assets = round(random.uniform(50000, 400000), -3)

            # same function the API uses, so seeded and API-created rows agree
            money = calculate_compensation(area, float(circle_rate), assets)

            rows.append(Land_parcel(
                project_id=project.id,
                owner_user_id=landowner_user_id if (project.id == 1 and i == 0) else None,
                jurisdiction_id=village.id,
                survey_number=f"{random.randint(100, 999)}/{random.choice('ABCD')}",
                khasra_number=f"{random.randint(10, 99)}/{random.randint(1, 30)}",
                khatauni_number=str(random.randint(100, 999)),
                area_acre=area,
                land_type=random.choice(land_types),
                circle_rate_per_acre=float(circle_rate),
                market_value_total=money["market_value_total"],
                solatium_amount=money["solatium_amount"],
                additional_asset_value=money["additional_asset_value"],
                total_compensation=money["total_compensation"],
                verification_status=random.choice(verif),
                compensation_status=random.choice(comp),
                status=random.choice(parcel_status),
                latitude=round(random.uniform(28.40, 29.10), 6),
                longitude=round(random.uniform(76.80, 77.60), 6),
            ))
    db.add_all(rows)
    db.commit()
    print(f"  land parcels:  {len(rows)}")
    return rows


def seed_sla_rules(db):
    rows = [
        sla_rules(id="SLA-001", name="Document Verification", department="PWD-NCR",
                  category="Documents", priority="HIGH", response_time_hours=24,
                  resolution_time_hours=168, escalation_threshold_hours=192, is_active=True),
        sla_rules(id="SLA-002", name="Valuation Approval", department="NHAI",
                  category="Compensation", priority="HIGH", response_time_hours=48,
                  resolution_time_hours=360, escalation_threshold_hours=400, is_active=True),
        sla_rules(id="SLA-003", name="Compensation Disbursement", department="NHAI",
                  category="Payment", priority="CRITICAL", response_time_hours=24,
                  resolution_time_hours=120, escalation_threshold_hours=168, is_active=True),
        sla_rules(id="SLA-004", name="Grievance Redressal", department="PWD-NCR",
                  category="Grievance", priority="MEDIUM", response_time_hours=72,
                  resolution_time_hours=360, escalation_threshold_hours=720, is_active=True),
    ]
    db.add_all(rows)
    db.commit()
    print(f"  sla rules:     {len(rows)}")



# ===========================================================================
# Workflow tables
# ===========================================================================

STAGE_SEQUENCE = [
    ("Project Created", "Feasibility & Gazette Notification Sec 4(1)", 30),
    ("Land Identified", "Revenue Cadastral Demarcation Sec 6", 45),
    ("Survey Completed", "Joint Measurement Survey (JMS)", 60),
    ("Documents Submitted", "Landowner Claims & Title Deeds", 45),
    ("Ownership Verified", "7/12 & Khatauni Revenue Verification", 30),
    ("Valuation Completed", "Circle Rate & Solatium Calculation", 30),
    ("Compensation Approval", "Competent Authority Award Sec 23", 10),
    ("Payment Processing", "Direct Benefit Transfer (PFMS / DBT)", 15),
    ("Final Acquisition", "Possession Certificate & Mutation", 20),
    ("Project Completion", "Civil Construction Handover", 15),
]


def seed_project_stages(db, projects, officers):
    """
    Ten stage rows per project.

    Stages before the project's current one are marked COMPLETED and given a
    plausible actual duration; the current one is IN_PROGRESS starting from the
    project's stage_updated_at; the rest are PENDING.
    """
    stage_names = [s[0] for s in STAGE_SEQUENCE]
    rows = []

    for project in projects:
        try:
            current_index = stage_names.index(project.current_stage)
        except ValueError:
            current_index = 0

        # Work backwards from when the current stage began.
        cursor = project.stage_updated_at or datetime.now()

        completed = []
        for offset in range(current_index - 1, -1, -1):
            _, _, target = STAGE_SEQUENCE[offset]
            actual = max(1, int(target * random.uniform(0.7, 1.25)))
            ended = cursor
            started = ended - timedelta(days=actual)
            completed.append((offset, started, ended, actual))
            cursor = started
        completed.reverse()

        for offset, started, ended, actual in completed:
            stage, label, target = STAGE_SEQUENCE[offset]
            rows.append(ProjectStage(
                project_id=project.id, stage=stage, label=label,
                sequence=offset + 1, status="COMPLETED",
                target_days=target, actual_days=actual,
                started_date=started, completed_date=ended,
                assigned_officer_id=random.choice(officers).id,
            ))

        stage, label, target = STAGE_SEQUENCE[current_index]
        elapsed = (datetime.now() - (project.stage_updated_at or datetime.now())).days
        rows.append(ProjectStage(
            project_id=project.id, stage=stage, label=label,
            sequence=current_index + 1,
            status="DELAYED" if elapsed > target else "IN_PROGRESS",
            target_days=target, actual_days=elapsed,
            started_date=project.stage_updated_at,
            assigned_officer_id=random.choice(officers).id,
        ))

        for offset in range(current_index + 1, len(STAGE_SEQUENCE)):
            stage, label, target = STAGE_SEQUENCE[offset]
            rows.append(ProjectStage(
                project_id=project.id, stage=stage, label=label,
                sequence=offset + 1, status="PENDING", target_days=target,
            ))

    db.add_all(rows)
    db.commit()
    print(f"  project stages:{len(rows):>4}")


DOCUMENT_TYPES = [
    "Ownership Proof (7/12 & Khatauni)",
    "Identity Proof (Aadhaar/PAN)",
    "Survey & Demarcation Report",
    "Valuation & Tree/Structure Report",
    "Compensation Form & Bank Mandate",
    "No Objection Certificate (NOC)",
    "Gram Sabha Resolution",
]


def seed_documents(db, parcels, officers):
    """Two to four documents per parcel, at mixed verification states."""
    statuses = ["Pending", "Under Review", "Verified", "Rejected"]
    weights = [3, 2, 4, 1]
    rows = []

    for parcel in parcels:
        for doc_type in random.sample(DOCUMENT_TYPES, random.randint(2, 4)):
            status = random.choices(statuses, weights=weights)[0]
            uploaded = datetime.now() - timedelta(days=random.randint(5, 180))
            confidence = round(random.uniform(72.0, 99.4), 1)

            rows.append(Document(
                parcel_id=parcel.id,
                project_id=parcel.project_id,
                title=f"{doc_type} - {parcel.khasra_number}",
                document_type=doc_type,
                file_name=f"{doc_type.split()[0].lower()}_{parcel.id}.pdf",
                file_size=f"{random.randint(180, 4200)} KB",
                file_url=f"/storage/documents/parcel-{parcel.id}/{doc_type.split()[0].lower()}.pdf",
                upload_date=uploaded,
                status=status,
                verified_by_id=random.choice(officers).id if status in ("Verified", "Rejected") else None,
                verified_date=uploaded + timedelta(days=random.randint(1, 20)) if status in ("Verified", "Rejected") else None,
                rejection_reason="Document illegible; please re-scan at higher resolution." if status == "Rejected" else None,
                ocr_confidence=confidence,
                ocr_data={
                    "khasraNumber": parcel.khasra_number,
                    "surveyNumber": parcel.survey_number,
                    "areaAcres": parcel.area_acre,
                    "circleRate": parcel.circle_rate_per_acre,
                    "confidenceScore": confidence,
                },
            ))

    db.add_all(rows)
    db.commit()
    print(f"  documents:     {len(rows):>4}")
    return rows


def seed_document_verifications(db, documents, officers):
    """History rows for documents that have actually been reviewed."""
    rows = []
    for document in documents:
        if document.status in ("Pending",):
            continue

        # Some documents were rejected once before being approved.
        if document.status == "Verified" and random.random() < 0.3:
            rows.append(DocumentVerification(
                document_id=document.id,
                verified_by_id=random.choice(officers).id,
                status="Rejected",
                remarks="Signature mismatch against revenue record.",
                verified_at=(document.upload_date or datetime.now()) + timedelta(days=2),
            ))

        rows.append(DocumentVerification(
            document_id=document.id,
            verified_by_id=document.verified_by_id or random.choice(officers).id,
            status=document.status,
            remarks=document.rejection_reason or "Verified against revenue records.",
            verified_at=document.verified_date or datetime.now(),
        ))

    db.add_all(rows)
    db.commit()
    print(f"  doc reviews:   {len(rows):>4}")


BANKS = [
    ("State Bank of India", "SBIN0001244"),
    ("Punjab National Bank", "PUNB0234500"),
    ("Bank of Baroda", "BARB0DELHIX"),
    ("HDFC Bank", "HDFC0000123"),
]


def seed_compensation_records(db, parcels, officers):
    """One award record per parcel, at various points in the payment pipeline."""
    statuses = ["Calculation", "Review", "Approved", "Processing", "Paid"]
    weights = [3, 3, 4, 2, 3]
    rows = []

    for parcel in parcels:
        status = random.choices(statuses, weights=weights)[0]
        bank_name, ifsc = random.choice(BANKS)
        approved = status in ("Approved", "Processing", "Paid")
        approved_date = datetime.now() - timedelta(days=random.randint(5, 90)) if approved else None

        rows.append(CompensationRecord(
            parcel_id=parcel.id,
            project_id=parcel.project_id,
            landowner_id=parcel.owner_user_id,
            basic_land_value=parcel.market_value_total,
            solatium_multiplier=1.0,
            solatium_amount=parcel.solatium_amount,
            additional_asset_value=parcel.additional_asset_value,
            total_compensation=parcel.total_compensation,
            status=status,
            approved_by_id=random.choice(officers).id if approved else None,
            approved_date=approved_date,
            bank_name=bank_name,
            bank_account_masked=f"XXXX-XXXX-{random.randint(1000, 9999)}",
            ifsc_code=ifsc,
            dbt_transaction_id=f"PFMS{datetime.now():%Y}{random.randint(100000, 999999)}" if status == "Paid" else None,
            disbursement_date=(approved_date + timedelta(days=random.randint(3, 25))) if status == "Paid" and approved_date else None,
            award_notification_no=f"LAC/{random.choice(['ND', 'GGN', 'SNP', 'GBN'])}/2026/AW-{random.randint(1000, 9999)}",
        ))

    db.add_all(rows)
    db.commit()
    print(f"  compensation:  {len(rows):>4}")


def seed_statutory_notifications(db, projects, officers, jurisdictions_by_name):
    """
    Gazette notifications issued per project.

    How far through the statutory sequence a project has got depends on which
    stage it has reached - a project still at survey has not issued a Sec 23
    award.
    """
    sections = [
        ("Section 4(1)", "Preliminary Notification of Intent to Acquire", 0),
        ("Section 6", "Declaration of Intended Acquisition", 1),
        ("Section 11", "Publication of Draft Land Records", 3),
        ("Section 19", "Declaration of Public Purpose", 4),
        ("Section 23", "Award of Compensation by Competent Authority", 6),
    ]
    stage_names = [s[0] for s in STAGE_SEQUENCE]
    rows = []

    for project in projects:
        try:
            reached = stage_names.index(project.current_stage)
        except ValueError:
            reached = 0

        for section, title, required_stage in sections:
            if required_stage > reached:
                continue
            issued = datetime.now() - timedelta(days=random.randint(60, 640))
            rows.append(StatutoryNotification(
                project_id=project.id,
                jurisdiction_id=project.jurisdiction_id,
                notification_no=f"{section.split()[1].strip('()')}/{random.randint(100, 999)}/2026",
                section=section,
                title=f"{title} - {project.name}",
                issue_date=issued,
                gazette_reference=f"GOI-GAZ-{issued:%Y}-{random.randint(10000, 99999)}",
                area_notified_acres=round((project.area_notified_acres or 0) * random.uniform(0.3, 1.0), 1),
                status=random.choice(["Issued", "Published", "Published"]),
                issued_by_id=random.choice(officers).id,
            ))

    db.add_all(rows)
    db.commit()
    print(f"  statutory:     {len(rows):>4}")


def seed_risk_alerts(db, projects):
    """Persisted delay flags, including some already resolved."""
    from risk_engine import calculate_risk

    rows = []
    for project in projects:
        risk = calculate_risk(project)
        if risk["severity"] == "ON_TRACK":
            continue

        severity_map = {"ATTENTION": "MEDIUM", "HIGH_RISK": "HIGH", "CRITICAL": "CRITICAL"}
        rows.append(RiskAlert(
            project_id=project.id,
            current_stage=risk["current_stage"],
            days_pending=risk["days_pending"],
            expected_days=risk["target_days"],
            severity=severity_map.get(risk["severity"], "MEDIUM"),
            reason=risk["reason"],
            recommended_action=risk["recommended_action"],
            affected_parcels_count=random.randint(4, 40),
            detected_date=datetime.now() - timedelta(days=random.randint(1, 14)),
            status="ACTIVE",
        ))

    # A couple of historical alerts that were dealt with.
    for project in projects[:2]:
        rows.append(RiskAlert(
            project_id=project.id,
            current_stage="Documents Submitted",
            days_pending=52, expected_days=45, severity="MEDIUM",
            reason="Documents Submitted exceeded its 45-day target by 7 days.",
            recommended_action="Review pending items with the assigned officer.",
            affected_parcels_count=random.randint(3, 18),
            detected_date=datetime.now() - timedelta(days=random.randint(60, 120)),
            status="RESOLVED",
            resolved_date=datetime.now() - timedelta(days=random.randint(20, 55)),
        ))

    db.add_all(rows)
    db.commit()
    print(f"  risk alerts:   {len(rows):>4}")


def seed_notifications(db, users, projects, parcels):
    """In-app alerts across the three roles."""
    officer = next(u for u in users if u.role_level == "L4")
    landowner = next(u for u in users if u.role_level == "L9")
    rows = [
        Notification(target_user_id=landowner.id, target_role="LANDOWNER",
                     title="Compensation Approved",
                     message="Your Section 23 award has been approved and queued for DBT disbursement.",
                     type="COMPENSATION_UPDATE", read=False,
                     link_route="/landowner/payments",
                     timestamp=datetime.now() - timedelta(hours=6)),
        Notification(target_user_id=landowner.id, target_role="LANDOWNER",
                     title="Document Verification Required",
                     message="Your bank mandate form needs re-submission - the uploaded scan was illegible.",
                     type="ACTION_REQUIRED", read=False,
                     link_route="/landowner/documents",
                     timestamp=datetime.now() - timedelta(days=2)),
        Notification(target_user_id=officer.id, target_role="OFFICER",
                     title="SLA Breach - Valuation Stage",
                     message="Dwarka Metro Extension Phase IV is critically overdue at Valuation Completed.",
                     type="SYSTEM_ALERT", read=False,
                     link_route="/officer/risk-monitor",
                     timestamp=datetime.now() - timedelta(hours=2)),
        Notification(target_role="OFFICER",
                     title="12 Documents Awaiting Verification",
                     message="Documents across three corridors are pending review beyond the 24-hour response target.",
                     type="ACTION_REQUIRED", read=False,
                     link_route="/officer/documents",
                     timestamp=datetime.now() - timedelta(days=1)),
        Notification(target_role="ADMIN",
                     title="Monthly Governance Report Ready",
                     message="National land acquisition summary for the current period is available.",
                     type="PROJECT_UPDATE", read=True,
                     link_route="/admin/dashboard",
                     timestamp=datetime.now() - timedelta(days=4)),
        Notification(target_role="ALL",
                     title="Scheduled Maintenance",
                     message="The platform will be unavailable for 30 minutes on Sunday 02:00 IST.",
                     type="SYSTEM_ALERT", read=False,
                     timestamp=datetime.now() - timedelta(days=3)),
    ]
    db.add_all(rows)
    db.commit()
    print(f"  notifications: {len(rows):>4}")


def seed_audit_logs(db, users, projects, parcels):
    """A plausible trail of recent actions."""
    actions = [
        ("Created project", "Project", "Project record initialised with statutory parameters."),
        ("Verified document", "Document", "Ownership proof verified against revenue records."),
        ("Approved compensation", "Compensation", "Section 23 award approved by competent authority."),
        ("Updated parcel status", "LandParcel", "Parcel marked as Acquired following possession."),
        ("Issued notification", "Project", "Section 6 declaration published in the official gazette."),
        ("Updated SLA thresholds", "System", "Escalation threshold revised for the payment category."),
        ("Registered user", "User", "New field surveyor account created and assigned."),
        ("Disbursed payment", "Compensation", "DBT transfer initiated through PFMS."),
    ]
    rows = []
    for index in range(40):
        actor = random.choice(users)
        action, entity_type, details = random.choice(actions)
        rows.append(AuditLog(
            timestamp=datetime.now() - timedelta(days=random.randint(0, 60), hours=random.randint(0, 23)),
            user_id=actor.id,
            user_name=actor.name,
            role=actor.role,
            department=str(actor.department_id or "-"),
            action=action,
            entity_type=entity_type,
            entity_id=str(random.choice(projects).id if entity_type == "Project" else random.randint(1, 40)),
            details=details,
            ip_address=f"10.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}",
        ))
    db.add_all(rows)
    db.commit()
    print(f"  audit logs:    {len(rows):>4}")


def seed_system_settings(db):
    db.add(SystemSettings(
        id=1,
        app_name="BhoomiSetu",
        organization_name="Ministry of Rural Development, Government of India",
        support_email="support@bhoomisetu.gov.in",
        notifications_enabled=True,
        default_language="EN",
        session_timeout_minutes=60,
        two_factor_auth_required=False,
        maintenance_mode=False,
    ))
    db.commit()
    print("  settings:         1")


def seed_landowner_kyc(db, users):
    """
    KYC rows for landowner accounts.

    The 'encrypted' values here are placeholders - a real deployment would use
    pgcrypto or an application-level key. The masked forms are what the API
    actually returns.
    """
    rows = []
    for user in users:
        if user.role_level != "L9":
            continue
        last4 = random.randint(1000, 9999)
        acct4 = random.randint(1000, 9999)
        bank_name, ifsc = random.choice(BANKS)
        rows.append(LandownerKYC(
            user_id=user.id,
            aadhaar_encrypted=f"enc::{random.getrandbits(64):x}",
            aadhaar_masked=f"XXXX-XXXX-{last4}",
            pan_encrypted=f"enc::{random.getrandbits(48):x}",
            bank_account_encrypted=f"enc::{random.getrandbits(64):x}",
            bank_account_masked=f"XXXX-XXXX-{acct4}",
            bank_name=bank_name,
            ifsc_code=ifsc,
            account_holder_name=user.name,
            kyc_status="Verified",
            verified_date=datetime.now() - timedelta(days=random.randint(30, 300)),
        ))
    db.add_all(rows)
    db.commit()
    print(f"  kyc records:   {len(rows):>4}")


def main():
    db = SessionLocal()
    try:
        print("Wiping existing data...")
        wipe(db)

        print("Seeding...")
        india, villages = seed_jurisdictions(db)

        # name -> id lookup for every jurisdiction, used when linking users/projects
        jurisdictions_by_name = {j.name: j.id for j in db.query(Jurisdiction).all()}

        departments = seed_departments(db)
        users = seed_users(db, departments, jurisdictions_by_name)
        projects = seed_projects(db, departments, jurisdictions_by_name)

        landowner = next(u for u in users if u.role_level == "L9")
        parcels = seed_land_parcels(db, projects, villages, landowner.id)
        seed_sla_rules(db)

        officers = [u for u in users if u.role in ("OFFICER", "ADMIN")]

        seed_project_stages(db, projects, officers)
        documents = seed_documents(db, parcels, officers)
        seed_document_verifications(db, documents, officers)
        seed_compensation_records(db, parcels, officers)
        seed_statutory_notifications(db, projects, officers, jurisdictions_by_name)
        seed_risk_alerts(db, projects)
        seed_notifications(db, users, projects, parcels)
        seed_audit_logs(db, users, projects, parcels)
        seed_system_settings(db)
        seed_landowner_kyc(db, users)

        print("\nSeed complete.")
        print(f"Log in at /auth/login with any seeded email and password {DEMO_PASSWORD!r}")
        print("e.g.  sk.rathore@delhi.gov.in  (L4 officer)")
        print("      rajkumar.narela@example.com  (L9 landowner)")
    finally:
        db.close()


if __name__ == "__main__":
    main()
