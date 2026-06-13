# =============================================================
# python_backend/prediction_engine.py — v6
# FIXED for mcc_cutoffs schema:
#   - r.round_name  → r.round
#   - r.institute   → r.institute_name
#   - r.program     → r.course
#   - r.closeRank   → r.closing_rank
#   - r.openRank    → r.opening_rank
#   - r.bondYears   → r.bond_years
# =============================================================

import logging
import math
import re
import statistics
from typing import List, Dict, Optional, Tuple
from sqlalchemy.orm import Session
from models import Cutoff

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

_ROUND_PRIORITY_MAP = {
    "round 1": 1, "round1": 1,
    "round 2": 2, "round2": 2,
    "round 3": 3, "round3": 3,
    "round 4": 4, "round4": 4,
    "round 5": 5, "round5": 5,
    "mop-up round": 10, "mop up round": 10, "mop-up": 10, "mopup": 10,
    "stray vacancy round": 20, "stray vacancy": 20,
    "special stray round": 20, "stray round": 20,
}

_ROUND_WEIGHT_MAP = {
    1: 1.00, 2: 0.40, 3: 0.25, 4: 0.20, 5: 0.15, 10: 0.05, 20: 0.02,
}

_OUTLIER_FACTOR = 3.5


def _round_priority(round_name: str) -> int:
    if not round_name:
        return 99
    key = round_name.strip().lower()
    if key in _ROUND_PRIORITY_MAP:
        return _ROUND_PRIORITY_MAP[key]
    if "stray" in key:
        return 20
    if "mop" in key:
        return 10
    nums = re.findall(r'\d+', key)
    if nums:
        return int(nums[0])
    return 99


def _round_weight(priority: int) -> float:
    return _ROUND_WEIGHT_MAP.get(priority, 0.01)


def _extract_per_year_data(rows: List[Cutoff]) -> Dict[int, dict]:
    by_year: Dict[int, list] = {}
    for r in rows:
        prio = _round_priority(r.round or "")          # FIXED: r.round
        entry = {
            "priority":   prio,
            "closeRank":  r.closing_rank,               # FIXED: r.closing_rank
            "openRank":   r.opening_rank,               # FIXED: r.opening_rank
            "round_name": r.round or "",                # FIXED: r.round
        }
        by_year.setdefault(r.year, []).append(entry)

    result: Dict[int, dict] = {}

    for yr, entries in by_year.items():
        entries.sort(key=lambda e: e["priority"])
        anchor       = entries[0]
        anchor_close = anchor["closeRank"]
        is_true_r1   = anchor["priority"] == 1

        for e in entries:
            if anchor_close and e["closeRank"] > anchor_close * _OUTLIER_FACTOR:
                e["is_outlier"] = True
                e["weight"]     = 0.0
            else:
                e["is_outlier"] = False
                e["weight"]     = _round_weight(e["priority"])

        valid = [e for e in entries if not e["is_outlier"] and e["weight"] > 0]
        if not valid:
            valid = [anchor]
            for v in valid:
                v["weight"] = 1.0

        total_weight  = sum(e["weight"] for e in valid) or 1.0
        blended_close = max(1, int(round(
            sum(e["closeRank"] * e["weight"] for e in valid) / total_weight
        )))

        late  = [e for e in entries if e["priority"] >= 10]
        early = [e for e in entries if e["priority"] <= 5]

        if not is_true_r1 and early:
            data_quality = "early_proxy"
        elif not is_true_r1 and not early:
            mopup_close   = late[0]["closeRank"] if late else blended_close
            blended_close = max(1, int(mopup_close * 0.55))
            data_quality  = "mopup_only"
        else:
            data_quality = "good"

        r1_entries = [e for e in entries if e["priority"] == 1]
        r1_close   = r1_entries[0]["closeRank"] if r1_entries else None
        final_entry = entries[-1]
        late_rank   = final_entry["closeRank"] if final_entry["priority"] >= 10 else None

        result[yr] = {
            "closeRank":    blended_close,
            "r1_close":     r1_close,
            "openRank":     anchor.get("openRank"),
            "late_rank":    late_rank,
            "used_round":   anchor["round_name"],
            "data_quality": data_quality,
            "rounds_seen":  sorted(set(e["round_name"] for e in entries)),
            "has_r1":       is_true_r1,
        }

    all_closes = [v["closeRank"] for v in result.values()]
    if len(all_closes) >= 3:
        mean_c = statistics.mean(all_closes)
        std_c  = statistics.stdev(all_closes)
        for yd in result.values():
            z = abs(yd["closeRank"] - mean_c) / std_c if std_c > 0 else 0
            yd["is_anomaly"] = (z > 2.5)
    else:
        for yd in result.values():
            yd["is_anomaly"] = False

    return result


