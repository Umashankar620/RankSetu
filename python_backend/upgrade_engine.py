# =============================================================
# upgrade_engine.py — v4
# FIXED for mcc_cutoffs schema:
#   - r.round_name  → r.round
#   - r.institute   → r.institute_name
#   - r.closeRank   → r.closing_rank
#   - r.openRank    → r.opening_rank
# =============================================================

from __future__ import annotations

import re
import statistics
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple

from sqlalchemy import distinct
from sqlalchemy.orm import Session

from models import Cutoff

_OUTLIER_FACTOR       = 3.5
_MIN_YEARS_FOR_SELF   = 1   # FIX: was 2 — many colleges only have 1 year; still usable
_MIN_YEARS_FOR_BETTER = 1
_MAX_UPGRADE_PCT      = 92.0
_MIN_UPGRADE_PCT      = 5.0
_REACH_MARGIN_CUTOFF  = -2000


def _is_all(value: Optional[str]) -> bool:
    return not value or str(value).strip().upper() == "ALL"


def _round_priority(rname: str) -> int:
    if not rname:
        return 99
    key = rname.strip().lower()
    if "stray" in key:
        return 99
    if "mop" in key:
        return 10
    nums = re.findall(r'\d+', key)
    if nums:
        n = int(nums[0])
        return n if 1 <= n <= 5 else 99
    return 99


def _available_years(db, institute, category, quota) -> List[int]:
    q = db.query(distinct(Cutoff.year)).filter(
        Cutoff.institute_name == institute.strip(),   # FIXED
        Cutoff.closing_rank.isnot(None),              # FIXED
        Cutoff.closing_rank > 0,                      # FIXED
    )
    if not _is_all(category):
        q = q.filter(Cutoff.category == category)
    if not _is_all(quota):
        q = q.filter(Cutoff.quota == quota)
    return sorted(r[0] for r in q.all() if r[0])


def _query_cutoffs(db, institute, category, quota, year=None) -> List[Cutoff]:
    q = db.query(Cutoff).filter(
        Cutoff.institute_name == institute.strip(),   # FIXED
        Cutoff.closing_rank.isnot(None),              # FIXED
        Cutoff.closing_rank > 0,                      # FIXED
    )
    if not _is_all(category):
        q = q.filter(Cutoff.category == category)
    if not _is_all(quota):
        q = q.filter(Cutoff.quota == quota)
    if year is not None:
        q = q.filter(Cutoff.year == year)
    return q.all()


def _best_close_for_priority(rows: List[Cutoff], target_priority: int) -> Optional[int]:
    matches = [r.closing_rank for r in rows              # FIXED
               if _round_priority(r.round or "") == target_priority]  # FIXED
    return min(matches) if matches else None


def _year_weight(year: int, max_year: int) -> float:
    age = max(0, max_year - year)
    return max(0.35, 1.0 - age * 0.18)


@dataclass
class YearShift:
    year: int
    from_close: int
    to_close: int
    shift: int
    weight: float


def _build_year_shifts(db, institute, category, quota, from_priority, to_priority) -> List[YearShift]:
    years = _available_years(db, institute, category, quota)
    if not years:
        return []

    max_year = max(years)
    records  = []

    for year in years:
        rows       = _query_cutoffs(db, institute, category, quota, year)
        from_close = _best_close_for_priority(rows, from_priority)
        to_close   = _best_close_for_priority(rows, to_priority)
        if from_close is None or to_close is None:
            continue
        if to_close > from_close * _OUTLIER_FACTOR:
            continue
        if to_priority >= 10 and (to_close - from_close) > from_close * 0.75:
            continue
        records.append(YearShift(
            year=year, from_close=from_close, to_close=to_close,
            shift=to_close - from_close, weight=_year_weight(year, max_year),
        ))
    return records


def _weighted_shift(records: List[YearShift]) -> float:
    if not records: return 0.0
    tw = sum(r.weight for r in records)
    if tw <= 0: return statistics.mean(r.shift for r in records)
    return sum(r.shift * r.weight for r in records) / tw


