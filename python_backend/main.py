# =============================================================
# python_backend/main.py — FastAPI Application v12
# =============================================================
# CHANGED from v11 (drawing directly from the Node.js backend's
# patterns in cache.js / rateLimiter.js / cutoffController.js):
#
#   1. CACHE — replaced the old per-process in-memory dict with
#      cache.py (Redis-first, in-memory fallback — same interface
#      as the Node backend's config/cache.js). This fixes a real
#      bug: if this app is ever run with multiple uvicorn workers
#      (needed for real concurrency at scale — see render.yaml),
#      each worker used to have its OWN separate cache, so a
#      "cache hit" on worker #2 never benefited from a request
#      worker #1 already answered. Redis makes the cache shared.
#
#   2. CACHE INVALIDATION — added POST /api/admin/cache-invalidate,
#      protected by the same IMPORT_SECRET pattern as the Node
#      backend's /api/admin/cache-invalidate. Call this (or have
#      uploader_turbo_v3.py call it via HTTP) right after a CSV
#      import finishes, so this backend never serves a stale
#      prediction after new data is uploaded. This was a real gap
#      before — the old in-memory cache only expired after 1 hour
#      TTL, with no way to force-clear it on demand.
#
#   3. AUTHORITY DIMENSION — counseling_type/state were already
#      dynamic; authority is now a third optional filter dimension
#      on /api/optimize, /api/upgrade-check, /api/upgrade-institutes,
#      and /api/filters — mirroring the Node backend's
#      counseling_type → authority cascade.
#
#   4. RATE LIMITING — added the same three-tier limiting the Node
#      backend has (general / search / admin), via slowapi, so this
#      backend doesn't fall behind on basic abuse protection.
#
#   5. /api/health/cache — mirrors the Node backend's
#      GET /health/cache, returning the current cache "import
#      version" for monitoring.
# =============================================================

import os
import uuid
import logging
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import text

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from database import get_db
from models import Cutoff, CounselingType, State, Authority, InstituteType, Course, Quota, Category
from prediction_engine import run_optimizer
from upgrade_engine import run_upgrade_check, get_upgrade_institutes
import filters_service as fs
import cache

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# NOTE: Base.metadata.create_all(bind=engine) intentionally removed
# (since v11). The DB schema (cutoffs, all lookup tables, the
# v_cutoffs_flat view, import_log) is created/owned by views_setup.sql
# + uploader_turbo_v3.py. The app only ever reads from it.

IMPORT_SECRET = os.getenv("IMPORT_SECRET", "")

# ─── Rate limiting (mirrors middleware/rateLimiter.js) ─────────
limiter = Limiter(key_func=get_remote_address, default_limits=["150/minute"])

app = FastAPI(title="NEET AI College Predictor", version="12.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
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


# ─── Request models ───────────────────────────────────────────
class OptimizeRequest(BaseModel):
    user_rank:       int = Field(..., ge=1, le=2_000_000)
    category:        str = Field(..., description="Required: any category present in /api/filters (e.g. UR / OBC / SC / ST / EWS)")
    quota:           str = Field(default="ALL")
    course:          str = Field(default="ALL")
    counseling_type: str = Field(default="ALL", description="e.g. MCC / AYUSH / STATE — 'ALL' to not filter")
    state:           str = Field(default="ALL", description="e.g. 'Uttar Pradesh' — only meaningful when counseling_type='STATE'")
    authority:       str = Field(default="ALL", description="e.g. 'MCC' / 'UPDGME' — 'ALL' to not filter")
    institute_type:  str = Field(default="ALL", description="e.g. 'Government' / 'Private' / 'Deemed' — 'ALL' to not filter")
    top_n:           int = Field(default=0, ge=0, le=200)


class UpgradeRequest(BaseModel):
    user_rank:         int = Field(..., ge=1, le=2_000_000)
    current_institute: str = Field(..., min_length=1)
    category:          str = Field(default="ALL")
    quota:             str = Field(default="ALL")
    counseling_type:   str = Field(default="ALL")
    state:             str = Field(default="ALL")
    authority:         str = Field(default="ALL")
    institute_type:    str = Field(default="ALL")
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
    return {"status": "ok", "service": "NEET AI College Predictor v12"}


@app.get("/api/healthz")
def health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "healthy"}
    except Exception as e:
        # CHANGED: was `detail=f"DB unavailable: {e}"` — this endpoint is
        # public (Render/uptime monitors hit it unauthenticated) and the
        # raw exception can include connection details. Full error still
        # goes to logs for debugging; the client only gets a generic message.
        logger.error("Health check DB failure: %s", e)
        raise HTTPException(status_code=503, detail="DB unavailable")


