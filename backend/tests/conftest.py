import os

os.environ.setdefault("DATABASE_URL", "sqlite:///./ci_test.db")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.auth import hash_password
from app.database import Base, get_db
from app.main import app
from app.models import User

TEST_DB_URL = "sqlite:///./ci_test.db"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def _reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def admin_user():
    db = TestingSessionLocal()
    user = User(
        email="admin@example.com",
        password_hash=hash_password("testpass123"),
        name="テスト管理者",
        role="admin",
    )
    db.add(user)
    db.commit()
    db.close()
    return {"email": "admin@example.com", "password": "testpass123"}


@pytest.fixture
def auth_headers(client, admin_user):
    r = client.post("/api/auth/login", json=admin_user)
    assert r.status_code == 200
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
