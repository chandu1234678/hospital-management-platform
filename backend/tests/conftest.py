"""
Shared fixtures for all backend tests.
Uses an in-memory SQLite database — no PostgreSQL required.

Design:
- Everything is session-scoped: one DB, one client, one set of users.
- Tables created once, never dropped mid-session.
- unique_email() generates collision-free emails for per-test data.
- The dependency override is set once and never cleared during the session.
"""
import itertools
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.database import get_db
from app.models.base import Base

# ── In-memory SQLite ──────────────────────────────────────────────────────────
TEST_DB_URL = "sqlite+aiosqlite:///:memory:"
engine = create_async_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestSession = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

_counter = itertools.count(1)


def unique_email(prefix="user"):
    """Return a guaranteed-unique email for each call."""
    return f"{prefix}_{next(_counter)}@test.com"


async def _override_get_db():
    async with TestSession() as session:
        yield session


# ── Session-scoped: tables + client + shared users ────────────────────────────

@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_db():
    """Create all tables once for the entire test session."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Install the override once — never cleared during the session
    app.dependency_overrides[get_db] = _override_get_db
    yield
    app.dependency_overrides.clear()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="session")
async def client(setup_db):
    """Single long-lived HTTP client shared across all tests."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


# ── Per-test DB session ───────────────────────────────────────────────────────

@pytest_asyncio.fixture
async def db(setup_db):
    async with TestSession() as session:
        yield session


# ── Shared user fixtures ──────────────────────────────────────────────────────

async def _register_and_login(client, name, email, phone, password, role):
    """Register (idempotent) then login, return dict with token."""
    reg = await client.post("/auth/register", json={
        "name": name, "email": email, "phone": phone,
        "password": password, "role": role,
    })
    # 201 = created, 400 = already exists — both are fine
    assert reg.status_code in (201, 400), f"Unexpected register status {reg.status_code}: {reg.text}"
    login = await client.post("/auth/login", json={"email": email, "password": password})
    assert login.status_code == 200, f"Login failed for {email}: {login.text}"
    return {"email": email, "token": login.json()["access_token"]}


@pytest_asyncio.fixture(scope="session")
async def patient_user(client):
    return await _register_and_login(
        client, name="Test Patient", email="patient@test.com",
        phone="9000000001", password="testpass123", role="PATIENT",
    )


@pytest_asyncio.fixture(scope="session")
async def admin_user(client):
    return await _register_and_login(
        client, name="Test Admin", email="admin@test.com",
        phone="9000000002", password="adminpass123", role="ADMIN",
    )


@pytest_asyncio.fixture(scope="session")
async def doctor_user(client):
    return await _register_and_login(
        client, name="Dr. Test", email="doctor@test.com",
        phone="9000000003", password="doctorpass123", role="DOCTOR",
    )
