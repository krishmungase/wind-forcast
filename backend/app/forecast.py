"""Pick the forecast a buyer would actually have had at a given horizon."""

import pandas as pd


def latest_forecasts(forecasts: pd.DataFrame, horizon_hours: float) -> pd.DataFrame:
    """For each target startTime, the most recent forecast published at least
    `horizon_hours` before it.

    Target times with no such forecast are left out. Returns columns
    startTime, publishTime, forecast, sorted by startTime.
    """
    cutoff = forecasts["startTime"] - pd.Timedelta(hours=horizon_hours)
    eligible = forecasts[forecasts["publishTime"] <= cutoff]
    latest = (
        eligible.sort_values("publishTime")
        .drop_duplicates("startTime", keep="last")
        .sort_values("startTime")
    )
    return latest.rename(columns={"generation": "forecast"})[
        ["startTime", "publishTime", "forecast"]
    ].reset_index(drop=True)
