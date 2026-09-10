"""
Jurisdiction-based row scoping.

Role decides what a user may *do*; jurisdiction decides which slice of the
country they may do it to. A Tehsildar and a State Secretary run the same
queries - they just see different rows.

Scope is keyed off role_level, NOT role. An L1 state administrator maps to the
ADMIN role but must still only see their own state, so checking `role` here
would hand every state officer the whole country.
"""

from sqlalchemy.orm import Session

from models import Jurisdiction, Land_parcel

# Levels that legitimately see the entire country.
#   L0  - national super administrator
#   L10 - auditor / oversight (read-only, but read-everything)
NATIONWIDE_LEVELS = {"L0", "L10"}

# The landowner/citizen level: sees only parcels they own, wherever they are.
OWN_RECORDS_ONLY_LEVEL = "L9"


def descendant_jurisdiction_ids(db: Session, root_id: int) -> set[int]:
    """
    Every jurisdiction at or below `root_id`.

    The tree is small (a few thousand nodes even nationwide), so walking it in
    Python is simpler and quite fast enough. On a much larger tree this would
    become a recursive CTE.
    """
    children: dict[int | None, list[int]] = {}
    for jurisdiction_id, parent_id in db.query(Jurisdiction.id, Jurisdiction.parent_id).all():
        children.setdefault(parent_id, []).append(jurisdiction_id)

    found: set[int] = set()
    queue = [root_id]
    while queue:
        current = queue.pop()
        if current in found:          # guards against a cycle in bad data
            continue
        found.add(current)
        queue.extend(children.get(current, []))
    return found


def ancestor_jurisdiction_ids(db: Session, node_id: int) -> set[int]:
    """Every jurisdiction from `node_id` up to the root, inclusive."""
    parents = dict(db.query(Jurisdiction.id, Jurisdiction.parent_id).all())

    found: set[int] = set()
    current: int | None = node_id
    while current is not None and current not in found:
        found.add(current)
        current = parents.get(current)
    return found


def visible_jurisdiction_ids(db: Session, user) -> set[int] | None:
    """
    Which jurisdictions this user may see.

    Returns None to mean "no restriction - everything", which is different from
    an empty set, meaning "nothing". Callers must handle both.
    """
    if user.role_level in NATIONWIDE_LEVELS:
        return None

    if user.jurisdiction_id is None:
        # Fail closed: a scoped user with no jurisdiction assigned sees nothing
        # rather than everything.
        return set()

    return descendant_jurisdiction_ids(db, user.jurisdiction_id)


def scope_query(query, db: Session, user, column):
    """
    Narrow a query to the jurisdictions this user can see.

    `column` is the jurisdiction foreign key on whatever is being queried,
    e.g. Project.jurisdiction_id or Land_parcel.jurisdiction_id.
    """
    allowed = visible_jurisdiction_ids(db, user)
    if allowed is None:
        return query
    if not allowed:
        return query.filter(False)
    return query.filter(column.in_(allowed))


def scope_parcel_query(query, db: Session, user):
    """
    Parcels, with the landowner special case.

    A citizen sees the parcels they own regardless of where those sit in the
    tree; everyone else is scoped by jurisdiction.
    """
    if user.role_level == OWN_RECORDS_ONLY_LEVEL:
        return query.filter(Land_parcel.owner_user_id == user.id)
    return scope_query(query, db, user, Land_parcel.jurisdiction_id)


def visible_parcel_ids(db: Session, user) -> set[int] | None:
    """
    Parcel ids this user may see, for scoping things that hang off a parcel
    (documents, compensation records) rather than carrying a jurisdiction of
    their own. None means no restriction.
    """
    if user.role_level in NATIONWIDE_LEVELS:
        return None

    query = scope_parcel_query(db.query(Land_parcel.id), db, user)
    return {row[0] for row in query.all()}


def visible_project_ids(db: Session, user) -> set[int] | None:
    """
    Projects this user may see. None means no restriction.

    Wider than the parcel rule on purpose. A parcel sits in exactly one village,
    so subtree matching is right. A *project* is recorded against whatever level
    it was created at - often a whole state - and a corridor covering Delhi NCT
    genuinely does affect North Delhi. So a district officer sees projects
    recorded at or below their node AND those recorded above it that contain
    them.

    A citizen sees the projects their own parcels belong to, and nothing else.
    """
    if user.role_level in NATIONWIDE_LEVELS:
        return None

    if user.role_level == OWN_RECORDS_ONLY_LEVEL:
        rows = (
            db.query(Land_parcel.project_id)
            .filter(Land_parcel.owner_user_id == user.id)
            .all()
        )
        return {row[0] for row in rows if row[0] is not None}

    if user.jurisdiction_id is None:
        return set()

    from models import Project  # imported here to avoid a circular import

    reachable = descendant_jurisdiction_ids(db, user.jurisdiction_id) | ancestor_jurisdiction_ids(
        db, user.jurisdiction_id
    )
    rows = db.query(Project.id).filter(Project.jurisdiction_id.in_(reachable)).all()
    return {row[0] for row in rows}


def can_view_parcel(db: Session, user, parcel) -> bool:
    """Permission check for a single parcel that has already been fetched."""
    if parcel is None:
        return False
    if user.role_level in NATIONWIDE_LEVELS:
        return True
    if user.role_level == OWN_RECORDS_ONLY_LEVEL:
        return parcel.owner_user_id == user.id

    allowed = visible_jurisdiction_ids(db, user)
    return bool(allowed) and parcel.jurisdiction_id in allowed
