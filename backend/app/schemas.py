"""API response models. Fields are snake_case in Python and camelCase in JSON."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class Health(CamelModel):
    status: str


class Meta(CamelModel):
    target_start: datetime
    target_end: datetime
    min_horizon: int
    max_horizon: int
    default_horizon: int
    actual_points: int
    forecast_runs: int
    forecast_rows: int


class SeriesPoint(CamelModel):
    time: datetime
    actual: float | None
    forecast: float | None
    publish_time: datetime | None


class Metrics(CamelModel):
    horizon: int
    count: int
    mae: float | None = None
    rmse: float | None = None
    bias: float | None = None
    median_abs_error: float | None = None
    p90_abs_error: float | None = None
    error_p10: float | None = None
    error_p90: float | None = None
    normalized_mae: float | None = None
    mean_actual: float | None = None
    p10_actual: float | None = None


class HorizonPoint(CamelModel):
    horizon: int
    count: int
    mae: float
    rmse: float
    bias: float


class HourPoint(CamelModel):
    hour: int
    count: int
    mae: float
    bias: float
