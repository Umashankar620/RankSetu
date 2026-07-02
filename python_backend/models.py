# =============================================================
# python_backend/models.py — v2 (dynamic schema)
# =============================================================
# CHANGED from v1:
#   - Cutoff no longer maps to the old flat `mcc_cutoffs` table.
#     It now maps to `v_cutoffs_flat`, a SQL VIEW (see
#     views_setup.sql) that joins the new normalized RankSetu
#     schema (cutoffs + counseling_types/states/courses/quotas/
#     categories/genders/rounds/institute_types/institutes) back
#     into the exact same flat column shape this model always had.
#   - Because the column names/types are unchanged, prediction_engine.py
#     and upgrade_engine.py needed ZERO changes to their core math —
#     they still read row.institute_name, row.course, row.category,
#     row.quota, row.round, row.closing_rank, etc. exactly as before.
#   - Added CounselingType / State / Authority / Course / Quota / Category
#     models so /api/filters can query the small lookup tables DIRECTLY
#     instead of running SELECT DISTINCT over a 20-lakh-row view.
#     This is what makes the filters fully dynamic: any new
#     state/counseling_type/authority/category/quota/course that
#     uploader_turbo_v3.py inserts shows up here automatically,
#     with no code change and no extra latency.
#
# IMPORTANT: v_cutoffs_flat is a VIEW, not a table. Do NOT run
# Base.metadata.create_all(bind=engine) for it (main.py no longer
# does this) — the view and all lookup tables are owned and created
# by the SQL/import scripts, not by the FastAPI app.
# =============================================================

from sqlalchemy import Column, Integer, String, Float
from database import Base


class CounselingType(Base):
    __tablename__ = "counseling_types"
    id   = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False)


class State(Base):
    __tablename__ = "states"
    id   = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)


class Authority(Base):
    __tablename__ = "authorities"
    id   = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)


class InstituteType(Base):
    __tablename__ = "institute_types"
    id   = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)


class Course(Base):
    __tablename__ = "courses"
    id   = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)


class Quota(Base):
    __tablename__ = "quotas"
    id   = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)


class Category(Base):
    __tablename__ = "categories"
    id   = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)


class Cutoff(Base):
    """
    Read-only mapping onto v_cutoffs_flat (a VIEW — see views_setup.sql).
    Column names/types are identical to the old mcc_cutoffs table on
    purpose, so prediction_engine.py / upgrade_engine.py keep working
    unchanged. `state`, `counseling_type`, and `authority` are now
    properly populated (previously always NULL or absent) which is what
    enables type-wise, state-wise, and authority-wise prediction.
    """
    __tablename__ = "v_cutoffs_flat"

    id               = Column(Integer, primary_key=True, index=True)
    year             = Column(Integer,      nullable=False, index=True)
    round            = Column(String(50))
    quota            = Column(String(100),  index=True)
    category         = Column(String(100),  index=True)
    institute_name   = Column(String(500))
    course           = Column(String(100))
    opening_rank     = Column(Integer)
    closing_rank     = Column(Integer)
    fees             = Column(Float)
    bond_years       = Column(Integer)
    gender           = Column(String(20))
    type             = Column(String(100))
    state            = Column(String(100))
    counseling_type  = Column(String(50))
    authority        = Column(String(100))