@app.get("/api/health/cache")
def health_cache():
    """Mirrors the Node backend's GET /health/cache."""
    return {"success": True, "importVersion": cache.get_import_version()}


@app.get("/api/filters")
@limiter.limit("150/minute")
def get_filters(request: Request, db: Session = Depends(get_db)):
    """
    LEGACY full blob — UNSCOPED lists of every value in each lookup
    table. Kept for backward compatibility with any existing callers.

    For the actual cascading filter UI (counseling_type → state →
    authority → institute_type → course/quota/category/round), use
    the scoped endpoints below instead — this legacy endpoint does
    NOT narrow down based on prior selections.
    """
    def _names(model):
        rows = db.query(model.name).order_by(model.name).all()
        return sorted({(r[0] or "").strip() for r in rows if r[0] and r[0].strip()})

    return {
        "success": True,
        "filters": {
            "counseling_types": _names(CounselingType),
            "states":           _names(State),
            "authorities":      _names(Authority),
            "institute_types":  _names(InstituteType),
            "categories":       _names(Category),
            "quotas":           _names(Quota),
            "courses":          _names(Course),
        }
    }


# =================================================================
# CASCADING FILTER ENDPOINTS — 100% database-driven, no hardcoding.
# =================================================================
# Sequence (mirrors the Node.js backend's cascade and the product
# spec): Counselling Type → State → Authority → Institute Type →
# every remaining filter (Course, Quota, Category, Round).
#
# Each endpoint is scoped by every filter selected so far, reads
# live from the database via filters_service.py, and is cached
# (invalidated together with everything else on
# POST /api/admin/cache-invalidate after a CSV import). New states/
# authorities/courses/etc. uploaded via uploader_turbo_v3.py show up
# automatically — zero code changes needed.
# =================================================================

@app.get("/api/filters/counseling-types")
@limiter.limit("150/minute")
def filters_counseling_types(request: Request, db: Session = Depends(get_db)):
    """Step 1 — the very first filter. No upstream scope."""
    ck = "filters:ct"
    cached = cache.get(ck)
    if cached:
        return cached
    resp = {"success": True, "data": fs.get_counseling_types(db)}
    cache.set(ck, resp, ttl_seconds=24 * 3600)
    return resp


@app.get("/api/filters/states")
@limiter.limit("150/minute")
def filters_states(request: Request, counseling_type: Optional[str] = None,
                    db: Session = Depends(get_db)):
    """
    Step 2 — states available WITHIN the selected counselling type only.
    e.g. counseling_type=MCC -> ["All India"]; counseling_type=STATE ->
    every state that actually has STATE-counselling data uploaded.
    """
    ck = f"filters:states:{counseling_type or 'ALL'}"
    cached = cache.get(ck)
    if cached:
        return cached
    resp = {"success": True, "data": fs.get_states(db, counseling_type)}
    cache.set(ck, resp, ttl_seconds=24 * 3600)
    return resp


@app.get("/api/filters/authorities")
@limiter.limit("150/minute")
def filters_authorities(request: Request, counseling_type: Optional[str] = None,
                         state: Optional[str] = None, db: Session = Depends(get_db)):
    """Step 3 — authorities available for the selected type + state."""
    ck = f"filters:auth:{counseling_type or 'ALL'}:{state or 'ALL'}"
    cached = cache.get(ck)
    if cached:
        return cached
    resp = {"success": True, "data": fs.get_authorities(db, counseling_type, state)}
    cache.set(ck, resp, ttl_seconds=24 * 3600)
    return resp


@app.get("/api/filters/institute-types")
@limiter.limit("150/minute")
def filters_institute_types(request: Request, counseling_type: Optional[str] = None,
                             state: Optional[str] = None, authority: Optional[str] = None,
                             db: Session = Depends(get_db)):
    """
    Institute Type pill — scoped to type + state + authority. Naturally
    empty for datasets whose CSV maps type: null (e.g. MCC, AYUSH); the
    frontend hides this pill row entirely in that case.
    """
    ck = f"filters:itype:{counseling_type or 'ALL'}:{state or 'ALL'}:{authority or 'ALL'}"
    cached = cache.get(ck)
    if cached:
        return cached
    resp = {"success": True, "data": fs.get_institute_types(db, counseling_type, state, authority)}
    cache.set(ck, resp, ttl_seconds=24 * 3600)
    return resp


