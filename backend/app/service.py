"""Glue between the cached data, the pure logic modules, and the API.

Windows are inclusive [start, end] on target time. Everything returned is plain
dicts with JSON-safe values (NaN becomes None, MW rounded to 0.1).
"""

import math
from functools import cache

import pandas as pd

from app import metrics
from app.config import (
    DEFAULT_HORIZON_HOURS,
    MAX_HORIZON_HOURS,
    MIN_HORIZON_HOURS,
    TARGET_END,
    TARGET_START,
)
from app.data import load_actuals, load_forecasts
from app.forecast import latest_forecasts


def _num(value: float | None, digits: int = 1) -> float | None:
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return None
    return round(float(value), digits)


# Ratios keep more precision than MW values.
RATIO_KEYS = {"normalized_mae", "over_forecast_share"}


@cache
def chosen_forecasts(horizon: int) -> pd.DataFrame:
    """Selected forecasts for a horizon across the whole month. Static data, so cached."""
    return latest_forecasts(load_forecasts(), horizon)


def _paired(start: pd.Timestamp, end: pd.Timestamp, horizon: int) -> pd.DataFrame:
    actuals = metrics.in_window(load_actuals(), start, end)
    return metrics.pair(actuals, chosen_forecasts(horizon))


def get_meta() -> dict:
    forecasts = load_forecasts()
    return {
        "target_start": TARGET_START,
        "target_end": TARGET_END,
        "min_horizon": MIN_HORIZON_HOURS,
        "max_horizon": MAX_HORIZON_HOURS,
        "default_horizon": DEFAULT_HORIZON_HOURS,
        "actual_points": len(load_actuals()),
        "forecast_runs": forecasts["publishTime"].nunique(),
        "forecast_rows": len(forecasts),
    }


def get_series(start: pd.Timestamp, end: pd.Timestamp, horizon: int) -> list[dict]:
    """Every half-hourly actual in the window, with the chosen forecast on the hour."""
    actuals = metrics.in_window(load_actuals(), start, end)
    merged = actuals.merge(chosen_forecasts(horizon), on="startTime", how="left")
    return [
        {
            "time": row.startTime,
            "actual": _num(row.generation),
            "forecast": _num(row.forecast),
            "publish_time": None if pd.isna(row.publishTime) else row.publishTime,
        }
        for row in merged.itertuples(index=False)
    ]


def get_metrics(start: pd.Timestamp, end: pd.Timestamp, horizon: int) -> dict:
    actuals = metrics.in_window(load_actuals(), start, end)
    summary = metrics.summarize(metrics.pair(actuals, chosen_forecasts(horizon)), actuals)
    if summary is None:
        return {"horizon": horizon, "count": 0}
    return {
        "horizon": horizon,
        **{
            key: value if key == "count" else _num(value, 4 if key in RATIO_KEYS else 1)
            for key, value in summary.items()
        },
    }


def get_horizon_curve(start: pd.Timestamp, end: pd.Timestamp) -> list[dict]:
    """Error stats at each whole-hour horizon. Horizons with no paired data are skipped."""
    curve = []
    for horizon in range(MIN_HORIZON_HOURS, MAX_HORIZON_HOURS + 1):
        error = _paired(start, end, horizon)["error"]
        if error.empty:
            continue
        curve.append(
            {
                "horizon": horizon,
                "count": len(error),
                "mae": _num(error.abs().mean()),
                "rmse": _num(math.sqrt((error**2).mean())),
                "bias": _num(error.mean()),
            }
        )
    return curve


def get_error_by_hour(start: pd.Timestamp, end: pd.Timestamp, horizon: int) -> list[dict]:
    paired = _paired(start, end, horizon)
    if paired.empty:
        return []
    return [
        {
            "hour": int(row["hour"]),
            "count": int(row["count"]),
            "mae": _num(row["mae"]),
            "bias": _num(row["bias"]),
        }
        for row in metrics.error_by_hour(paired).to_dict("records")
    ]