def _weighted_median_shift(records: List[YearShift]) -> float:
    if not records: return 0.0
    expanded = []
    for r in records:
        reps = max(1, int(round(r.weight * 3)))
        expanded.extend([r.shift] * reps)
    return float(statistics.median(expanded))


def _predict_next_close(db, institute, category, quota, from_p, to_p, records) -> Optional[int]:
    years = _available_years(db, institute, category, quota)
    if not years or not records:
        return None
    max_year = max(years)
    rows     = _query_cutoffs(db, institute, category, quota, max_year)
    base     = _best_close_for_priority(rows, from_p)
    if base is None:
        for year in sorted(years, reverse=True):
            rows = _query_cutoffs(db, institute, category, quota, year)
            base = _best_close_for_priority(rows, from_p)
            if base is not None:
                break
    if base is None:
        return None
    w_mean   = _weighted_shift(records)
    w_median = _weighted_median_shift(records)
    shift    = 0.55 * w_median + 0.45 * w_mean
    return max(1, round(base + shift))


def _latest_from_close(db, institute, category, quota, from_p) -> Optional[int]:
    for year in sorted(_available_years(db, institute, category, quota), reverse=True):
        rows = _query_cutoffs(db, institute, category, quota, year)
        val  = _best_close_for_priority(rows, from_p)
        if val is not None:
            return val
    return None


def _upgrade_probability(user_rank, predicted_next, current_from_close, records, better_count) -> float:
    if not records:
        return _MIN_UPGRADE_PCT
    margin     = predicted_next - user_rank
    relax_rate = sum(1 for r in records if r.shift > 0) / len(records)
    shifts     = [r.shift for r in records]
    std        = statistics.stdev(shifts) if len(shifts) > 1 else abs(shifts[0]) * 0.15
    avg_shift  = statistics.mean(shifts)
    volatility = std / max(abs(avg_shift), 50)
    seat_buffer = current_from_close - user_rank
    seat_ratio  = seat_buffer / max(current_from_close, 1)

    if margin < -800:   base = 8.0
    elif margin < 0:    base = 12.0 + (margin + 800) / 800 * 18.0
    elif margin < 1200: base = 30.0 + (margin / 1200) * 28.0
    elif margin < 4000: base = 58.0 + ((margin - 1200) / 2800) * 22.0
    else:               base = 80.0

    base += relax_rate * 12.0
    base -= min(18.0, volatility * 8.0)
    base += min(12.0, better_count * 2.5)
    if seat_ratio < 0.04:   base -= 22.0
    elif seat_ratio < 0.10: base -= 10.0
    elif seat_ratio > 0.22: base += 8.0
    if len(records) < 3: base -= 8.0
    elif len(records) >= 4: base += 4.0

    return round(max(_MIN_UPGRADE_PCT, min(_MAX_UPGRADE_PCT, base)), 1)


def _college_confidence(user_rank, predicted_to, records) -> float:
    reach = predicted_to - user_rank
    if reach <= 0:
        return 5.0
    reach_score  = min(40.0, (reach / max(predicted_to, 1)) * 80.0)
    years_score  = min(25.0, len(records) * 6.0)
    relax_rate   = sum(1 for r in records if r.shift > 0) / max(len(records), 1)
    relax_score  = relax_rate * 20.0
    shifts       = [r.shift for r in records]
    std          = statistics.stdev(shifts) if len(shifts) > 1 else 0.0
    stability    = max(0.0, 15.0 - (std / max(abs(statistics.mean(shifts)), 1)) * 3.0)
    return round(min(95.0, reach_score + years_score + relax_score + stability), 1)


def _upgrade_zone(p: float) -> str:
    if p > 60: return "Promising"
    if p >= 35: return "Uncertain"
    return "Risky"


def _seat_risk(current_close, user_rank) -> str:
    margin = current_close - user_rank
    ratio  = margin / max(current_close, 1)
    if margin >= 700 or ratio >= 0.22: return "Low"
    if margin <= 120 or ratio <= 0.04: return "High"
    return "Medium"


def _trend_label(records: List[YearShift]) -> str:
    if len(records) < 2: return "Stable"
    recent = sorted(records, key=lambda r: r.year)[-2:]
    if all(r.shift > 40 for r in recent):  return "Falling"
    if all(r.shift < -40 for r in recent): return "Rising"
    return "Stable"


