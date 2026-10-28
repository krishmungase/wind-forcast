from pathlib import Path

import pandas as pd

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

# Delivery window covered by the cached data (UTC; the UK is on GMT in January).
TARGET_START = pd.Timestamp("2026-01-01T00:00:00Z")
TARGET_END = pd.Timestamp("2026-02-01T00:00:00Z")

# Horizon = how long before the target time the forecast must have been published.
MIN_HORIZON_HOURS = 0
MAX_HORIZON_HOURS = 48
DEFAULT_HORIZON_HOURS = 24  # roughly what the day-ahead desk sees when it buys
