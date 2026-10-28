"""Vercel entry point: expose the FastAPI app from backend/ as a Python function.

vercel.json rewrites every /api/* request here; the app's routes already live
under /api, so they match the original request path.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.main import app  # noqa: E402

__all__ = ["app"]
