"""Download January 2026 wind actuals and forecasts from Elexon BMRS into backend/data/.

Run once (re-run to refresh):  python backend/scripts/fetch_data.py

The app never calls Elexon at request time; it serves these cached JSON files.
Standard library only, so it runs without installing anything.
"""

import json
import sys
import urllib.parse
import urllib.request
from datetime import UTC, datetime, timedelta
from pathlib import Path

BASE_URL = "https://data.elexon.co.uk/bmrs/api/v1/datasets"
DATA_DIR = Path(__file__).resolve().parent.parent / "data"

# Target (delivery) window: every half hour of January 2026, UTC.
TARGET_START = datetime(2026, 1, 1, tzinfo=UTC)
TARGET_END = datetime(2026, 2, 1, tzinfo=UTC)  # exclusive

# The app lets users pick a horizon of 0-48h and then takes the latest forecast published
# at least that long before the target. At 48h that forecast is older than 48h, so keep
# forecasts up to 72h ahead (WINDFOR runs reach ~66h).
MAX_HORIZON = timedelta(hours=72)

CHUNK = timedelta(days=7)


def parse_time(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def to_iso(value: datetime) -> str:
    return value.strftime("%Y-%m-%dT%H:%M:%SZ")


def get_json(dataset: str, params: dict[str, str]) -> list[dict]:
    url = f"{BASE_URL}/{dataset}/stream?{urllib.parse.urlencode(params)}"
    request = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.load(response)


def chunks(start: datetime, end: datetime):
    """Yield [from, to) windows of CHUNK size covering start..end."""
    current = start
    while current < end:
        upper = min(current + CHUNK, end)
        yield current, upper
        current = upper


def fetch_actuals() -> list[dict]:
    """FUELHH WIND rows for the target window, one per half-hour startTime."""
    latest: dict[datetime, dict] = {}
    for lower, upper in chunks(TARGET_START, TARGET_END):
        # settlementDateTo is inclusive and a date, so ask for the last day of the chunk.
        rows = get_json(
            "FUELHH",
            {
                "settlementDateFrom": lower.date().isoformat(),
                "settlementDateTo": (upper - timedelta(days=1)).date().isoformat(),
                "fuelType": "WIND",
            },
        )
        for row in rows:
            start = parse_time(row["startTime"])
            if not TARGET_START <= start < TARGET_END:
                continue
            # If a slot was republished, keep the most recent value.
            kept = latest.get(start)
            if kept is None or row["publishTime"] > kept["publishTime"]:
                latest[start] = row

    return [
        {"startTime": to_iso(start), "generation": row["generation"]}
        for start, row in sorted(latest.items())
    ]


def fetch_forecasts() -> list[dict]:
    """WINDFOR rows whose target is in the window and horizon is 0-72h."""
    seen: dict[tuple[datetime, datetime], dict] = {}
    publish_start = TARGET_START - MAX_HORIZON
    for lower, upper in chunks(publish_start, TARGET_END):
        rows = get_json(
            "WINDFOR",
            {
                "publishDateTimeFrom": to_iso(lower),
                # Stream ranges are inclusive at both ends; stop just before the next chunk.
                "publishDateTimeTo": to_iso(upper - timedelta(seconds=1)),
            },
        )
        for row in rows:
            start = parse_time(row["startTime"])
            publish = parse_time(row["publishTime"])
            horizon = start - publish
            if not TARGET_START <= start < TARGET_END:
                continue
            if not timedelta(0) <= horizon <= MAX_HORIZON:
                continue
            seen[(start, publish)] = row

    return [
        {
            "startTime": to_iso(start),
            "publishTime": to_iso(publish),
            "generation": row["generation"],
        }
        for (start, publish), row in sorted(seen.items())
    ]


def report(actuals: list[dict], forecasts: list[dict]) -> None:
    expected_slots = int((TARGET_END - TARGET_START) / timedelta(minutes=30))
    expected_hours = int((TARGET_END - TARGET_START) / timedelta(hours=1))
    actual_times = {parse_time(r["startTime"]) for r in actuals}
    missing = [
        TARGET_START + i * timedelta(minutes=30)
        for i in range(expected_slots)
        if TARGET_START + i * timedelta(minutes=30) not in actual_times
    ]
    forecast_hours = {r["startTime"] for r in forecasts}
    publishes = {r["publishTime"] for r in forecasts}
    horizons = [
        (parse_time(r["startTime"]) - parse_time(r["publishTime"])) / timedelta(hours=1)
        for r in forecasts
    ]

    print(f"Actuals:   {len(actuals)} / {expected_slots} half-hour slots")
    if missing:
        print(f"  missing {len(missing)}: {', '.join(to_iso(m) for m in missing[:10])}")
    print(f"Forecasts: {len(forecasts)} rows from {len(publishes)} forecast runs")
    print(f"  target hours covered: {len(forecast_hours)} / {expected_hours}")
    print(f"  horizon range: {min(horizons):.1f}h to {max(horizons):.1f}h")
    gens = [r["generation"] for r in actuals]
    print(f"Actual generation range: {min(gens)} to {max(gens)} MW")


def main() -> int:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    print("Fetching FUELHH (actuals)...")
    actuals = fetch_actuals()
    print("Fetching WINDFOR (forecasts)...")
    forecasts = fetch_forecasts()

    if not actuals or not forecasts:
        print("No data returned; not overwriting cache.", file=sys.stderr)
        return 1

    (DATA_DIR / "actuals.json").write_text(json.dumps(actuals, indent=1) + "\n")
    (DATA_DIR / "forecasts.json").write_text(json.dumps(forecasts, indent=1) + "\n")
    report(actuals, forecasts)
    print(f"Saved to {DATA_DIR}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