def _weighted_ols(X, Y, W) -> Tuple[float, float]:
    sw   = sum(W)
    swx  = sum(w*x for w, x in zip(W, X))
    swy  = sum(w*y for w, y in zip(W, Y))
    swx2 = sum(w*x*x for w, x in zip(W, X))
    swxy = sum(w*x*y for w, x, y in zip(W, X, Y))
    d    = sw*swx2 - swx**2
    if d == 0:
        return 0.0, swy / sw
    slope     = (sw*swxy - swx*swy) / d
    intercept = (swy - slope*swx) / sw
    return slope, intercept


def _weighted_r2(X, Y, slope, intercept, W) -> float:
    yp    = [slope*x + intercept for x in X]
    ss_r  = sum(w*(y - p)**2 for w, y, p in zip(W, Y, yp))
    ymean = sum(w*y for w, y in zip(W, Y)) / sum(W)
    ss_t  = sum(w*(y - ymean)**2 for w, y in zip(W, Y))
    return max(0.0, 1 - ss_r/ss_t) if ss_t > 0 else 0.0


def _holt_forecast(values: List[float], alpha=0.45, beta=0.25) -> float:
    if len(values) < 2:
        return values[-1] if values else 0.0
    level = values[0]
    trend = values[1] - values[0]
    for v in values[1:]:
        pl    = level
        level = alpha * v + (1 - alpha) * (level + trend)
        trend = beta  * (level - pl) + (1 - beta) * trend
    return level + trend


def _exp_smooth(values: List[float], alpha=0.35) -> float:
    if not values:
        return 0.0
    s = values[0]
    for v in values[1:]:
        s = alpha * v + (1 - alpha) * s
    return s


def _iqr_filter(values: List[float]) -> List[float]:
    if len(values) < 4:
        return values
    q1 = statistics.quantiles(values, n=4)[0]
    q3 = statistics.quantiles(values, n=4)[2]
    iqr = q3 - q1
    lo  = q1 - 1.5 * iqr
    hi  = q3 + 1.5 * iqr
    filtered = [v for v in values if lo <= v <= hi]
    return filtered if len(filtered) >= 2 else values


