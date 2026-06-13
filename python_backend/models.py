# =============================================================
# python_backend/models.py — SQLAlchemy ORM Model
# =============================================================
# Maps EXACTLY to mcc_cutoffs table in neet_db.
# Columns: id, year, round, quota, category, institute_name,
#          course, opening_rank, closing_rank, fees, bond_years,
#          gender, type, state, counseling_type
# =============================================================

from sqlalchemy import Column, Integer, String, Float
from database import Base


class Cutoff(Base):
    __tablename__ = "mcc_cutoffs"

    id               = Column(Integer, primary_key=True, index=True)
    year             = Column(Integer,      nullable=False, index=True)
    round            = Column(String(20),   nullable=False)          # "Round 1", "Round 2" etc
    quota            = Column(String(50),   nullable=False, index=True)
    category         = Column(String(20),   nullable=False, index=True)
    institute_name   = Column(String(255),  nullable=False)
    course           = Column(String(100),  nullable=False, default="MBBS")
    opening_rank     = Column(Integer,      nullable=True)
    closing_rank     = Column(Integer,      nullable=False)
    fees             = Column(Float,        nullable=True)
    bond_years       = Column(Integer,      nullable=True, default=0)
    gender           = Column(String(20),   nullable=True)
    type             = Column(String(50),   nullable=True)
    state            = Column(String(100),  nullable=True)
    counseling_type  = Column(String(50),   nullable=True)
