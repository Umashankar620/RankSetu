# =============================================================
# python_backend/cache.py — Redis-first, in-memory fallback
# =============================================================
# Mirrors the Node backend's config/cache.js on purpose:
#   • If REDIS_URL is set   → uses redis-py (shared across all
#     uvicorn workers/processes — fixes the bug where each worker
#     used to have its OWN separate in-memory cache).
#   • Otherwise              → falls back to an in-process dict
#     (fine for local dev / a single worker).
#
# Interface (all sync, since main.py routes are sync `def`, not
# `async def` — matches the existing SQLAlchemy sync session usage):
#   cache.get(key)                  -> value | None
#   cache.set(key, value, ttl_seconds=3600)
#   cache.delete_prefix(prefix)
#   cache.flush()
#   cache.bump_import_version()     -> call this (or hit
#                                       POST /api/admin/cache-invalidate)
#                                       right after a CSV import finishes.
#   cache.get_import_version()
# =============================================================

import os
import time
import json
import threading
import logging

logger = logging.getLogger(__name__)

_redis_client = None
REDIS_URL = os.getenv("REDIS_URL")

if REDIS_URL:
    try:
        import redis as _redis_pkg
        _redis_client = _redis_pkg.Redis.from_url(REDIS_URL, decode_responses=True)
        _redis_client.ping()
        logger.info("✅ Redis connected (python backend)")
    except Exception as e:
        logger.warning("⚠️  Redis unavailable, falling back to memory cache: %s", e)
        _redis_client = None

# ── In-memory fallback ────────────────────────────────────────
_store: dict = {}
_lock = threading.Lock()


def get(key: str):
    if _redis_client:
        try:
            raw = _redis_client.get(key)
            return json.loads(raw) if raw else None
        except Exception:
            return None
    with _lock:
        entry = _store.get(key)
        if not entry:
            return None
        if time.time() > entry["expires_at"]:
            del _store[key]
            return None
        return entry["value"]


def set(key: str, value, ttl_seconds: int = 3600):
    if _redis_client:
        try:
            _redis_client.set(key, json.dumps(value), ex=ttl_seconds)
        except Exception as e:
            logger.warning("Redis SET failed for %s: %s", key, e)
        return
    with _lock:
        if len(_store) > 5000:
            _store.clear()
        _store[key] = {"value": value, "expires_at": time.time() + ttl_seconds}


def delete_prefix(prefix: str):
    if _redis_client:
        try:
            keys = _redis_client.keys(f"{prefix}*")
            if keys:
                _redis_client.delete(*keys)
        except Exception as e:
            logger.warning("Redis delete_prefix failed for %s: %s", prefix, e)
        return
    with _lock:
        for k in list(_store.keys()):
            if k.startswith(prefix):
                del _store[k]


def flush():
    if _redis_client:
        try:
            _redis_client.flushdb()
        except Exception as e:
            logger.warning("Redis flush failed: %s", e)
        return
    with _lock:
        _store.clear()


def bump_import_version() -> str:
    """
    Call this right after uploader_turbo_v3.py finishes a CSV import
    (or POST /api/admin/cache-invalidate with the shared secret), so
    stale predictions/upgrade-checks are never served after data
    refreshes. Mirrors cache.js's bumpImportVersion().
    """
    v = str(int(time.time() * 1000))
    set("import_version", v, ttl_seconds=30 * 24 * 60 * 60)  # 30 days
    delete_prefix("optimize:")
    delete_prefix("upgrade:")
    delete_prefix("filters:")
    logger.info("✅ Python backend cache invalidated, version: %s", v)
    return v


def get_import_version() -> str:
    return get("import_version") or "0"
