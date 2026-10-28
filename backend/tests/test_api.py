"""End-to-end checks against the real cached January 2026 data."""

from datetime import datetime, timedelta

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

DAY = {"start": "2026-01-10T00:00:00Z", "end": "2026-01-10T23:30:00Z"}


def test_health():
    assert client.get("/api/health").json() == {"status": "ok"}


def test_meta():
    body = client.get("/api/meta").json()
    assert body["actualPoints"] == 1488
    assert body["maxHorizon"] == 48
    assert body["targetStart"].startswith("2026-01-01T00:00:00")


def test_series_has_half_hourly_actuals_and_hourly_forecasts():
    points = client.get("/api/series", params={**DAY, "horizon": 24}).json()
    assert len(points) == 48
    on_the_hour = [p for p in points if p["time"][14:16] == "00"]
    assert all(p["forecast"] is not None for p in on_the_hour)
    assert all(p["forecast"] is None for p in points if p["time"][14:16] == "30")


def test_series_forecasts_respect_horizon():
    points = client.get("/api/series", params={**DAY, "horizon": 24}).json()
    for p in points:
        if p["publishTime"]:
            target = datetime.fromisoformat(p["time"].replace("Z", "+00:00"))
            published = datetime.fromisoformat(p["publishTime"].replace("Z", "+00:00"))
            assert target - published >= timedelta(hours=24)


def test_metrics_shape():
    body = client.get("/api/metrics", params={"horizon": 24}).json()
    assert body["count"] == 744
    assert body["mae"] > 0
    assert body["rmse"] >= body["mae"]
    assert body["p10Actual"] < body["meanActual"]


def test_forecasts_get_worse_with_horizon():
    curve = client.get("/api/horizon-curve").json()
    by_horizon = {p["horizon"]: p["mae"] for p in curve}
    assert by_horizon[0] < by_horizon[24] < by_horizon[40]


def test_error_by_hour_covers_day():
    rows = client.get("/api/error-by-hour", params={"horizon": 24}).json()
    assert [r["hour"] for r in rows] == list(range(24))


@pytest.mark.parametrize(
    "params",
    [
        {"start": "2025-12-31T00:00:00Z"},
        {"end": "2026-02-02T00:00:00Z"},
        {"start": "2026-01-10T00:00:00Z", "end": "2026-01-09T00:00:00Z"},
        {"horizon": 49},
        {"horizon": -1},
    ],
)
def test_rejects_bad_input(params):
    assert client.get("/api/series", params=params).status_code == 422
