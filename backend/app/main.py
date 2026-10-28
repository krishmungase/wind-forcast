"""FastAPI app. All routes live under /api so the same app works behind Vercel's
/api rewrite and locally behind the Vite dev proxy."""

import os
from dataclasses import dataclass
from datetime import datetime
from typing import Annotated

import pandas as pd
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from app import service
from app.config import (
    DEFAULT_HORIZON_HOURS,
    MAX_HORIZON_HOURS,
    MIN_HORIZON_HOURS,
    TARGET_END,
    TARGET_START,
)
from app.schemas import Health, HorizonPoint, HourPoint, Meta, Metrics, SeriesPoint

app = FastAPI(
    title="Wind Forecast Monitor API",
    version="0.1.0",
    description="UK national wind generation: actuals (FUELHH) vs forecasts (WINDFOR), "
    "January 2026.",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_methods=["GET"],
    allow_headers=["*"],
)


@dataclass(frozen=True)
class Window:
    start: pd.Timestamp
    end: pd.Timestamp


def _as_utc(value: datetime) -> pd.Timestamp:
    stamp = pd.Timestamp(value)
    return stamp.tz_localize("UTC") if stamp.tzinfo is None else stamp.tz_convert("UTC")


def time_window(
    start: Annotated[
        datetime | None, Query(description="Window start, ISO 8601 (UTC if no offset)")
    ] = None,
    end: Annotated[
        datetime | None, Query(description="Window end, inclusive, ISO 8601 (UTC if no offset)")
    ] = None,
) -> Window:
    start_ts = _as_utc(start) if start else TARGET_START
    end_ts = _as_utc(end) if end else TARGET_END
    if start_ts < TARGET_START or end_ts > TARGET_END:
        raise HTTPException(
            422,
            f"start and end must be between {TARGET_START.isoformat()} and "
            f"{TARGET_END.isoformat()}",
        )
    if start_ts >= end_ts:
        raise HTTPException(422, "start must be before end")
    return Window(start_ts, end_ts)


WindowDep = Annotated[Window, Depends(time_window)]
Horizon = Annotated[
    int,
    Query(
        ge=MIN_HORIZON_HOURS,
        le=MAX_HORIZON_HOURS,
        description="Use the latest forecast published at least this many hours before "
        "each target time",
    ),
]


@app.get("/api/health", response_model=Health)
def health():
    return {"status": "ok"}


@app.get("/api/meta", response_model=Meta)
def meta():
    return service.get_meta()


@app.get("/api/series", response_model=list[SeriesPoint])
def series(window: WindowDep, horizon: Horizon = DEFAULT_HORIZON_HOURS):
    return service.get_series(window.start, window.end, horizon)


@app.get("/api/metrics", response_model=Metrics)
def metrics(window: WindowDep, horizon: Horizon = DEFAULT_HORIZON_HOURS):
    return service.get_metrics(window.start, window.end, horizon)


@app.get("/api/horizon-curve", response_model=list[HorizonPoint])
def horizon_curve(window: WindowDep):
    return service.get_horizon_curve(window.start, window.end)


@app.get("/api/error-by-hour", response_model=list[HourPoint])
def error_by_hour(window: WindowDep, horizon: Horizon = DEFAULT_HORIZON_HOURS):
    return service.get_error_by_hour(window.start, window.end, horizon)