def predict_closing_rank(rows: List[Cutoff]) -> Optional[Dict]:
    year_map = _extract_per_year_data(rows)
    if not year_map:
        return None

    years = sorted(year_map.keys())
    n     = len(years)
    PREDICT_YEAR = 2026

    # Latest row for metadata
    latest = max(rows, key=lambda r: r.year)

    if n == 1:
        yr = years[0]
        yd = year_map[yr]
        return {
            "institute":       latest.institute_name,   # FIXED
            "program":         latest.course,           # FIXED
            "quota":           latest.quota,
            "category":        latest.category,
            "predicted_close": yd["closeRank"],
            "closeRank":       yd["closeRank"],
            "r1_close":        yd.get("r1_close"),
            "late_rank":       yd.get("late_rank"),
            "openRank":        yd["openRank"],
            "confidence":      15.0,
            "trend":           "Stable",
            "momentum":        "Steady",
            "volatility":      0.0,
            "demand_pressure": None,
            "fees":            latest.fees,
            "bondYears":       latest.bond_years,       # FIXED
            "data_years":      years,
            "years_of_data":   1,
            "data_quality":    yd.get("data_quality", "good"),
            "used_rounds":     yd.get("rounds_seen", []),
            "note":            "insufficient_data",
        }

    if n == 2:
        y0, y1  = years[0], years[1]
        c0, c1  = year_map[y0]["closeRank"], year_map[y1]["closeRank"]
        predicted = max(1, int(round(0.70 * c1 + 0.30 * c0)))
        slope2 = c1 - c0
        trend2 = "Rising" if slope2 > 30 else ("Falling" if slope2 < -30 else "Stable")
        late_ranks = [year_map[yr].get("late_rank") for yr in years if year_map[yr].get("late_rank")]
        return {
            "institute":       latest.institute_name,   # FIXED
            "program":         latest.course,           # FIXED
            "quota":           latest.quota,
            "category":        latest.category,
            "predicted_close": predicted,
            "closeRank":       predicted,
            "r1_close":        year_map[y1].get("r1_close"),
            "late_rank":       max(late_ranks) if late_ranks else None,
            "openRank":        year_map[y1].get("openRank"),
            "confidence":      28.0,
            "trend":           trend2,
            "momentum":        "Steady",
            "volatility":      round(abs(c1 - c0) / max(c0, 1) * 100, 2),
            "demand_pressure": None,
            "fees":            latest.fees,
            "bondYears":       latest.bond_years,       # FIXED
            "data_years":      years,
            "years_of_data":   2,
            "data_quality":    "mixed",
            "used_rounds":     year_map[y1].get("rounds_seen", []),
            "note":            "limited_data",
        }

    # 3+ years full prediction
    X = [float(y) for y in years]
    Y = [float(year_map[y]["closeRank"]) for y in years]
    hist_min = min(Y)
    hist_max = max(Y)

    YEAR_QUALITY_WEIGHT = []
    for yr in years:
        yd   = year_map[yr]
        base = 1.0
        if yd.get("is_anomaly"):             base *= 0.30
        if yd.get("data_quality") == "mopup_only":  base *= 0.40
        elif yd.get("data_quality") == "early_proxy": base *= 0.70
        YEAR_QUALITY_WEIGHT.append(base)

    W1     = [math.pow(0.75, PREDICT_YEAR - y) * qw for y, qw in zip(years, YEAR_QUALITY_WEIGHT)]
    s1, i1 = _weighted_ols(X, Y, W1)
    m1     = s1 * PREDICT_YEAR + i1
    r2     = _weighted_r2(X, Y, s1, i1, W1)

    recent_Y = Y[-4:] if n >= 4 else Y
    clean_Y  = _iqr_filter(recent_Y)
    m2       = _holt_forecast(clean_Y)
    m3       = _exp_smooth(Y)

    r1_years = [(y, year_map[y]["r1_close"]) for y in years if year_map[y].get("r1_close")]
    m4 = None
    if len(r1_years) >= 3:
        XR = [float(yr) for yr, _ in r1_years]
        YR = [float(rc) for _, rc in r1_years]
        WR = [math.pow(0.75, PREDICT_YEAR - yr) for yr, _ in r1_years]
        sR, iR = _weighted_ols(XR, YR, WR)
        m4     = sR * PREDICT_YEAR + iR

    if m4 is not None:
        raw = 0.45*m4 + 0.30*m1 + 0.15*m2 + 0.10*m3
    else:
        raw = 0.50*m1 + 0.30*m2 + 0.20*m3

    raw       = max(max(1.0, hist_min * 0.50), min(hist_max * 2.0, raw))
    predicted = max(1, int(round(raw)))

    good_years     = sum(1 for yr in years if year_map[yr].get("data_quality") == "good")
    r1_years_count = sum(1 for yr in years if year_map[yr].get("has_r1", False))
    r1_coverage    = r1_years_count / n

    shifts = []
    for i in range(1, n):
        prev = year_map[years[i-1]]["closeRank"]
        curr = year_map[years[i]]["closeRank"]
        if prev > 0:
            shifts.append((curr - prev) / prev)
    volatility = round(statistics.stdev(shifts) * 100, 2) if len(shifts) > 1 else 0.0

    confidence = max(0.0, min(100.0, round(
        r2 * 50 + min(25.0, good_years * 5.0) + r1_coverage * 15 + max(0, 10 - volatility * 0.5), 1
    )))

    trend    = "Rising" if s1 > 30 else ("Falling" if s1 < -30 else "Stable")
    momentum = "Steady"
    if n >= 3:
        recent_slope = Y[-1] - Y[-2]
        lt_slope     = (Y[-1] - Y[0]) / max(1, n - 1)
        if abs(recent_slope) > 0 and (recent_slope * lt_slope < 0):
            momentum = "Reversing"
        elif abs(recent_slope) > abs(lt_slope) * 1.5:
            momentum = "Accelerating"

    spreads = []
    for yr in years:
        op = year_map[yr].get("openRank")
        cl = year_map[yr]["closeRank"]
        if op and cl and cl > 0:
            spreads.append((cl - op) / cl)
    demand_pressure = round(statistics.mean(spreads) * 100, 1) if spreads else None

    recent_late = [
        year_map[yr].get("late_rank") for yr in years[-2:]
        if year_map[yr].get("late_rank") is not None
    ]
    best_late_rank = max(recent_late) if recent_late else None

    mopup_count   = sum(1 for yr in years if year_map[yr].get("data_quality") == "mopup_only")
    anomaly_count = sum(1 for yr in years if year_map[yr].get("is_anomaly", False))
    data_quality  = "mopup_only" if mopup_count == n else ("mixed" if (mopup_count > 0 or anomaly_count > 0) else "good")

    notes = []
    if anomaly_count > 0:   notes.append(f"{anomaly_count} anomalous year(s) down-weighted")
    if mopup_count > 0 and mopup_count < n: notes.append(f"{mopup_count} mop-up-only year(s) adjusted")
    if volatility > 25:     notes.append("High volatility — cutoff can swing significantly")
    if r1_coverage < 0.6:   notes.append("Limited Round 1 data — prediction less reliable")

    return {
        "institute":        latest.institute_name,      # FIXED
        "program":          latest.course,              # FIXED
        "quota":            latest.quota,
        "category":         latest.category,
        "predicted_close":  predicted,
        "closeRank":        predicted,
        "r1_close":         year_map[years[-1]].get("r1_close"),
        "late_rank":        best_late_rank,
        "openRank":         year_map[years[-1]].get("openRank"),
        "confidence":       confidence,
        "trend":            trend,
        "momentum":         momentum,
        "volatility":       volatility,
        "demand_pressure":  demand_pressure,
        "fees":             latest.fees,
        "bondYears":        latest.bond_years,          # FIXED
        "data_years":       years,
        "years_of_data":    n,
        "data_quality":     data_quality,
        "hist_min":         int(hist_min),
        "hist_max":         int(hist_max),
        "r1_years_count":   r1_years_count,
        "notes":            notes if notes else None,
    }


