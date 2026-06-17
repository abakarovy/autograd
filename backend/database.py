import os

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base

from storage import is_vercel, uses_turso

_turso_url = os.getenv("TURSO_DATABASE_URL", "").strip()
_turso_token = os.getenv("TURSO_AUTH_TOKEN", "").strip()


def _create_engine():
    if uses_turso():
        url = _turso_url if _turso_url.startswith("libsql://") else f"libsql://{_turso_url}"
        return create_engine(
            f"sqlite+{url}?secure=true",
            connect_args={"auth_token": _turso_token},
            echo=False,
        )

    if is_vercel():
        db_url = "sqlite:////tmp/autograd.db"
    else:
        db_url = "sqlite:///./autograd.db"

    return create_engine(
        db_url,
        connect_args={"check_same_thread": False},
        echo=False,
    )


engine = _create_engine()

DATABASE_URL = (
    "turso"
    if uses_turso()
    else ("sqlite-tmp" if is_vercel() else "sqlite-local")
)


@event.listens_for(engine, "connect")
def _set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency: создаёт и закрывает сессию БД для каждого запроса."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
