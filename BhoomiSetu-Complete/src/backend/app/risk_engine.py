"""
Rule-based delay / risk detection.

Severity is judged on how far a project is OVERDUE for its current stage,
not on raw days elapsed - a 60-day survey and a 10-day award approval
cannot share one threshold.
"""

from datetime import datetime

# Target duration for each stage, in days.
# Copied from the frontend's CreateProjectWizard.tsx so both agree.
STAGE_TARGET_DAYS = {
    "Project Created": 30,
    "Land Identified": 45,
    "Survey Completed": 60,
    "Documents Submitted": 45,
    "Ownership Verified": 30,
    "Valuation Completed": 30,
    "Compensation Approval": 10,
    "Payment Processing": 15,
    "Final Acquisition": 20,
    "Project Completion": 15,
}

DEFAULT_TARGET_DAYS = 30


def calculate_risk(project) -> dict:
    """Return the risk assessment for a single project."""

    stage = project.current_stage or "Unknown"
    target_days = STAGE_TARGET_DAYS.get(stage, DEFAULT_TARGET_DAYS)

    def result(days_pending, overdue_days, severity, reason, action):
        return {
            "project_id": project.id,
            "project_name": project.name,
            "current_stage": stage,
            "days_pending": days_pending,
            "target_days": target_days,
            "overdue_days": overdue_days,
            "severity": severity,
            "reason": reason,
            "recommended_action": action,
        }

    # A finished project is never "at risk", whatever the dates say.
    if project.status in ("Completed", "Archived"):
        return result(0, 0, "ON_TRACK", "Project is complete.", "No action required.")

    # No stage timestamp recorded - cannot judge, so don't guess.
    if project.stage_updated_at is None:
        return result(
            0, 0, "UNKNOWN",
            "No stage update date recorded for this project.",
            "Set the current stage date so timelines can be monitored.",
        )

    # Subtracting two datetimes gives a timedelta; .days pulls out whole days.
    days_pending = (datetime.now() - project.stage_updated_at).days
    if days_pending < 0:          # stage date in the future - treat as day zero
        days_pending = 0

    overdue_days = days_pending - target_days

    if overdue_days <= 0:
        return result(
            days_pending, 0, "ON_TRACK",
            f"{stage} in progress for {days_pending} days, within the {target_days}-day target.",
            "No action required.",
        )

    if overdue_days <= 7:
        return result(
            days_pending, overdue_days, "ATTENTION",
            f"{stage} has exceeded its {target_days}-day target by {overdue_days} days.",
            "Review pending items with the assigned officer.",
        )

    if overdue_days <= 30:
        return result(
            days_pending, overdue_days, "HIGH_RISK",
            f"{stage} is {overdue_days} days beyond its {target_days}-day target.",
            "Escalate to the District Collector and identify the blocking dependency.",
        )

    return result(
        days_pending, overdue_days, "CRITICAL",
        f"{stage} is critically overdue - {overdue_days} days beyond its {target_days}-day target.",
        "Immediate Collector intervention required. Statutory timelines are at risk.",
    )
