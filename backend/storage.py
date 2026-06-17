"""Пути к БД и файлам: локально — в проекте, на Vercel — в /tmp."""

from __future__ import annotations

import os
import shutil
from pathlib import Path

_BACKEND_DIR = Path(__file__).resolve().parent
_IS_VERCEL = os.getenv("VERCEL") == "1"


def is_vercel() -> bool:
    return _IS_VERCEL


def database_url() -> str:
    if _IS_VERCEL:
        return "sqlite:////tmp/autograd.db"
    return "sqlite:///./autograd.db"


def uploads_root() -> Path:
    if _IS_VERCEL:
        return Path("/tmp/autograd-uploads")
    return _BACKEND_DIR / "uploads"


def cars_upload_dir() -> Path:
    directory = uploads_root() / "cars"
    directory.mkdir(parents=True, exist_ok=True)
    return directory


def prepare_runtime_storage() -> None:
    """На Vercel копирует bundled БД и демо-фото в /tmp."""
    if not _IS_VERCEL:
        cars_upload_dir()
        return

    tmp_db = Path("/tmp/autograd.db")
    bundled_db = _BACKEND_DIR / "autograd.db"
    if not tmp_db.exists() and bundled_db.is_file():
        shutil.copy2(bundled_db, tmp_db)

    bundled_cars = _BACKEND_DIR / "uploads" / "cars"
    target_cars = cars_upload_dir()
    if bundled_cars.is_dir():
        for item in bundled_cars.iterdir():
            if item.is_file():
                dest = target_cars / item.name
                if not dest.exists():
                    shutil.copy2(item, dest)
