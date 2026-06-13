# =============================================================
# python_backend/main.py — FastAPI Application v10
# =============================================================
# FIXES over v9:
#   - Added GET /api/upgrade-institutes  ← was causing 404 in UpgradeProbability.jsx
#   - Added POST /api/upgrade-check      ← upgrade check endpoint
#   - health check uses text() for SQLAlchemy 2.x compatibility
#   - category validation moved to engine (main just passes it through)
# =============================================================

import os
import time
import uuid
import hashlib
import json
import logging
from threading import Lock
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import distinct, text, func

from database import engine, Base, get_db
from models import Cutoff
from prediction_engine import run_optimizer
from upgrade_engine import run_upgrade_check, get_upgrade_institutes

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="NEET AI College Predictor", version="10.0")
app.add_middleware(GZipMiddleware, minimum_size=500)

ALLOWED_ORIGINS = [
    o.strip() for o in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://localhost:3001,http://localhost:3002,"
        "http://127.0.0.1:3000,http://127.0.0.1:3001,http://127.0.0.1:3002,"
        "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if o.strip()
]
logger.info("CORS allowed origins: %s", ALLOWED_ORIGINS)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-Request-ID"],
)

# ─── In-memory cache ──────────────────────────────────────────
_CACHE: dict = {}
_CACHE_LOCK  = Lock()
_CACHE_TTL   = 3600  # 1 hour


def _cache_key(payload: dict) -> str:
    return hashlib.md5(json.dumps(payload, sort_keys=True).encode()).hexdigest()


def _cache_get(key: str):
    with _CACHE_LOCK:
        entry = _CACHE.get(key)
        if entry and (time.time() - entry["ts"] < _CACHE_TTL):
            return entry["data"]
        return None


def _cache_set(key: str, data: dict):
    with _CACHE_LOCK:
        if len(_CACHE) > 5000:
            _CACHE.clear()
        _CACHE[key] = {"data": data, "ts": time.time()}


# ─── Request models ───────────────────────────────────────────
class OptimizeRequest(BaseModel):
    user_rank: int = Field(..., ge=1, le=2_000_000)
    category:  str = Field(..., description="Required: UR / OBC / SC / ST / EWS")
    quota:     str = Field(default="ALL")
    course:    str = Field(default="ALL")
    top_n:     int = Field(default=0, ge=0, le=200)


class UpgradeRequest(BaseModel):
    user_rank:         int = Field(..., ge=1, le=2_000_000)
    current_institute: str = Field(..., min_length=1)
    category:          str = Field(default="ALL")
    quota:             str = Field(default="ALL")
    current_round:     str = Field(default="Round 1")


# ─── Middleware ───────────────────────────────────────────────
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    req_id   = request.headers.get("X-Request-ID", str(uuid.uuid4())[:8])
    response = await call_next(request)
    response.headers["X-Request-ID"] = req_id
    return response


# ─── Routes ───────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "service": "NEET AI College Predictor v10"}


@app.get("/api/healthz")
def health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "healthy"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"DB unavailable: {e}")


@app.get("/api/filters")
def get_filters(db: Session = Depends(get_db)):
    # Use TRIM so values with stray leading/trailing whitespace in the DB
    # don't show up as duplicate near-identical dropdown entries, and so
    # the value sent back to /api/optimize matches exactly what's stored.
    categories = sorted({
        (r[0] or "").strip()
        for r in db.query(distinct(func.trim(Cutoff.category)).label("val")).all()
        if r[0] and r[0].strip()
    })
    quotas = sorted({
        (r[0] or "").strip()
        for r in db.query(distinct(func.trim(Cutoff.quota)).label("val")).all()
        if r[0] and r[0].strip()
    })
    courses = sorted({
        (r[0] or "").strip()
        for r in db.query(distinct(func.trim(Cutoff.course)).label("val")).all()
        if r[0] and r[0].strip()
    })
    if not categories: categories = ["UR", "EWS", "OBC", "SC", "ST"]
    if not quotas:     quotas     = ["AI Quota", "State Pool", "Management", "NRI"]
    if not courses:    courses    = ["MBBS", "BDS", "MD", "MS"]

    return {
        "success": True,
        "filters": {
            "categories": categories,
            "quotas":     quotas,
            "courses":    courses,
        }
    }


