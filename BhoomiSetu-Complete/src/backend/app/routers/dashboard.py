"""
National dashboard aggregates.

Every number here is computed from real rows at request time - nothing is
hardcoded. This is what replaces the frontend's typed-in dashboard constants.
"""

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from routers.auth import get_current_user
from scoping import visible_jurisdiction_ids, visible_project_ids
from models import Department, Jurisdiction, Land_parcel, Project, User
from risk_engine import calculate_risk

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

# Sort order for the risk feed - lower number appears first.
SEVERITY_ORDER = {"CRITICAL": 0, "HIGH_RISK": 1, "ATTENTION": 2, "UNKNOWN": 3}


def _scoped_ids(db: Session, user) -> set[int] | None:
    """None means nationwide; a set means restrict to those jurisdictions."""
    return visible_jurisdiction_ids(db, user)


def _apply(query, column, allowed):
    if allowed is None:
        return query
    if not allowed:
        return query.filter(False)
    return query.filter(column.in_(allowed))




def _state_lookup(db: Session) -> dict[int, str]:
    """
    Map every jurisdiction id to the name of the STATE it belongs to.

    A project or parcel can be attached at any level of the tree (state,
    district or village), so we walk up the parent chain until we hit a STATE.
    """
    rows = db.query(Jurisdiction).all()
    by_id = {j.id: j for j in rows}

    lookup: dict[int, str] = {}
    for jurisdiction in rows:
        node = jurisdiction
        # climb until we find the STATE ancestor (or run out of parents)
        while node is not None and node.type != "STATE":
            node = by_id.get(node.parent_id) if node.parent_id else None
        if node is not None:
            lookup[jurisdiction.id] = node.name
    return lookup


def _count_by(db: Session, column, scope_column=None, allowed=None) -> dict:
    """Group by a column and return {value: count}, skipping NULLs and honouring scope."""
    query = db.query(column, func.count())
    if scope_column is not None:
        query = _apply(query, scope_column, allowed)
    rows = query.group_by(column).all()
    return {value: count for value, count in rows if value is not None}


