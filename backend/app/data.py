"""Load the cached Elexon data (written by scripts/fetch_data.py) into DataFrames.

Files are read once per process; the data is static, so callers share the same frames
and must not mutate them.
"""

import json
from functools import cache

import pandas as pd

from app.config import DATA_DIR


def _read(name: str, time_columns: list[str]) -> pd.DataFrame:
    with open(DATA_DIR / name) as f:
        frame = pd.DataFrame(json.load(f))
    for column in time_columns:
        frame[column] = pd.to_datetime(frame[column], utc=True)
    frame["generation"] = frame["generation"].astype(float)
    return frame


@cache
def load_actuals() -> pd.DataFrame:
    """Half-hourly actual wind generation: startTime, generation (MW)."""
    return _read("actuals.json", ["startTime"])


@cache
def load_forecasts() -> pd.DataFrame:
    """Hourly wind forecasts, every run: startTime, publishTime, generation (MW)."""
    return _read("forecasts.json", ["startTime", "publishTime"])