def _trend_word(records: List[YearShift]) -> str:
    if not records: return "Stable"
    return "Relaxes" if _weighted_shift(records) > 0 else "Tightens"


def _avg_fees(rows: List[Cutoff]) -> Optional[float]:
    vals = [r.fees for r in rows if r.fees and r.fees > 0]
    return round(sum(vals) / len(vals), 2) if vals else None


def _recommendation(probability, zone, risk, better_count, trend, next_label) -> str:
    if zone == "Promising" and better_count > 0 and risk in ("Low", "Medium"):
        return (f"Historical data supports trying {next_label} — "
                f"{better_count} better college{'s' if better_count != 1 else ''} look reachable "
                f"and your current seat is {risk.lower()}-risk to lose.")
    if zone == "Promising" and risk == "High":
        return ("Upgrade odds look decent, but you are close to the current closing rank — "
                "only proceed if you accept the risk of losing this allotment.")
    if zone == "Uncertain":
        if trend == "Relaxes":
            return ("Cutoffs usually relax in the next round, but your rank is borderline — "
                    "compare better-college options carefully before exiting.")
        return ("Upgrade is possible but uncertain — keep your current allotment as backup "
                "while monitoring next-round movement.")
    if better_count == 0:
        return ("No clearly better colleges at your rank based on multi-year round-wise data — "
                "freezing may be safer.")
    return ("Upgrade probability is low at your rank — freeze unless you are willing to "
            "risk this seat for a marginal upgrade.")


def _round_scenarios(current_round: str) -> List[Tuple[int, int, str]]:
    key = (current_round or "Round 1").strip().lower()
    if key in ("round 2", "round2"):
        return [(2, 3, "Round 3")]
    return [(1, 2, "Round 2")]


def _round_labels(current_round, scenarios):
    if _is_all(current_round):
        return "All Rounds", "Round 2", "Round 2"
    fp, tp, label = scenarios[0]
    from_name = {1: "Round 1", 2: "Round 2", 3: "Round 3"}.get(fp, f"Round {fp}")
    to_name   = {2: "Round 2", 3: "Round 3", 10: "Late Round"}.get(tp, f"Round {tp}")
    return from_name, to_name, label


