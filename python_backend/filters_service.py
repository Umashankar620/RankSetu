# =============================================================
# python_backend/filters_service.py — dynamic cascading filters
# =============================================================
# Mirrors the Node.js backend's services/cutoffService.js cascade
# pattern (counseling_type → state → authority → institute_type →
# course/quota/category), but lives inside the Python backend so
# the prediction/upgrade frontend (ChoiceOptimizer.jsx,
# UpgradeProbability.jsx) is fully self-contained — it only ever
# talks to the Python API (NEXT_PUBLIC_PYTHON_URL), never the Node
# one, so this cascade has to exist here too.
#
# Every function below:
#   - Reads only from the small lookup tables OR runs a scoped
#     DISTINCT query against v_cutoffs_flat (never loads the full
#     20-lakh+ row table into memory).
#   - Takes optional upstream filter values (by NAME, matching the
#     "ALL" convention already used throughout prediction_engine.py
#     / upgrade_engine.py) and narrows accordingly.
#   - Ignores NULL / empty-string values automatically (the WHERE
#     clauses + the isnot(None)/!= "" filters below).
#   - Requires ZERO code changes when new data (new state, new
#     authority, new institute_type, new course, etc.) is imported
#     via uploader_turbo_v3.py — every value comes straight from
#     whatever is currently in the database.
# =============================================================

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import distinct, func

from models import Cutoff, CounselingType


def _is_all(value: Optional[str]) -> bool:
    return not value or str(value).strip().upper() == "ALL"


def _eq(col, val: str):
    return func.lower(func.trim(col)) == val.strip().lower()


def _clean_distinct(rows) -> List[str]:
    """Unique, NULL-free, empty-string-free, trimmed, sorted."""
    return sorted({r[0].strip() for r in rows if r[0] and str(r[0]).strip()})


# ── Step 1 — Counselling Type ──────────────────────────────────
def get_counseling_types(db: Session) -> List[str]:
    rows = db.query(CounselingType.name).order_by(CounselingType.name).all()
    return _clean_distinct(rows)


# ── Step 2 — State (scoped to counseling type) ─────────────────
def get_states(db: Session, counseling_type: Optional[str] = None) -> List[str]:
    q = db.query(distinct(Cutoff.state)).filter(Cutoff.state.isnot(None), Cutoff.state != "")
    if not _is_all(counseling_type):
        q = q.filter(_eq(Cutoff.counseling_type, counseling_type))
    return _clean_distinct(q.all())


# ── Step 3 — Authority (scoped to counseling type + state) ─────
def get_authorities(db: Session, counseling_type: Optional[str] = None,
                     state: Optional[str] = None) -> List[str]:
    q = db.query(distinct(Cutoff.authority)).filter(Cutoff.authority.isnot(None), Cutoff.authority != "")
    if not _is_all(counseling_type):
        q = q.filter(_eq(Cutoff.counseling_type, counseling_type))
    if not _is_all(state):
        q = q.filter(_eq(Cutoff.state, state))
    return _clean_distinct(q.all())


# ── Institute Type (scoped to type + state + authority) ────────
# Naturally returns [] for datasets whose CSV maps type: null (e.g.
# MCC, AYUSH) — the frontend hides this pill row entirely in that
# case instead of showing a stale, non-matching list.
def get_institute_types(db: Session, counseling_type: Optional[str] = None,
                         state: Optional[str] = None, authority: Optional[str] = None) -> List[str]:
    q = db.query(distinct(Cutoff.type)).filter(Cutoff.type.isnot(None), Cutoff.type != "")
    if not _is_all(counseling_type):
        q = q.filter(_eq(Cutoff.counseling_type, counseling_type))
    if not _is_all(state):
        q = q.filter(_eq(Cutoff.state, state))
    if not _is_all(authority):
        q = q.filter(_eq(Cutoff.authority, authority))
    return _clean_distinct(q.all())


# ── Remaining filters — all scoped to type + state + authority + institute_type ──
def get_courses(db: Session, counseling_type: Optional[str] = None, state: Optional[str] = None,
                 authority: Optional[str] = None, institute_type: Optional[str] = None) -> List[str]:
    q = db.query(distinct(Cutoff.course)).filter(Cutoff.course.isnot(None), Cutoff.course != "")
    if not _is_all(counseling_type):
        q = q.filter(_eq(Cutoff.counseling_type, counseling_type))
    if not _is_all(state):
        q = q.filter(_eq(Cutoff.state, state))
    if not _is_all(authority):
        q = q.filter(_eq(Cutoff.authority, authority))
    if not _is_all(institute_type):
        q = q.filter(_eq(Cutoff.type, institute_type))
    return _clean_distinct(q.all())


def get_quotas(db: Session, counseling_type: Optional[str] = None, state: Optional[str] = None,
                authority: Optional[str] = None, institute_type: Optional[str] = None,
                course: Optional[str] = None) -> List[str]:
    q = db.query(distinct(Cutoff.quota)).filter(Cutoff.quota.isnot(None), Cutoff.quota != "")
    if not _is_all(counseling_type):
        q = q.filter(_eq(Cutoff.counseling_type, counseling_type))
    if not _is_all(state):
        q = q.filter(_eq(Cutoff.state, state))
    if not _is_all(authority):
        q = q.filter(_eq(Cutoff.authority, authority))
    if not _is_all(institute_type):
        q = q.filter(_eq(Cutoff.type, institute_type))
    if not _is_all(course):
        q = q.filter(_eq(Cutoff.course, course))
    return _clean_distinct(q.all())


def get_categories(db: Session, counseling_type: Optional[str] = None, state: Optional[str] = None,
                    authority: Optional[str] = None, institute_type: Optional[str] = None) -> List[str]:
    q = db.query(distinct(Cutoff.category)).filter(Cutoff.category.isnot(None), Cutoff.category != "")
    if not _is_all(counseling_type):
        q = q.filter(_eq(Cutoff.counseling_type, counseling_type))
    if not _is_all(state):
        q = q.filter(_eq(Cutoff.state, state))
    if not _is_all(authority):
        q = q.filter(_eq(Cutoff.authority, authority))
    if not _is_all(institute_type):
        q = q.filter(_eq(Cutoff.type, institute_type))
    return _clean_distinct(q.all())


def get_rounds(db: Session, counseling_type: Optional[str] = None, state: Optional[str] = None,
                authority: Optional[str] = None, institute_type: Optional[str] = None) -> List[str]:
    q = db.query(distinct(Cutoff.round)).filter(Cutoff.round.isnot(None), Cutoff.round != "")
    if not _is_all(counseling_type):
        q = q.filter(_eq(Cutoff.counseling_type, counseling_type))
    if not _is_all(state):
        q = q.filter(_eq(Cutoff.state, state))
    if not _is_all(authority):
        q = q.filter(_eq(Cutoff.authority, authority))
    if not _is_all(institute_type):
        q = q.filter(_eq(Cutoff.type, institute_type))
    return _clean_distinct(q.all())