@app.get("/api/upgrade-institutes")
def upgrade_institutes(
    category: Optional[str] = None,
    quota:    Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Returns full list of distinct institutes available for upgrade check.
    Used by UpgradeProbability.jsx to populate the college dropdown.

    Query params (both optional):
      ?category=OBC
      ?quota=AI+Quota
    """
    ck = _cache_key({"endpoint": "upgrade-institutes", "cat": category, "quota": quota})
    cached = _cache_get(ck)
    if cached:
        return cached

    institutes = get_upgrade_institutes(db, category=category, quota=quota)
    resp = {
        "success": True,
        "data": {
            "institutes": institutes,
            "count": len(institutes),
        }
    }
    _cache_set(ck, resp)
    return resp


@app.post("/api/upgrade-check")
def upgrade_check(payload: UpgradeRequest, db: Session = Depends(get_db)):
    """
    Round-wise upgrade probability engine.
    Uses historical R1→R2 / R2→R3 shift data to predict upgrade chances.
    """
    ck = _cache_key(payload.model_dump())
    cached = _cache_get(ck)
    if cached:
        logger.info("Cache hit upgrade-check: %s", ck)
        return cached

    try:
        result = run_upgrade_check(
            db=db,
            user_rank=payload.user_rank,
            current_institute=payload.current_institute,
            category=payload.category,
            quota=payload.quota,
            current_round=payload.current_round,
        )
    except Exception as e:
        logger.exception("Upgrade engine error: %s", e)
        raise HTTPException(status_code=500, detail="Upgrade engine error. Please try again.")

    # ── FIX: Return success:false as a 200 JSON body, NOT a 404.
    # A 404 makes apiFetch() in UpgradeProbability.jsx throw (res.ok is False),
    # which jumps to the catch block and shows a generic error toast instead of
    # the engine's helpful "Insufficient data" message. Returning 200 lets the
    # frontend read result.success === false and display the message properly.
    if not result.get("success"):
        return result

    _cache_set(ck, result)
    return result


@app.post("/api/optimize")
def optimize(payload: OptimizeRequest, db: Session = Depends(get_db)):
    """
    Core college prediction endpoint.
    category is REQUIRED — no "ALL" allowed.
    """
    if not payload.category or payload.category.strip().upper() == "ALL":
        raise HTTPException(
            status_code=422,
            detail="category is required. Please select UR / OBC / SC / ST / EWS."
        )

    ck = _cache_key(payload.model_dump())
    cached = _cache_get(ck)
    if cached:
        logger.info("Cache hit optimize: %s", ck)
        return cached

    try:
        result = run_optimizer(
            db=db,
            user_rank=payload.user_rank,
            category=payload.category,
            quota=payload.quota,
            course=payload.course,
            top_n=payload.top_n,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.exception("Optimizer error: %s", e)
        raise HTTPException(status_code=500, detail="Prediction engine error. Please try again.")

    # Return success:false as 200 body (not 404) so the frontend can show
    # a friendly "No data found" message instead of a generic error toast.
    if result.get("message"):
        return {
            "success": False,
            "message": result["message"],
            "dream": [], "target": [], "safe": [],
            "stats": {"total_analyzed": 0, "dream_count": 0, "target_count": 0, "safe_count": 0},
        }

    response = {
        "success":   True,
        "user_rank": payload.user_rank,
        "category":  payload.category,
        "quota":     payload.quota,
        "course":    payload.course,
        "dream":     result["dream"],
        "target":    result["target"],
        "safe":      result["safe"],
        "stats": {
            "total_analyzed": len(result["dream"]) + len(result["target"]) + len(result["safe"]),
            "dream_count":    len(result["dream"]),
            "target_count":   len(result["target"]),
            "safe_count":     len(result["safe"]),
        }
    }

    _cache_set(ck, response)
    return response