def run_upgrade_check(db: Session, user_rank: int, current_institute: str,
                      category: str, quota: str, current_round: str = "Round 1") -> Dict:
    scenarios = _round_scenarios(current_round)
    from_round, to_round, next_label = _round_labels(current_round, scenarios)
    from_p, to_p, _ = scenarios[0]

    records: List[YearShift] = []
    for fp, tp, _ in scenarios:
        records.extend(_build_year_shifts(db, current_institute, category, quota, fp, tp))

    if len(records) < _MIN_YEARS_FOR_SELF:
        return {
            "success": False,
            "message": (f"No round-wise shift data found for '{current_institute}' "
                        f"with the selected Category/Quota combination. "
                        "Try selecting 'All Categories' or 'All Quotas' to widen the search."),
        }

    shifts         = [r.shift for r in records]
    avg_shift      = round(_weighted_shift(records))
    std_dev        = statistics.stdev(shifts) if len(shifts) > 1 else 0.0
    trend_word_val = _trend_word(records)

    current_from_close = _latest_from_close(db, current_institute, category, quota, from_p)
    if current_from_close is None:
        return {"success": False, "message": "Could not find current-round cutoff for this college."}

    predicted_next = _predict_next_close(db, current_institute, category, quota, from_p, to_p, records)
    if predicted_next is None:
        return {"success": False, "message": "Could not predict next-round cutoff from historical data."}

    # Better colleges
    inst_q = db.query(distinct(Cutoff.institute_name)).filter(  # FIXED
        Cutoff.institute_name.isnot(None),
        Cutoff.institute_name != "",
    )
    if not _is_all(category):
        inst_q = inst_q.filter(Cutoff.category == category)
    if not _is_all(quota):
        inst_q = inst_q.filter(Cutoff.quota == quota)

    all_institutes = [r[0] for r in inst_q.order_by(Cutoff.institute_name).all()]

    better_colleges: List[Dict] = []
    for inst in all_institutes:
        if inst.strip() == current_institute.strip():
            continue
        inst_from = _latest_from_close(db, inst, category, quota, from_p)
        if inst_from is None or inst_from >= current_from_close:
            continue
        inst_records = _build_year_shifts(db, inst, category, quota, from_p, to_p)
        if not inst_records:
            inst_predicted = inst_from
            conf           = 10.0
            low_data       = True
        else:
            if len(inst_records) < _MIN_YEARS_FOR_BETTER:
                continue
            inst_predicted = _predict_next_close(db, inst, category, quota, from_p, to_p, inst_records)
            if inst_predicted is None:
                continue
            conf     = _college_confidence(user_rank, inst_predicted, inst_records)
            low_data = len(inst_records) < 2

        reach_margin = inst_predicted - user_rank
        if reach_margin < _REACH_MARGIN_CUTOFF:
            continue

        years    = _available_years(db, inst, category, quota)
        fee_rows = _query_cutoffs(db, inst, category, quota, max(years) if years else None)
        fees     = _avg_fees(fee_rows)

        to_rows_exist = any(
            _best_close_for_priority(_query_cutoffs(db, inst, category, quota, y), to_p) is not None
            for y in years
        )

        better_colleges.append({
            "institute":                  inst,
            "predicted_r2_cutoff":        inst_predicted,
            "confidence":                 conf,
            "trend":                      _trend_label(inst_records) if inst_records else "Unknown",
            "fees":                       fees,
            "historical_r2_availability": to_rows_exist,
            "tier_rank":                  inst_from,
            "low_data_warning":           low_data,
        })

    better_colleges.sort(key=lambda c: (c["tier_rank"], -c["confidence"]))
    better_colleges = better_colleges[:10]
    for c in better_colleges:
        c.pop("tier_rank", None)

    upgrade_probability = _upgrade_probability(
        user_rank, predicted_next, current_from_close, records, len(better_colleges)
    )
    upgrade_zone   = _upgrade_zone(upgrade_probability)
    risk           = _seat_risk(current_from_close, user_rank)
    recommendation = _recommendation(upgrade_probability, upgrade_zone, risk,
                                     len(better_colleges), trend_word_val, next_label)

    year_breakdown = [
        {"year": r.year, "from_close": r.from_close, "to_close": r.to_close,
         "shift": r.shift, "weight": round(r.weight, 2)}
        for r in sorted(records, key=lambda x: x.year)
    ]

    return {
        "success":          True,
        "user_rank":        user_rank,
        "current_college":  current_institute,
        "category":         category,
        "quota":            quota,
        "round_analysis": {
            "avg_shift_r1_to_r2":  avg_shift,
            "min_shift":           min(shifts),
            "max_shift":           max(shifts),
            "std_dev":             round(std_dev, 1),
            "trend":               trend_word_val,
            "years_analyzed":      len(records),
            "predicted_r2_cutoff": predicted_next,
            "current_round_close": current_from_close,
            "from_round":          from_round,
            "to_round":            to_round,
            "year_wise":           year_breakdown,
            "relax_years_pct":     round(
                sum(1 for r in records if r.shift > 0) / len(records) * 100, 1
            ),
        },
        "upgrade_probability": upgrade_probability,
        "upgrade_zone":        upgrade_zone,
        "risk_of_losing_seat": risk,
        "better_colleges":     better_colleges,
        "recommendation":      recommendation,
    }


def get_upgrade_institutes(db: Session, category=None, quota=None) -> List[str]:
    q = (db.query(distinct(Cutoff.institute_name))
         .filter(Cutoff.institute_name.isnot(None), Cutoff.institute_name != ""))
    # Apply filters when provided so the dropdown only shows colleges
    # that actually have data for the selected quota / category combo.
    if not _is_all(category):
        q = q.filter(Cutoff.category == category)
    if not _is_all(quota):
        q = q.filter(Cutoff.quota == quota)
    rows = q.order_by(Cutoff.institute_name).all()
    return [r[0].strip() for r in rows if r[0]]