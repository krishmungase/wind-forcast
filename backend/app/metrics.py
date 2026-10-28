"""Forecast accuracy statistics. Error is forecast − actual, so a positive bias means
the forecast promised more wind than turned up."""

import math

import pandas as pd


def in_window(frame: pd.DataFrame, start: pd.Timestamp, end: pd.Timestamp) -> pd.DataFrame:
    """Rows whose startTime is within [start, end]."""
    return frame[(frame["startTime"] >= start) & (frame["startTime"] <= end)]


def pair(actuals: pd.DataFrame, chosen: pd.DataFrame) -> pd.DataFrame:
    """Join actuals with the chosen forecasts on target time.

    Forecasts are hourly and actuals half-hourly, so only on-the-hour slots pair up.
    Returns startTime, publishTime, actual, forecast, error.
    """
    paired = actuals.rename(columns={"generation": "actual"}).merge(chosen, on="startTime")
    paired["error"] = paired["forecast"] - paired["actual"]
    return paired


def summarize(paired: pd.DataFrame, actuals: pd.DataFrame) -> dict | None:
    """Headline error stats plus how much wind could be counted on.

    `actuals` is every actual in the window (not just paired slots) and drives the
    reliability numbers. Returns None if nothing paired.
    """
    if paired.empty:
        return None
    error = paired["error"]
    abs_error = error.abs()
    mean_actual = actuals["generation"].mean()
    mae = abs_error.mean()
    return {
        "count": len(paired),
        "mae": mae,
        "rmse": math.sqrt((error**2).mean()),
        "bias": error.mean(),
        "median_abs_error": abs_error.median(),
        "p90_abs_error": abs_error.quantile(0.9),
        "error_p10": error.quantile(0.1),
        "error_p90": error.quantile(0.9),
        "normalized_mae": mae / mean_actual if mean_actual else None,
        "mean_actual": mean_actual,
        "p10_actual": actuals["generation"].quantile(0.1),
    }


def error_by_hour(paired: pd.DataFrame) -> pd.DataFrame:
    """MAE and bias per UTC hour of day: columns hour, mae, bias, count."""
    grouped = paired.assign(
        hour=paired["startTime"].dt.hour, abs_error=paired["error"].abs()
    ).groupby("hour")
    return (
        pd.DataFrame(
            {
                "mae": grouped["abs_error"].mean(),
                "bias": grouped["error"].mean(),
                "count": grouped.size(),
            }
        )
        .reset_index()
        .sort_values("hour")
    )
