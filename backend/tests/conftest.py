import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

BACKEND = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND))
os.chdir(BACKEND)


@pytest.fixture()
def client(tmp_path, monkeypatch):
    db_file = tmp_path / "test.db"
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_file}")

    from app.core.config import get_settings
    get_settings.cache_clear()

    from app.db import database as dbmod
    dbmod.configure_database(f"sqlite:///{db_file}")
    dbmod.init_db()

    from app.main import app
    with TestClient(app) as test_client:
        yield test_client