@app.get("/api/filters/courses")
@limiter.limit("150/minute")
def filters_courses(request: Request, counseling_type: Optional[str] = None,
                     state: Optional[str] = None, authority: Optional[str] = None,
                     institute_type: Optional[str] = None, db: Session = Depends(get_db)):
    """Step 4 — courses available for everything selected so far."""
    ck = f"filters:course:{counseling_type or 'ALL'}:{state or 'ALL'}:{authority or 'ALL'}:{institute_type or 'ALL'}"
    cached = cache.get(ck)
    if cached:
        return cached
    resp = {"success": True, "data": fs.get_courses(db, counseling_type, state, authority, institute_type)}
    cache.set(ck, resp, ttl_seconds=24 * 3600)
    return resp


@app.get("/api/filters/quotas")
@limiter.limit("150/minute")
def filters_quotas(request: Request, counseling_type: Optional[str] = None,
                    state: Optional[str] = None, authority: Optional[str] = None,
                    institute_type: Optional[str] = None, course: Optional[str] = None,
                    db: Session = Depends(get_db)):
    """Quotas — scoped to everything selected so far, including course."""
    ck = (f"filters:quota:{counseling_type or 'ALL'}:{state or 'ALL'}:"
          f"{authority or 'ALL'}:{institute_type or 'ALL'}:{course or 'ALL'}")
    cached = cache.get(ck)
    if cached:
        return cached
    resp = {"success": True, "data": fs.get_quotas(db, counseling_type, state, authority, institute_type, course)}
    cache.set(ck, resp, ttl_seconds=24 * 3600)
    return resp


@app.get("/api/filters/categories")
@limiter.limit("150/minute")
def filters_categories(request: Request, counseling_type: Optional[str] = None,
                        state: Optional[str] = None, authority: Optional[str] = None,
                        institute_type: Optional[str] = None, db: Session = Depends(get_db)):
    """Categories — scoped to everything selected so far."""
    ck = f"filters:cat:{counseling_type or 'ALL'}:{state or 'ALL'}:{authority or 'ALL'}:{institute_type or 'ALL'}"
    cached = cache.get(ck)
    if cached:
        return cached
    resp = {"success": True, "data": fs.get_categories(db, counseling_type, state, authority, institute_type)}
    cache.set(ck, resp, ttl_seconds=24 * 3600)
    return resp


@app.get("/api/filters/rounds")
@limiter.limit("150/minute")
def filters_rounds(request: Request, counseling_type: Optional[str] = None,
                    state: Optional[str] = None, authority: Optional[str] = None,
                    institute_type: Optional[str] = None, db: Session = Depends(get_db)):
    """Rounds — scoped to everything selected so far (used by Upgrade module)."""
    ck = f"filters:round:{counseling_type or 'ALL'}:{state or 'ALL'}:{authority or 'ALL'}:{institute_type or 'ALL'}"
    cached = cache.get(ck)
    if cached:
        return cached
    resp = {"success": True, "data": fs.get_rounds(db, counseling_type, state, authority, institute_type)}
    cache.set(ck, resp, ttl_seconds=24 * 3600)
    return resp


