# =============================================================
# python_backend/database.py — SQLAlchemy MySQL Connection Pool
# =============================================================
# Reads credentials from python_backend/.env
# pool_size=10, max_overflow=10 = max 20 simultaneous connections
# pool_pre_ping=True handles dropped connections automatically
# =============================================================
# python_backend/database.py

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "neet_db")

if False:  # password check disabled for blank passwords
    raise RuntimeError(
        "MySQL password not configured. Edit python_backend/.env and set DB_PASSWORD "
        "to your local MySQL root password (same as backend/.env)."
    )

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"

engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=1800,
    pool_pre_ping=True,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()