@router.get("/stats")
def national_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Summary for whatever the signed-in user can see.

    A national admin gets the country; a district officer gets their district.
    Same endpoint, same code - the numbers differ because the rows do.
    """
    allowed = _scoped_ids(db, current_user)

    project_ids = visible_project_ids(db, current_user)
    projects_q = _apply(db.query(Project), Project.id, project_ids)
    parcels_q = _apply(db.query(Land_parcel), Land_parcel.jurisdiction_id, allowed)

    total_projects = projects_q.count()
    total_parcels = parcels_q.count()

    area_notified = sum(p.area_notified_acres or 0.0 for p in projects_q.all())
    area_acquired = sum(p.area_acquired_acres or 0.0 for p in projects_q.all())
    area_total = sum(p.total_area_acres or 0.0 for p in projects_q.all())

    assessed_cr = sum(p.compensation_assessed_cr or 0.0 for p in projects_q.all())
    disbursed_cr = sum(p.disbursed_compensation_cr or 0.0 for p in projects_q.all())
    budget_cr = sum(p.estimated_budget_cr or 0.0 for p in projects_q.all())

    affected = sum(p.affected_families_count or 0 for p in projects_q.all())
    displaced = sum(p.displaced_families_count or 0 for p in projects_q.all())

    parcel_compensation = sum(p.total_compensation or 0.0 for p in parcels_q.all())

    return {
        "projects": {
            "total": total_projects,
            "by_status": _count_by(db, Project.status, Project.id, project_ids),
            "by_stage": _count_by(db, Project.current_stage, Project.id, project_ids),
            "by_possession_status": _count_by(db, Project.possession_status, Project.id, project_ids),
            "by_rr_status": _count_by(db, Project.rr_status, Project.id, project_ids),
        },
        "land": {
            "total_parcels": total_parcels,
            "area_total_acres": round(area_total, 2),
            "area_notified_acres": round(area_notified, 2),
            "area_acquired_acres": round(area_acquired, 2),
            "acquisition_progress_pct": (
                round(area_acquired / area_notified * 100, 1) if area_notified else 0.0
            ),
            "parcels_by_status": _count_by(db, Land_parcel.status, Land_parcel.jurisdiction_id, allowed),
            "parcels_by_verification": _count_by(db, Land_parcel.verification_status, Land_parcel.jurisdiction_id, allowed),
            "parcels_by_compensation_status": _count_by(db, Land_parcel.compensation_status, Land_parcel.jurisdiction_id, allowed),
        },
        "compensation": {
            "estimated_budget_cr": round(budget_cr, 2),
            "assessed_cr": round(assessed_cr, 2),
            "disbursed_cr": round(disbursed_cr, 2),
            "pending_cr": round(assessed_cr - disbursed_cr, 2),
            "disbursement_progress_pct": (
                round(disbursed_cr / assessed_cr * 100, 1) if assessed_cr else 0.0
            ),
            "parcel_level_total_rupees": round(parcel_compensation, 2),
        },
        "families": {
            "affected": int(affected),
            "displaced": int(displaced),
        },
    }


@router.get("/by-state")
def stats_by_state(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Per-state rollup, for the national map and state comparison tables."""
    lookup = _state_lookup(db)
    allowed = _scoped_ids(db, current_user)

    states: dict[str, dict] = {}

    def bucket(state_name: str) -> dict:
        if state_name not in states:
            states[state_name] = {
                "state": state_name,
                "projects": 0,
                "parcels": 0,
                "area_notified_acres": 0.0,
                "area_acquired_acres": 0.0,
                "compensation_assessed_cr": 0.0,
                "disbursed_compensation_cr": 0.0,
                "affected_families": 0,
                "displaced_families": 0,
            }
        return states[state_name]

    for project in _apply(db.query(Project), Project.id, visible_project_ids(db, current_user)).all():
        state_name = lookup.get(project.jurisdiction_id)
        if state_name is None:
            continue
        row = bucket(state_name)
        row["projects"] += 1
        row["area_notified_acres"] += project.area_notified_acres or 0.0
        row["area_acquired_acres"] += project.area_acquired_acres or 0.0
        row["compensation_assessed_cr"] += project.compensation_assessed_cr or 0.0
        row["disbursed_compensation_cr"] += project.disbursed_compensation_cr or 0.0
        row["affected_families"] += project.affected_families_count or 0
        row["displaced_families"] += project.displaced_families_count or 0

    for parcel in _apply(db.query(Land_parcel), Land_parcel.jurisdiction_id, allowed).all():
        state_name = lookup.get(parcel.jurisdiction_id)
        if state_name is None:
            continue
        bucket(state_name)["parcels"] += 1

    result = []
    for row in states.values():
        for key in (
            "area_notified_acres", "area_acquired_acres",
            "compensation_assessed_cr", "disbursed_compensation_cr",
        ):
            row[key] = round(row[key], 2)
        result.append(row)

    result.sort(key=lambda r: r["area_notified_acres"], reverse=True)
    return result


@router.get("/by-department")
def stats_by_department(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Per-agency rollup, for the department comparison view."""
    allowed = visible_project_ids(db, current_user)

    query = (
        db.query(
            Department.code,
            Department.name,
            func.count(Project.id),
            func.sum(Project.area_acquired_acres),
            func.sum(Project.disbursed_compensation_cr),
            func.sum(Project.affected_families_count),
        )
        .outerjoin(Project, Project.department_id == Department.id)
    )
    # Scope the joined projects, not the departments - a district officer still
    # sees every agency, just only their own district's figures for each.
    if allowed is not None:
        query = query.filter(Project.id.in_(allowed)) if allowed else query.filter(False)
    rows = query.group_by(Department.id).all()

    return [
        {
            "code": code,
            "name": name,
            "projects": project_count or 0,
            "area_acquired_acres": round(area or 0.0, 2),
            "disbursed_compensation_cr": round(disbursed or 0.0, 2),
            "affected_families": int(affected or 0),
        }
        for code, name, project_count, area, disbursed, affected in rows
    ]


@router.get("/risks")
def time_risk(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Every project that is behind schedule, worst first."""
    results = []

    allowed = visible_project_ids(db, current_user)
    for project in _apply(db.query(Project), Project.id, allowed).all():
        risk = calculate_risk(project)
        if risk["severity"] != "ON_TRACK":
            results.append(risk)

    # Rank by severity first, then by how overdue it is within that band.
    # -overdue_days makes the second sort descending.
    return sorted(
        results,
        key=lambda r: (SEVERITY_ORDER.get(r["severity"], 99), -r["overdue_days"]),
    )
