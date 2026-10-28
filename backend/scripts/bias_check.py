"""Out-of-sample check of a simple bias correction.

Learns the average forecast error (bias) on 1-15 January, subtracts it from
the forecasts for 16-31 January, and compares the typical miss before and
after. Shows whether the lean is stable enough to correct for in advance.

Run from backend/:  python scripts/bias_check.py
"""

import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import metrics  # noqa: E402
from app.data import load_actuals, load_forecasts  # noqa: E402
from app.forecast import latest_forecasts  # noqa: E402

SPLIT = pd.Timestamp("2026-01-16T00:00:00Z")


def main() -> None:
    actuals = load_actuals()
    print("horizon  bias learned  MAE 16-31 Jan  after correction  change")
    for horizon in (1, 12, 24, 36, 48):
        paired = metrics.pair(actuals, latest_forecasts(load_forecasts(), horizon))
        train = paired[paired["startTime"] < SPLIT]
        test = paired[paired["startTime"] >= SPLIT]
        bias = train["error"].mean()
        before = test["error"].abs().mean()
        after = (test["error"] - bias).abs().mean()
        print(
            f"{horizon:>5} h  {bias / 1000:>9.2f} GW  {before / 1000:>10.2f} GW"
            f"  {after / 1000:>13.2f} GW  {(after - before) / before:>+6.0%}"
        )


if __name__ == "__main__":
    main()