@app.get("/api/upgrade-institutes")
@limiter.limit("40/minute")
def upgrade_institutes(
    request: Request,
    category:        Optional[str] = None,
    quota:           Optional[str] = None,
    counseling_type: Optional[str] = None,
    state:           Optional[str] = None,
    authority:       Optional[str] = None,
    institute_type:  Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Returns full list of distinct institutes available for upgrade check.
    Used by UpgradeProbability.jsx to populate the college dropdown.

    Query params (all optional):
      ?category=OBC&quota=AI+Quota&counseling_type=STATE
      &state=Uttar+Pradesh&authority=UPDGME&institute_type=Government
    """
    ck = "upgrade:institutes:" + "|".join([
        category or "", quota or "", counseling_type or "", state or "",
        authority or "", institute_type or "",
    ])
    cached = cache.get(ck)
    if cached:
        return cached

    institutes = get_upgrade_institutes(
        db, category=category, quota=quota,
        counseling_type=counseling_type, state=state, authority=authority,
        institute_type=institute_type,
    )
    resp = {
        "success": True,
        "data": {
            "institutes": institutes,
            "count": len(institutes),
        }
    }
    cache.set(ck, resp, ttl_seconds=3600)
    return resp


@app.post("/api/upgrade-check")
@limiter.limit("40/minute")
def upgrade_check(request: Request, payload: UpgradeRequest, db: Session = Depends(get_db)):
    """
    Round-wise upgrade probability engine.
    Uses historical R1→R2 / R2→R3 shift data to predict upgrade chances.
    Scoped by counseling_type/state/authority in addition to category/quota.
    """
    ck = "upgrade:check:" + str(sorted(payload.model_dump().items()))
    cached = cache.get(ck)
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
            counseling_type=payload.counseling_type,
            state=payload.state,
            authority=payload.authority,
            institute_type=payload.institute_type,
        )
    except Exception as e:
        logger.exception("Upgrade engine error: %s", e)
        raise HTTPException(status_code=500, detail="Upgrade engine error. Please try again.")

    # ── Return success:false as a 200 JSON body, NOT a 404.
    # A 404 makes apiFetch() in UpgradeProbability.jsx throw (res.ok is False),
    # which jumps to the catch block and shows a generic error toast instead of
    # the engine's helpful "Insufficient data" message. Returning 200 lets the
    # frontend read result.success === false and display the message properly.
    if not result.get("success"):
        return result

    cache.set(ck, result, ttl_seconds=3600)
    return result


@app.post("/api/optimize")
@limiter.limit("40/minute")
def optimize(request: Request, payload: OptimizeRequest, db: Session = Depends(get_db)):
    """
    Core college prediction endpoint.
    category is REQUIRED — no "ALL" allowed.
    counseling_type/state/authority are OPTIONAL — "ALL" means no scope
    restriction (e.g. MCC + AYUSH data combined), while e.g.
    counseling_type="STATE", state="Uttar Pradesh", authority="UPDGME"
    scopes the prediction to just that authority's counseling data.
    """
    if not payload.category or payload.category.strip().upper() == "ALL":
        raise HTTPException(
            status_code=422,
            detail="category is required. Please select a value from /api/filters → categories."
        )

    ck = "optimize:" + str(sorted(payload.model_dump().items()))
    cached = cache.get(ck)
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
            counseling_type=payload.counseling_type,
            state=payload.state,
            authority=payload.authority,
            institute_type=payload.institute_type,
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
        "success":         True,
        "user_rank":       payload.user_rank,
        "category":        payload.category,
        "quota":           payload.quota,
        "course":          payload.course,
        "counseling_type": payload.counseling_type,
        "state":           payload.state,
        "authority":       payload.authority,
        "institute_type":  payload.institute_type,
        "dream":           result["dream"],
        "target":          result["target"],
        "safe":            result["safe"],
        "stats": {
            "total_analyzed": len(result["dream"]) + len(result["target"]) + len(result["safe"]),
            "dream_count":    len(result["dream"]),
            "target_count":   len(result["target"]),
            "safe_count":     len(result["safe"]),
        }
    }

    cache.set(ck, response, ttl_seconds=3600)
    return response


# ─── Admin (mirrors cutoffController.js's invalidateCache / rebuildFacets) ───
def _check_import_secret(x_import_secret: Optional[str]):
    if not IMPORT_SECRET:
        raise HTTPException(status_code=503, detail="IMPORT_SECRET not configured on this server.")
    if x_import_secret != IMPORT_SECRET:
        raise HTTPException(status_code=403, detail="Unauthorized")


@app.post("/api/admin/cache-invalidate")
@limiter.limit("5/minute")
def admin_cache_invalidate(request: Request, x_import_secret: Optional[str] = Header(default=None)):
    """
    Call this right after uploader_turbo_v3.py finishes a CSV import
    (matches the Node backend's POST /api/admin/cache-invalidate — call
    both, with the same secret, right after an import so neither backend
    serves stale data).

    curl -X POST https://your-python-api/api/admin/cache-invalidate \\
         -H "x-import-secret: $IMPORT_SECRET"
    """
    _check_import_secret(x_import_secret)
    version = cache.bump_import_version()
    return {"success": True, "importVersion": version}