def run_optimizer(db: Session, user_rank: int, category: str, quota: str, course: str, top_n: int = 0) -> Dict:
    from sqlalchemy import func

    query = db.query(Cutoff)
    if category and category != "ALL":
        query = query.filter(func.lower(func.trim(Cutoff.category)) == category.strip().lower())
    if quota and quota != "ALL":
        query = query.filter(func.lower(func.trim(Cutoff.quota)) == quota.strip().lower())
    if course and course != "ALL":
        query = query.filter(func.lower(func.trim(Cutoff.course)) == course.strip().lower())

    all_rows = query.all()

    # ── Fallback: if quota+course combo has nothing, try without course
    # (some quotas, e.g. "Deemed/Paid Seat Quota", may only have rows under
    # a different course label than the user picked).
    if not all_rows and course and course != "ALL":
        fallback_q = db.query(Cutoff)
        if category and category != "ALL":
            fallback_q = fallback_q.filter(func.lower(func.trim(Cutoff.category)) == category.strip().lower())
        if quota and quota != "ALL":
            fallback_q = fallback_q.filter(func.lower(func.trim(Cutoff.quota)) == quota.strip().lower())
        all_rows = fallback_q.all()
        if all_rows:
            logger.info("Optimizer fallback: dropped course filter (%s) — %d rows found", course, len(all_rows))

    if not all_rows:
        return {"dream": [], "target": [], "safe": [], "message": "No data found for selected filters."}

    groups: Dict = {}
    for row in all_rows:
        key = (row.institute_name, row.course, row.category, row.quota)  # FIXED
        groups.setdefault(key, []).append(row)

    predictions = []
    for key, rows in groups.items():
        pred = predict_closing_rank(rows)
        if pred is None:
            continue
        pred["safety_margin"] = user_rank - pred["predicted_close"]
        lr = pred.get("late_rank")
        pred["late_chance"] = (lr is not None and user_rank <= lr)
        predictions.append(pred)

    DREAM_MUL  = 0.62
    TARGET_MUL = 1.02

    dream, target, safe = [], [], []
    for p in predictions:
        pc  = p["predicted_close"]
        vol = p.get("volatility", 0)
        adj = DREAM_MUL + min(0.08, vol * 0.003)
        if pc <= user_rank * adj:
            p["bucket"] = "dream"
            dream.append(p)
        elif pc <= user_rank * TARGET_MUL:
            p["bucket"] = "target"
            target.append(p)
        else:
            p["bucket"] = "safe"
            safe.append(p)

    dream.sort( key=lambda x: x["predicted_close"])
    target.sort(key=lambda x: x["predicted_close"])
    safe.sort(  key=lambda x: x["predicted_close"])

    if top_n > 0:
        dream  = dream[:top_n]
        target = target[:top_n]
        safe   = safe[:top_n]

    logger.info("Category=%s Quota=%s Course=%s UserRank=%d → D:%d T:%d S:%d",
                category, quota, course, user_rank, len(dream), len(target), len(safe))

    return {"dream": dream, "target": target, "safe": safe, "message": None}