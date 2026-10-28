import pandas as pd

from app.forecast import latest_forecasts


def ts(value: str) -> pd.Timestamp:
    return pd.Timestamp(value, tz="UTC")


def frame(rows: list[tuple[str, str, float]]) -> pd.DataFrame:
    return pd.DataFrame(
        {
            "startTime": [ts(start) for start, _, _ in rows],
            "publishTime": [ts(publish) for _, publish, _ in rows],
            "generation": [generation for _, _, generation in rows],
        }
    )


FORECASTS = frame(
    [
        # Three runs for 10:00 on 3 Jan, published 48h, 24h and 2h ahead.
        ("2026-01-03 10:00", "2026-01-01 10:00", 1000.0),
        ("2026-01-03 10:00", "2026-01-02 10:00", 2000.0),
        ("2026-01-03 10:00", "2026-01-03 08:00", 3000.0),
        # One run for 11:00, published 25h ahead.
        ("2026-01-03 11:00", "2026-01-02 10:00", 4000.0),
    ]
)


def chosen(horizon: float) -> dict:
    result = latest_forecasts(FORECASTS, horizon)
    return {row.startTime: row.forecast for row in result.itertuples()}


def test_zero_horizon_takes_most_recent_run():
    assert chosen(0)[ts("2026-01-03 10:00")] == 3000.0


def test_horizon_excludes_runs_published_too_late():
    # The 2h-ahead run is too fresh for a 24h horizon; the 24h-ahead run qualifies.
    assert chosen(24)[ts("2026-01-03 10:00")] == 2000.0


def test_publish_exactly_at_cutoff_counts():
    assert chosen(48)[ts("2026-01-03 10:00")] == 1000.0


def test_target_with_no_old_enough_run_is_dropped():
    result = chosen(30)
    assert ts("2026-01-03 11:00") not in result
    assert result[ts("2026-01-03 10:00")] == 1000.0


def test_output_shape_and_order():
    result = latest_forecasts(FORECASTS, 0)
    assert list(result.columns) == ["startTime", "publishTime", "forecast"]
    assert result["startTime"].is_monotonic_increasing
    assert len(result) == 2


def test_empty_when_nothing_qualifies():
    assert latest_forecasts(FORECASTS, 100).empty
