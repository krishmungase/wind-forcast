import math

import pandas as pd
import pytest

from app import metrics


def ts(value: str) -> pd.Timestamp:
    return pd.Timestamp(value, tz="UTC")


ACTUALS = pd.DataFrame(
    {
        "startTime": [ts("2026-01-05 10:00"), ts("2026-01-05 10:30"), ts("2026-01-05 11:00")],
        "generation": [1000.0, 1100.0, 2000.0],
    }
)
CHOSEN = pd.DataFrame(
    {
        "startTime": [ts("2026-01-05 10:00"), ts("2026-01-05 11:00")],
        "publishTime": [ts("2026-01-04 10:00"), ts("2026-01-04 10:00")],
        "forecast": [1200.0, 1700.0],
    }
)


def test_in_window_is_inclusive():
    result = metrics.in_window(ACTUALS, ts("2026-01-05 10:30"), ts("2026-01-05 11:00"))
    assert len(result) == 2


def test_pair_matches_only_hourly_slots_and_signs_error():
    paired = metrics.pair(ACTUALS, CHOSEN)
    assert len(paired) == 2  # 10:30 has no hourly forecast
    assert list(paired["error"]) == [200.0, -300.0]  # forecast - actual


def test_summarize_values():
    summary = metrics.summarize(metrics.pair(ACTUALS, CHOSEN), ACTUALS)
    assert summary["count"] == 2
    assert summary["mae"] == 250.0
    assert summary["bias"] == -50.0
    assert summary["rmse"] == pytest.approx(math.sqrt((200**2 + 300**2) / 2))
    assert summary["mean_actual"] == pytest.approx(4100 / 3)
    assert summary["normalized_mae"] == pytest.approx(250 / (4100 / 3))


def test_summarize_empty_returns_none():
    empty = metrics.pair(ACTUALS, CHOSEN.iloc[0:0])
    assert metrics.summarize(empty, ACTUALS) is None


def test_error_by_hour():
    result = metrics.error_by_hour(metrics.pair(ACTUALS, CHOSEN))
    assert list(result["hour"]) == [10, 11]
    assert list(result["mae"]) == [200.0, 300.0]
    assert list(result["count"]) == [1, 1]
